#!/bin/sh
# Builds "Steno Finger Trainer.app" in ./dist from index.html and the Swift wrapper.
set -e
cd "$(dirname "$0")"
APP="dist/Steno Finger Trainer.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp macos/Info.plist "$APP/Contents/Info.plist"
cp index.html "$APP/Contents/Resources/index.html"
swiftc -O -target "$(uname -m)-apple-macos13.0" macos/main.swift \
  -o "$APP/Contents/MacOS/StenoTrainer" -framework Cocoa -framework WebKit
codesign --force --sign - "$APP"
echo "Built $APP"
