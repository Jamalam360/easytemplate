import { Config, loadConfig } from "./config.ts";
import { getInputs, args } from "./cli.ts";
import { path } from "./deps.ts";
import { render, renderPath } from "./handlebars.ts";
import { readDirRecursive, safeCopy, safeRename } from "./utils.ts";

export async function main() {
  let config: Config;

  try {
    config = await loadConfig();
  } catch (e) {
    console.log("Failed to load easytemplate.json - is this a template directory?");
    console.error(e.message);
    return;
  }

  const ctx = await getInputs(config);
  const exclude = (config.exclude || []).map((g) => path.globToRegExp(g, { extended: true, globstar: true }));
  const ignore = (config.ignore || []).map((g) => path.globToRegExp(g, { extended: true, globstar: true }));
  exclude.push(/easytemplate\.json/);
  const backupPath = "./backup";
  await Deno.mkdir(backupPath, { recursive: true });

  for (let { path: entry, text } of await readDirRecursive(Deno.cwd(), exclude)) {
    await safeCopy(entry, path.join(backupPath, entry));

    if (args.debug) {
      console.log(`Processing ${entry}`);
    }

    let newPath = entry;

    if (entry.endsWith(".easytemplate")) {
      newPath = entry.slice(0, -".easytemplate".length);
    }

    newPath = renderPath(newPath, ctx);

    await safeRename(entry, newPath);
    entry = newPath;

    if (ignore.some((g) => g.test(entry))) {
      if (args.debug) {
        console.log(`Deleting ${entry}`);
      }

      await Deno.remove(entry);
      continue;
    }

    if (text) {
      await Deno.writeTextFile(entry, render(await Deno.readTextFile(entry), ctx));
    }
  }

  for (const { from, to } of config.move || []) {
    await safeRename(from, to);
  }

  try {
    const gitignore = await Deno.readTextFile(".gitignore");
    await Deno.writeTextFile(".gitignore", gitignore + "\nbackup");
  } catch (_) {
    // ignored
  }

  await safeRename("./easytemplate.json", path.join(backupPath, "easytemplate.json"));

  console.log("EasyTemplate finished! A backup has been written to ./backup");
  console.log("Remember to remove it when you're ready! We have added it to your .gitignore as a precaution.");
  Deno.exit(0);
}
