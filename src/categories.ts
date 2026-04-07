import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type CategoryMap = Record<string, string[]>;

const DEFAULT_CATEGORIES: CategoryMap = {
  coding: ["Visual Studio Code", "PyCharm", "Terminal", "iTerm2", "Cursor", "Warp", "Xcode", "IntelliJ IDEA"],
  browsing: ["Google Chrome", "Safari", "Firefox", "Arc", "Microsoft Edge"],
  communication: ["WeChat", "Slack", "Discord", "Telegram", "Messages", "Mail", "Zoom", "Microsoft Teams"],
  entertainment: ["Bilibili", "YouTube", "Spotify", "Music", "Netflix", "IINA", "VLC"],
  writing: ["Obsidian", "Notion", "Typora", "Microsoft Word", "Pages", "Bear"],
  design: ["Figma", "Sketch", "Canva", "Adobe Photoshop", "Adobe Illustrator"],
};

const USER_CATEGORIES_DIR = join(homedir(), ".activitywatch-mcp");
const USER_CATEGORIES_FILE = join(USER_CATEGORIES_DIR, "categories.json");

let _categories: CategoryMap | null = null;

function loadCategories(): CategoryMap {
  // Priority 1: User-persisted categories (~/.activitywatch-mcp/categories.json)
  try {
    if (existsSync(USER_CATEGORIES_FILE)) {
      const raw = readFileSync(USER_CATEGORIES_FILE, "utf-8");
      return JSON.parse(raw) as CategoryMap;
    }
  } catch {
    // Fall through
  }

  // Priority 2: AW_CATEGORIES_FILE env var
  const customPath = process.env.AW_CATEGORIES_FILE;
  if (customPath) {
    try {
      const raw = readFileSync(customPath, "utf-8");
      return JSON.parse(raw) as CategoryMap;
    } catch {
      // Fall through
    }
  }

  // Priority 3: Built-in defaults
  return { ...DEFAULT_CATEGORIES };
}

export function getCategories(): CategoryMap {
  if (_categories) return _categories;
  _categories = loadCategories();
  return _categories;
}

export function setCategories(categories: CategoryMap): void {
  _categories = categories;
  // Persist to user dir
  if (!existsSync(USER_CATEGORIES_DIR)) {
    mkdirSync(USER_CATEGORIES_DIR, { recursive: true });
  }
  writeFileSync(USER_CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf-8");
}

export function getAppsForCategory(category: string): string[] | null {
  const categories = getCategories();
  const lower = category.toLowerCase();

  if (lower in categories) return categories[lower]!;

  for (const [key, apps] of Object.entries(categories)) {
    if (key.toLowerCase() === lower) return apps;
  }

  return null;
}
