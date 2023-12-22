import * as utils from "./utils.ts";
import type { Config, Input } from "./config.ts";
import { inq, Question } from "./deps.ts";

interface CliArgs {
  debug: boolean;
  disableInteractiveMode: boolean;
  inputs: { [id: string]: string };
}

export const args = parseArgs(Deno.args);

function parseArgs(args: string[]): CliArgs {
  let debug = false;
  let disableInteractiveMode = false;
  const inputs: { [id: string]: string } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--debug") {
      debug = true;
    } else if (arg === "--disable-interactive-mode") {
      disableInteractiveMode = true;
    } else if (arg === "--input") {
      const input = args[++i];
      let [id, value] = input.split("=");

      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      inputs[id] = value;
    } else {
      throw new Error(`Unknown argument ${arg}`);
    }
  }

  return {
    debug,
    disableInteractiveMode,
    inputs,
  };
}

function createQuestion(input: Input): Question {
  const common = {
    name: input.id,
    message: input.label,
    default: input.default,
  };

  let typed;

  switch (input.type) {
    case "options": {
      typed = {
        type: "list",
        choices: input.options.map((o) => ({ name: o.label, value: o.value })),
      };
      break;
    }
    case "string": {
      typed = {
        type: "string",
        validate: (e: string) => {
          if (input.regex) {
            if (e.match(input.regex)) {
              return true;
            } else {
              return `Invalid input. Must match regex ${input.regex}`;
            }
          } else {
            return true;
          }
        },
      };
      break;
    }
    case "boolean": {
      typed = {
        type: "confirm",
      };
    }
  }

  return { ...common, ...typed };
}

export async function getInputs(
  config: Config
): Promise<{ [id: string]: string | boolean }> {
  const result = {} as { [id: string]: string | boolean };

  for (const input of config.inputs) {
    if (input.only_if) {
      if (args.debug) {
        console.log(`Evaluating ${input.id}.only_if`);
      }

      if (!utils.evaluateExpression(result, input.only_if)) {
        if (args.debug) {
          console.log(`Skipping input ${input.id}`);
        }

        continue;
      }
    }

    if (input.default) {
      result[input.id] = input.default;
    }

    if (args.inputs[input.id]) {
      if (args.debug) {
        console.log(`Using input ${input.id} from CLI args`);
      }

      result[input.id] = args.inputs[input.id];
    } else if (!args.disableInteractiveMode) {
      if (args.debug) {
        console.log(`Using input ${input.id} from interactive mode`);
      }

      const answer = await inq.prompt([createQuestion(input)]);
      result[input.id] = answer[input.id];
    } else {
      throw new Error(
        `Missing input ${input.id}, but interactive mode is disabled`
      );
    }

    if (input.type === "string" && input.regex) {
      if (args.debug) {
        console.log(`Validating ${input.id}`);
      }

      if (!(result[input.id] as string).match(input.regex)) {
        throw new Error(
          `Invalid input for ${input.id}. Must match regex ${input.regex}`
        );
      }
    }

    if (input.type === "boolean" && typeof result[input.id] === "string") {
      result[input.id] = result[input.id] === "true";
    }

    if (input.type === "options") {
      const option = input.options.find((o) => o.value === result[input.id]);

      if (!option) {
        throw new Error(
          `Invalid input for ${input.id}. Must be one of ${input.options
            .map((o) => o.value)
            .join(", ")}`
        );
      }
    }

    if (args.debug) {
      console.log(`Input ${input.id} = ${result[input.id]}`);
    }

    if (result[input.id] === undefined) {
      throw new Error(`Missing input ${input.id}`);
    }
  }

	if (args.debug) {
		console.log(result);
	}
		
  return result;
}
