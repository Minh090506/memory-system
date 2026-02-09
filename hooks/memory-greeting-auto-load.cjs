#!/usr/bin/env node
/**
 * Memory Greeting Auto-Load Hook
 *
 * Detects greeting and resume patterns, instructs Claude to run /memory:load
 *
 * Triggers: UserPromptSubmit
 * Patterns: hi, morning, hello, continue, resume, xin chào, tiếp tục, etc.
 */

const fs = require('fs');

// Optional: ClaudeKit config integration (gracefully skip if not available)
let isHookEnabled;
try {
  isHookEnabled = require('./lib/ck-config-utils.cjs').isHookEnabled;
} catch (_) {
  isHookEnabled = () => true; // Default: always enabled if no config system
}

// Early exit if hook disabled
if (!isHookEnabled('memory-greeting-auto-load')) {
  process.exit(0);
}

// Greeting + resume patterns (case-insensitive)
const GREETING_PATTERNS = [
  // English greetings
  /^hi\b/i,
  /^hello\b/i,
  /^hey\b/i,
  /^morning\b/i,
  /^good\s*morning/i,
  /^start\b/i,
  /^begin\b/i,
  /^let'?s\s+(start|begin|go)/i,

  // Resume/continue patterns
  /^continue\b/i,
  /^resume\b/i,
  /^pick\s*up/i,

  // Vietnamese greetings
  /^xin\s*chào/i,
  /^chào\b/i,
  /^bắt\s*đầu/i,
  /^khởi\s*động/i,

  // Vietnamese resume
  /^tiếp\s*tục/i,
  /^tiep\s*tuc/i,

  // Short greetings (exact match to avoid false positives)
  /^hi$/i,
  /^yo$/i,
  /^hey$/i
];

// Patterns to exclude (avoid triggering on actual work prompts)
const EXCLUDE_PATTERNS = [
  /^hi.*fix/i,          // "hi, fix this bug"
  /^hello.*can you/i,   // "hello, can you help"
  /^start.*server/i,    // "start the server"
  /^start.*test/i,      // "start testing"
  /morning.*standup/i,  // "morning standup notes"
  /^continue.*test/i,   // "continue testing"
  /^resume.*download/i, // "resume download"
];

function isGreeting(prompt) {
  const trimmed = prompt.trim();

  // Skip if too long (likely a real prompt, not just a greeting)
  if (trimmed.length > 50) return false;

  // Skip if matches exclude patterns
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }

  // Check if matches any greeting/resume pattern
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  return false;
}

async function main() {
  try {
    const stdin = fs.readFileSync(0, 'utf-8').trim();
    const data = stdin ? JSON.parse(stdin) : {};
    const prompt = data.prompt || '';

    if (isGreeting(prompt)) {
      console.log(`🌅 Greeting detected! Auto-loading memory context...`);
      console.log(`\n**IMPORTANT:** Execute /memory:load skill now to load session context.`);
      console.log(`After loading, greet the user and ask what they'd like to work on.`);
    }

    process.exit(0);
  } catch (error) {
    // Silent fail - don't block on errors
    process.exit(0);
  }
}

main();
