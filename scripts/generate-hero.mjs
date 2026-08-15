#!/usr/bin/env node

import { resolve } from "node:path";
import { loadConfig, readFlag, repositoryRoot } from "./lib/config.mjs";
import { generateHeroAssets } from "./lib/hero.mjs";

const source = readFlag("--source");
if (!source) {
  console.error("Usage: npm run generate:hero -- --source /absolute/path/to/transparent-portrait.png");
  process.exit(1);
}

try {
  const configPath = readFlag("--config");
  const config = await loadConfig(configPath);
  const manifest = await generateHeroAssets({
    config,
    sourcePath: resolve(source),
    outputDirectory: resolve(repositoryRoot, "assets/hero")
  });
  console.log(`Generated four hero assets (version ${manifest.version}).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
