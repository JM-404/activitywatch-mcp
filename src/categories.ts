import { readFileSync } from "node:fs";

export type CategoryMap = Record<string, string[]>;

const DEFAULT_CATEGORIES: CategoryMap = {
  coding: ["Visual Studio Code", "PyCharm", "Terminal", "iTerm2", "Cursor", "Warp", "Xcode", "IntelliJ IDEA"],
  browsing: ["Google Chrome", "Safari", "Firefox", "Arc", "Microsoft Edge"],
  communication: ["WeChat", "Slack", "Discord", "Telegram", "Messages", "Mail", "Zoom", "Microsoft Teams"],
  entertainment: ["Bilibili", "YouTube", "Spotify", "Music", "Netflix", "IINA", "VLC"],
  writing: ["Obsidian", "Notion", "Typora", "Microsoft Word", "Pages", "Bear"],
  design: ["Figma", "Sketch", "Canva", "Adobe Photoshop", "Adobe Illustrator"],
};

let _categories: CategoryMap | null = null;

export function getCategories(): CategoryMap {
  if (_categories) return _categories;

  const customPath = process.env.AW_CATEGORIES_FILE;
  if (customPath) {
    try {
      const raw = readFileSync(customPath, "utf-8");
      _categories = JSON.parse(raw) as CategoryMap;
      return _categories;
    } catch {
      // Fall through to defaults
    }
  }

  _categories = DEFAULT_CATEGORIES;
  return _categories;
}

export function getAppsForCategory(category: string): string[] | null {
  const categories = getCategories();
  const lower = category.toLowerCase();

  if (lower in categories) return categories[lower]!;

  // Check if category matches a known category name (case-insensitive)
  for (const [key, apps] of Object.entries(categories)) {
    if (key.toLowerCase() === lower) return apps;
  }

  return null;
}
