# Timed Audio — Obsidian plugin

Play a bounded clip of a local audio file directly from a note, with one button per lyric line (or any timestamped text).

## Installation

1. Copy this folder into your vault's `.obsidian/plugins/` directory.
2. In Obsidian: Settings → Community plugins → turn off Restricted mode if needed → enable **Timed Audio**.

No build step required — the plugin is plain JavaScript.

## Usage

Place a `<span data-timed-audio>` tag anywhere in your note:

```markdown
春の風… <span data-timed-audio data-start="0:04.200" data-end="0:07.800" data-path="song.webm"></span>
夢の中で… <span data-timed-audio data-start="0:07.900" data-end="0:11.300" data-path="song.webm"></span>
```

In **Reading mode** each tag is replaced by a small ▶ button. Click it to play the clip; click again to stop early. The button returns to ▶ automatically when the clip ends.

### Attributes

| Attribute | Format | Description |
|-----------|--------|-------------|
| `data-start` | `MM:SS.SSS` or `SS.SSS` | Start time in the audio file |
| `data-end` | `MM:SS.SSS` or `SS.SSS` | End time (playback stops here automatically) |
| `data-path` | filename or relative path | Audio file, resolved relative to the note's folder |

### Example file layout

```
Music/
  lyrics.md
  song.webm
```

The `data-path` attribute would just be `song.webm`.

## Audio format

**Use WebM/Opus (or OGG/Opus), not MP3.**

MP3 does not support accurate random-access seeking. Browsers estimate the byte offset from the timestamp using bitrate math, and the estimate can be off by a variable amount in either direction — sometimes half a second early, sometimes several hundred milliseconds late. There is no way to fix this in the plugin.

WebM/Opus and OGG/Opus have a proper seek index and produce frame-accurate results. To convert:

```sh
ffmpeg -i input.mp3 -c:a libopus -b:a 96k output.webm
```

96 kbps Opus often sounds better than 128 kbps MP3 and the file will likely be smaller.

## Generating timestamps

A straightforward workflow using [stable-ts](https://github.com/jianfch/stable-ts) (Whisper-based transcription with word-level timestamps): more information forthcoming.

## Limitations

- Reading mode only. Live Preview is not supported.
- The `<span data-timed-audio>` syntax is used instead of a custom element like `<timed-audio />` because Obsidian's HTML sanitizer strips unknown element names before post-processors run; `data-*` attributes on standard elements survive.
