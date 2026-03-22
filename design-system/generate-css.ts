/**
 * Design System CSS Generator
 *
 * Reads tokens.ts and generates CSS custom properties in app/globals.css
 * between marker comments. Supports --check flag for CI validation.
 *
 * Usage:
 *   tsx design-system/generate-css.ts          # Generate/update globals.css
 *   tsx design-system/generate-css.ts --check   # Check if globals.css is up to date
 */

import * as fs from "fs";
import * as path from "path";
import { tokens } from "./tokens";
import { tokenKeyToCssVar, sidebarKeyToCssVar } from "./utils";

const START_MARKER = "/* DESIGN-TOKENS-START */";
const END_MARKER = "/* DESIGN-TOKENS-END */";
const GLOBALS_PATH = path.resolve(__dirname, "..", "app", "globals.css");

function generateCssVars(): string {
  const lines: string[] = [];

  lines.push("  :root {");

  for (const [key, value] of Object.entries(tokens)) {
    if (key === "sidebar") continue; // Handle sidebar separately

    const cssVar = tokenKeyToCssVar(key);
    lines.push(`    ${cssVar}: ${value};`);
  }

  // Sidebar tokens
  if (tokens.sidebar) {
    for (const [key, value] of Object.entries(tokens.sidebar)) {
      const cssVar = sidebarKeyToCssVar(key);
      lines.push(`    ${cssVar}: ${value};`);
    }
  }

  lines.push("  }");

  return lines.join("\n");
}

function run(): void {
  const isCheck = process.argv.includes("--check");
  const generatedBlock = generateCssVars();
  const fullBlock = `${START_MARKER}\n${generatedBlock}\n${END_MARKER}`;

  if (!fs.existsSync(GLOBALS_PATH)) {
    console.error(`Error: ${GLOBALS_PATH} not found`);
    process.exit(1);
  }

  const currentContent = fs.readFileSync(GLOBALS_PATH, "utf-8");

  const startIdx = currentContent.indexOf(START_MARKER);
  const endIdx = currentContent.indexOf(END_MARKER);

  let newContent: string;

  if (startIdx !== -1 && endIdx !== -1) {
    // Replace existing block
    const before = currentContent.slice(0, startIdx);
    const after = currentContent.slice(endIdx + END_MARKER.length);
    newContent = before + fullBlock + after;
  } else {
    // Insert before first :root or at beginning of file
    const rootIdx = currentContent.indexOf(":root");
    if (rootIdx !== -1) {
      // Find the entire :root block and replace it
      const braceStart = currentContent.indexOf("{", rootIdx);
      const braceEnd = findMatchingBrace(currentContent, braceStart);
      const before = currentContent.slice(0, rootIdx);
      const after = currentContent.slice(braceEnd + 1);
      newContent = before + fullBlock + after;
    } else {
      // Insert after @import statements
      const lines = currentContent.split("\n");
      let insertAfterLine = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("@import")) {
          insertAfterLine = i + 1;
        }
      }
      lines.splice(insertAfterLine, 0, "", fullBlock);
      newContent = lines.join("\n");
    }
  }

  if (isCheck) {
    if (currentContent === newContent) {
      console.log("Design tokens are up to date.");
      process.exit(0);
    } else {
      console.error(
        "Design tokens are out of date. Run `npm run tokens` to update."
      );
      process.exit(1);
    }
  }

  fs.writeFileSync(GLOBALS_PATH, newContent, "utf-8");
  console.log("Design tokens written to app/globals.css");
}

function findMatchingBrace(str: string, openPos: number): number {
  let depth = 0;
  for (let i = openPos; i < str.length; i++) {
    if (str[i] === "{") depth++;
    if (str[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return str.length - 1;
}

run();
