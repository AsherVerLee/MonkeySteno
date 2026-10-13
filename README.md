# Steno Finger Trainer

Practice drills for learning stenography on a regular Mac keyboard. A QWERTY
keyboard sits right under the prompt and lights up the keys, and the fingers,
for each stroke. Strokes follow the standard Plover layout.

## Files

- `steno-trainer.html` — the whole trainer: styles, lessons and logic in one page.
- `macos/main.swift` — a small native window that shows the page.
- `macos/Info.plist` — app bundle settings.
- `build.sh` — builds the Mac app.

## Build the Mac app

Needs the Xcode command line tools (`xcode-select --install`).

```sh
./build.sh
```

The app is written to `dist/Steno Finger Trainer.app`. Drag it into Applications.

## Editing lessons

Lessons live in the `LESSONS` list in `steno-trainer.html`. Each item is
`shown:STROKE` or `shown:STROKE:note`, separated by `|`.
