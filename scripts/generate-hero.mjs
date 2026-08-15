#!/usr/bin/env node

import { resolve } from "node:path";
import { loadConfig, readFlag, repositoryRoot } from "./lib/config.mjs";
import { generateHeroAssets } from "./lib/hero.mjs";

try {
  const configPath = readFlag("--config");
  const config = await loadConfig(configPath);
  const manifest = await generateHeroAssets({
    config,
    outputDirectory: resolve(repositoryRoot, "assets/hero")
  });
  console.log(`Generated four hero assets (version ${manifest.version}).`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
