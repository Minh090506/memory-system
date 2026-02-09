#!/usr/bin/env node
/**
 * Memory Session End Detector Hook - UserPromptSubmit
 * Detects "bye", "done", "/clear", "/compact" to trigger session save/flush
 */

const fs = require('fs');
const path = require('path');

function getTimeStr() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
}

function main() {
  try {
    const stdin = fs.readFileSync(0, 'utf-8').trim();
    if (!stdin) {
      process.exit(0);
    }

    const data = JSON.parse(stdin);
    const userPrompt = (data.prompt || '').toLowerCase().trim();

    // Session end keywords → trigger full flush
    const endKeywords = ['bye', 'done', 'xong', 'tam biet', 'tạm biệt', 'goodbye', 'end session'];
    const isEndSession = endKeywords.some(kw => userPrompt === kw || userPrompt.startsWith(kw + ' '));

    // Save keywords → auto-save before action
    const saveKeywords = ['/clear', 'clear', '/compact', 'compact', 'kết thúc'];
    const isSaveAction = saveKeywords.some(kw => userPrompt === kw || userPrompt.startsWith(kw + ' '));

    if (!isEndSession && !isSaveAction) {
      process.exit(0);
    }

    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const worklogFile = path.join(projectDir, 'WORKLOG.md');
    const timeStr = getTimeStr();

    if (isSaveAction) {
      // Auto-save before /clear or /compact
      console.log('[Memory] Auto-save triggered before ' + userPrompt);
      console.log('**IMPORTANT:** Update SESSION.md and append to WORKLOG.md before proceeding with ' + userPrompt);
    }

    if (isEndSession) {
      // Append end marker to WORKLOG.md
      if (fs.existsSync(worklogFile)) {
        let content = fs.readFileSync(worklogFile, 'utf-8');
        const endMarker = `\n--- Session ended ${timeStr} ---\n`;
        if (!content.includes('Session ended ' + timeStr)) {
          content += endMarker;
          fs.writeFileSync(worklogFile, content);
        }
      }

      console.log('[Memory] Session end detected.');
      console.log('**IMPORTANT:** Run /memory:flush to save session state and archive.');
    }

    process.exit(0);
  } catch (error) {
    process.exit(0);
  }
}

main();
