#!/bin/sh
# Starts the Playwright MCP server. In Claude Code cloud sessions it uses the
# preinstalled Chromium; elsewhere Playwright picks its own browser.
set -eu
if [ -x /opt/pw-browsers/chromium ]; then
  exec npx -y @playwright/mcp@0.0.83 --headless --isolated \
    --browser chromium --executable-path /opt/pw-browsers/chromium "$@"
fi
exec npx -y @playwright/mcp@0.0.83 --isolated "$@"
