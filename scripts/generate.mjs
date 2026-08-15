#!/usr/bin/env node

import { resolve } from "node:path";
import { loadConfig, readFlag, repositoryRoot } from "./lib/config.mjs";
import { generateHeroAssets } from "./lib/hero.mjs";
import { generateProfileReadme } from "./lib/readme.mjs";

const source = readFlag("--source");
if (!source) {
  console.error("Usage: npm run generate -- --source /absolute/path/to/transparent-portrait.png");
  process.exit(1);
}

try {
  const config = await loadConfig(readFlag("--config"));
  const manifest = await generateHeroAssets({
    config,
    sourcePath: resolve(source),
    outputDirectory: resolve(repositoryRoot, "assets/hero")
  });
  await generateProfileReadme({ config, manifest, readmePath: resolve(repositoryRoot, "README.md") });
  console.log(`Profile generated successfully (asset version ${manifest.version}).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
