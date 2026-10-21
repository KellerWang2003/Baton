#!/bin/sh
# Renders public/icon.svg into the PNG that iPhones use for Add to Home Screen
# (iOS doesn't read SVG icons). Run after swapping public/icon.svg: npm run icons
# Uses macOS's built-in sips.
set -e
cd "$(dirname "$0")/.."
sips -s format png -z 180 180 public/icon.svg --out public/apple-touch-icon.png >/dev/null
echo "Wrote public/apple-touch-icon.png from public/icon.svg"
