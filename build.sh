#!/bin/sh
# Builds "Steno Finger Trainer.app" in ./dist from steno-trainer.html and the Swift wrapper.
set -e
cd "$(dirname "$0")"
APP="dist/Steno Finger Trainer.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp macos/Info.plist "$APP/Contents/Info.plist"
{
  printf '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}[hidden]{display:none!important}</style>\n'
  cat steno-trainer.html
  printf '\n</html>\n'
} > "$APP/Contents/Resources/index.html"
swiftc -O -target "$(uname -m)-apple-macos13.0" macos/main.swift \
  -o "$APP/Contents/MacOS/StenoTrainer" -framework Cocoa -framework WebKit
codesign --force --sign - "$APP"
echo "Built $APP"
