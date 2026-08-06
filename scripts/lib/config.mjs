import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryRoot = resolve(fileURLToPath(new URL("../../", import.meta.url)));
export const defaultConfigPath = resolve(repositoryRoot, "profile.config.json");

export function readFlag(name, args = process.argv.slice(2)) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function assert(condition, message) {
  if (!condition) throw new Error(`Invalid profile.config.json: ${message}`);
}

function assertText(value, label, maximum) {
  assert(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string.`);
  assert(value.length <= maximum, `${label} must be ${maximum} characters or fewer.`);
}

function assertUrl(value, label, { allowEmpty = false } = {}) {
  if (allowEmpty && value === "") return;

  try {
    new URL(value);
  } catch {
    throw new Error(`Invalid profile.config.json: ${label} must be a valid URL.`);
  }
}

export function validateConfig(config) {
  assert(config && typeof config === "object" && !Array.isArray(config), "the root must be an object.");
  assert(config.profile && typeof config.profile === "object", "profile is required.");
  assertText(config.profile.name, "profile.name", 40);
  assertText(config.profile.username, "profile.username", 39);
  assert(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(config.profile.username), "profile.username is not a valid GitHub username.");
  assertText(config.profile.headline, "profile.headline", 80);
  assertText(config.profile.affiliation, "profile.affiliation", 80);
  assertText(config.profile.location, "profile.location", 32);
  assertText(config.profile.status, "profile.status", 42);
  assert(Array.isArray(config.profile.about) && config.profile.about.length >= 1 && config.profile.about.length <= 3, "profile.about must contain 1 to 3 paragraphs.");
  config.profile.about.forEach((paragraph, index) => assertText(paragraph, `profile.about[${index}]`, 320));

  assert(config.research && typeof config.research === "object", "research is required.");
  assertText(config.research.primary, "research.primary", 28);
  assertText(config.research.direction, "research.direction", 38);
  assertText(config.research.themes, "research.themes", 46);
  assertText(config.research.narrative, "research.narrative", 420);

  assert(Array.isArray(config.focus) && config.focus.length >= 1 && config.focus.length <= 12, "focus must contain 1 to 12 items.");
  config.focus.forEach((item, index) => assertText(item, `focus[${index}]`, 40));

  assert(Array.isArray(config.projects) && config.projects.length >= 1 && config.projects.length <= 6, "projects must contain 1 to 6 items.");
  config.projects.forEach((project, index) => {
    assertText(project?.name, `projects[${index}].name`, 30);
    assertUrl(project?.url, `projects[${index}].url`);
    assertUrl(project?.homepage ?? "", `projects[${index}].homepage`, { allowEmpty: true });
    assertText(project?.focus, `projects[${index}].focus`, 44);
    assertText(project?.summary, `projects[${index}].summary`, 220);
    if (project.status !== undefined) {
      assertText(project.status, `projects[${index}].status`, 20);
    }
    assertText(project?.heroLabel, `projects[${index}].heroLabel`, 30);
    if (project.tech) {
  assert(Array.isArray(project.tech), `projects[${index}].tech must be an array.`);
}
  });

  assert(config.techStack && typeof config.techStack === "object" && !Array.isArray(config.techStack), "techStack must be an object.");
  assert(Array.isArray(config.techStack.core) && config.techStack.core.length >= 1 && config.techStack.core.length <= 8, "techStack.core must contain 1 to 8 items.");
  config.techStack.core.forEach((item, index) => assertText(item, `techStack.core[${index}]`, 30));
  assert(Array.isArray(config.techStack.groups) && config.techStack.groups.length >= 1 && config.techStack.groups.length <= 8, "techStack.groups must contain 1 to 8 groups.");
  config.techStack.groups.forEach((group, index) => {
    assert(group && typeof group === "object" && !Array.isArray(group), `techStack.groups[${index}] must be an object.`);
    assertText(group.name, `techStack.groups[${index}].name`, 24);
    assert(Array.isArray(group.items) && group.items.length >= 1 && group.items.length <= 12, `techStack.groups[${index}].items must contain 1 to 12 items.`);
    group.items.forEach((item, itemIndex) => assertText(item, `techStack.groups[${index}].items[${itemIndex}]`, 30));
  });

  if (config.learning !== undefined) {
    assert(Array.isArray(config.learning) && config.learning.length >= 1 && config.learning.length <= 12, "learning must contain 1 to 12 items.");
    config.learning.forEach((item, index) => assertText(item, `learning[${index}]`, 60));
  }

  assert(Array.isArray(config.links) && config.links.length >= 1 && config.links.length <= 4, "links must contain 1 to 4 items.");
  config.links.forEach((link, index) => {
    assertText(link?.label, `links[${index}].label`, 14);
    assertText(link?.value, `links[${index}].value`, 28);
    assertUrl(link?.url, `links[${index}].url`);
    assert(typeof link?.logo === "string" && link.logo.length <= 30, `links[${index}].logo must be 30 characters or fewer.`);
    assert(/^[A-Fa-f0-9]{6}$/.test(link?.color), `links[${index}].color must be a six-character hex value without #.`);
  });

  assert(config.activity && typeof config.activity.enabled === "boolean", "activity.enabled must be true or false.");
  assert(Number.isInteger(config.activity.limit) && config.activity.limit >= 1 && config.activity.limit <= 10, "activity.limit must be between 1 and 10.");
  assert(["signal", "ocean", "solar", "github"].includes(config.appearance?.palette), "appearance.palette must be signal, ocean, solar, or github.");
  assertText(config.footer, "footer", 120);

  return config;
}

export async function loadConfig(configPath = defaultConfigPath) {
  const resolvedPath = resolve(configPath);
  let raw;

  try {
    raw = await readFile(resolvedPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") throw new Error(`Configuration file not found: ${resolvedPath}`);
    throw error;
  }

  let config;
  try {
    config = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Could not parse ${resolvedPath}: ${error.message}`);
  }

  return validateConfig(config);
}
