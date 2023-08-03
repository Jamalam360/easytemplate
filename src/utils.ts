import { isProbablyBinaryPath, path } from "./deps.ts";
import { debug } from "./main.ts";

export async function readDirRecursive(
  dir: string,
  exclude: RegExp[],
): Promise<{ path: string; text: boolean }[]> {
  const entries = [];
  for await (const entry of Deno.readDir(dir)) {
    const entryPath = path.join(dir, entry.name);

    if (exclude.some((e) => e.test(entry.name))) {
      continue;
    }

    if (entry.isDirectory) {
      entries.push(...(await readDirRecursive(entryPath, exclude)));
    } else {
      if (isProbablyBinaryPath(entryPath)) {
        if (debug) {
          console.log(
            `Skipping ${entryPath} because it doesn't look like a text file`,
          );
        }

        entries.push({ path: entryPath, text: false });
      } else {
        entries.push({ path: entryPath, text: true });
      }
    }
  }

  return entries.map((e) => {
    return {
      path: path.relative(Deno.cwd(), e.path),
      text: e.text,
    };
  });
}

export async function safeCopy(from: string, to: string) {
  await Deno.mkdir(path.dirname(to), { recursive: true });
  await Deno.copyFile(from, to);
}

export async function safeRename(from: string, to: string) {
  await Deno.mkdir(path.dirname(to), { recursive: true });
  await Deno.rename(from, to);
  const dir = path.dirname(from);

  for await (const _ of Deno.readDir(dir)) {
    return;
  }

  await Deno.remove(dir);
}

export function evaluateExpression(
  ctx: { [id: string]: string },
  expr: string,
): boolean {
  const keys = Object.keys(ctx);
  const values = Object.values(ctx);
  const exprFn = new Function(...keys, `return ${expr}`);
  return exprFn(...values);
}
