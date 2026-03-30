# Timed Audio — Obsidian plugin

Makes native `<audio>` tags with local file paths work in Obsidian reading mode, including W3C media fragment timestamps for clipping to a specific range.

## The problem

Obsidian rewrites `src` on `<img>` tags to the internal `app://` URL scheme, but does not do the same for `<audio>`. This plugin's post-processor performs that rewrite so local audio files load correctly.

## Installation

1. Copy this folder into your vault's `.obsidian/plugins/` directory.
2. In Obsidian: Settings → Community plugins → turn off Restricted mode if needed → enable **Timed Audio**.

No build step required — the plugin is plain JavaScript.

## Usage

Use `data-src` instead of `src` (to prevent the browser from resolving the path against the wrong base URL before the plugin can intercept it):

```markdown
冬を過ぎまた月日を数える <audio controls data-src="song.webm#t=47.62,52.12" />
手をつなぐ花摘みうたう <audio controls data-src="song.webm#t=58.52,60.78" />
```

In **Reading mode** each tag renders as an inline audio widget clipped to that time range. The `#t=start,end` syntax is the [W3C Media Fragments](https://www.w3.org/TR/media-frags/) standard, with times in seconds.

The `data-src` path is resolved relative to the note's folder, so the audio file should sit next to the Markdown file.

## Audio format

**Use WebM/Opus (or OGG/Opus), not MP3.**

MP3 does not support accurate random-access seeking. Browsers estimate seek positions using bitrate math, which can be off by a variable amount in either direction. WebM/Opus has a proper seek index and produces frame-accurate results.

```sh
ffmpeg -i input.mp3 -c:a libopus -b:a 96k output.webm
```

## Generating timestamps from an SRT file

If you have an SRT subtitle file (e.g. from [Whisper](https://github.com/openai/whisper) or [stable-ts](https://github.com/jianfch/stable-ts)), this script converts it to a Markdown file with one `<audio>` tag per line:

```js
#!/usr/bin/env node
// srt-to-md.mjs
// Usage: node srt-to-md.mjs <file.srt> <audio.webm> > output.md

import { readFileSync } from "fs";

const [, , srtFile, audioFile] = process.argv;
if (!srtFile || !audioFile) {
  console.error("Usage: node srt-to-md.mjs <file.srt> <audio.webm>");
  process.exit(1);
}

function srtTimeToSeconds(ts) {
  return ts.replace(",", ".").split(":").reverse()
    .reduce((acc, v, i) => acc + parseFloat(v) * 60 ** i, 0);
}

const blocks = readFileSync(srtFile, "utf8").trim().split(/\n\n+/);
for (const block of blocks) {
  const rows = block.split("\n").map((r) => r.trim());
  if (rows.length < 3 || !rows[1].includes("-->")) continue;
  const [startStr, endStr] = rows[1].split("-->").map((s) => s.trim());
  const start = srtTimeToSeconds(startStr).toFixed(3);
  const end = srtTimeToSeconds(endStr).toFixed(3);
  const text = rows.slice(2).join(" ");
  console.log(`${text} <audio controls data-src="${audioFile}#t=${start},${end}" />`);
  console.log();
}
```

## Limitations

- Reading mode only. Live Preview (CodeMirror 6) would require a separate editor extension and is not currently supported.
- `data-src` is used instead of `src` because the browser resolves `src` immediately on parse, before the post-processor runs, using the wrong base URL.
