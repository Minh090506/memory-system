#!/usr/bin/env node
/**
 * Memory Auto-Logging Hook - PostToolUse
 * Logs skill executions to WORKLOG.md (project root)
 */

const fs = require('fs');
const path = require('path');

function getFullDateStr() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

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
    const toolName = data.tool_name || '';

    // Only log Skill tool usage
    if (toolName !== 'Skill') {
      process.exit(0);
    }

    const skillName = data.tool_input?.skill || 'unknown';
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const worklogFile = path.join(projectDir, 'WORKLOG.md');

    const dateHeader = `## ${getFullDateStr()}`;
    const timeStr = getTimeStr();
    const logEntry = `- ${timeStr} | /${skillName}: executed`;

    // Read or create WORKLOG.md
    let content = '';
    if (fs.existsSync(worklogFile)) {
      content = fs.readFileSync(worklogFile, 'utf-8');
    } else {
      const projectName = path.basename(projectDir);
      content = `# WORKLOG — ${projectName}\n`;
    }

    // Avoid duplicate entries
    if (content.includes(logEntry)) {
      process.exit(0);
    }

    // Find or create today's date section
    const dateIdx = content.indexOf(dateHeader);
    if (dateIdx !== -1) {
      // Find end of date section (next ## or end of file)
      const nextSectionIdx = content.indexOf('\n## ', dateIdx + dateHeader.length);
      const insertPos = nextSectionIdx !== -1 ? nextSectionIdx : content.length;
      // Append entry at end of date section
      content = content.slice(0, insertPos) + '\n' + logEntry + content.slice(insertPos);
    } else {
      // Create new date section at the top (after title line)
      const titleEnd = content.indexOf('\n');
      if (titleEnd !== -1) {
        content = content.slice(0, titleEnd + 1) + '\n' + dateHeader + '\n\n' + logEntry + '\n' + content.slice(titleEnd + 1);
      } else {
        content += '\n\n' + dateHeader + '\n\n' + logEntry + '\n';
      }
    }

    fs.writeFileSync(worklogFile, content);
    process.exit(0);
  } catch (error) {
    // Silent fail - don't block main workflow
    process.exit(0);
  }
}

main();
