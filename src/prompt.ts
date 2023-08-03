import * as utils from "./utils.ts";
import type { Config, Input } from "./config.ts";
import { inq, Question } from "./deps.ts";

export function _createQuestion(input: Input): Question {
  const common = {
    name: input.id,
    message: input.label,
    default: input.default,
    when: input.only_if
      ? (answers: { [id: string]: string }) =>
        utils.evaluateExpression(answers, input.only_if!)
      : undefined,
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
  config: Config,
): Promise<{ [id: string]: string }> {
  return await inq.prompt(config.inputs.map(_createQuestion));
}
