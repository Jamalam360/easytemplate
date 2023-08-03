import { path } from "./deps.ts";

export type Config = {
  inputs: Input[];
  move?: {
    from: string;
    to: string;
  }[];
  exclude?: string[];
};

export type Input = InputCommon & InputType;

type InputCommon = {
  id: string;
  label: string;
  default?: string;
  only_if?: string;
};

type InputType =
  | {
      type: "options";
      options: {
        value: string;
        label: string;
      }[];
    }
  | {
      type: "string";
      regex?: string;
    }
  | {
      type: "boolean";
    };

export async function loadConfig(): Promise<Config> {
  const configPath = path.join(Deno.cwd(), "easytemplate.json");
  const config: Config = JSON.parse(await Deno.readTextFile(configPath));

  // Validation
  for (const input of config.inputs) {
    if (input.type === "options") {
      if (!input.options.find((o) => o.value === input.default)) {
        throw new Error(`Invalid default value for ${input.id}`);
      }
    } else if (input.type === "boolean") {
      if (input.default) {
        throw new Error("Boolean fields do not support defaults");
      }
    }
  }

  return config;
}
