import Handlebars from "npm:handlebars";
import * as path from "https://deno.land/std@0.197.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.197.0/assert/mod.ts";
import { describe, it } from "https://deno.land/std@0.197.0/testing/bdd.ts";
import isProbablyBinaryPath from "npm:is-binary-path";
import inq from "npm:inquirer";
import type { Question } from "npm:@types/inquirer";

export {
  Handlebars,
  path,
  isProbablyBinaryPath,
  inq,
  describe,
  it,
  assertEquals,
};
export type { Question };
