# Timed Audio — Obsidian plugin

Play a bounded clip of a local audio file directly from a note, with one button per lyric line (or any timestamped text).

## Installation

1. Copy this folder into your vault's `.obsidian/plugins/` directory.
2. In Obsidian: Settings → Community plugins → turn off Restricted mode if needed → enable **Timed Audio**.

No build step required — the plugin is plain JavaScript.

## Usage

Place a `<timed-audio>` tag anywhere in your note:

```markdown
また夜が明ければお別れ <timed-audio start="00:04.2" end="00:07.8" path="Shiki no Uta.mp3" />
```

In **Reading mode** the tag is replaced by a small ▶ button. Click it to play the clip; click again to stop early. The button returns to ▶ automatically when the clip ends.

### Attributes

| Attribute | Format | Description |
|-----------|--------|-------------|
| `start` | `MM:SS.s` or `SS.s` | Start time in the audio file |
| `end` | `MM:SS.s` or `SS.s` | End time (playback stops here automatically) |
| `path` | filename or relative path | Audio file, resolved relative to the note's folder |

### Example file layout

```
Music/
  Shiki no Uta.md
  Shiki no Uta.mp3
```

The `path` attribute would just be `Shiki no Uta.mp3`.

## Limitations

- Reading mode only. Live Preview is not supported.
- Tested with mp3; any format your browser supports should work (m4a, ogg, wav, …).
- Sub-second seek accuracy depends on the browser's audio decoder; short clips (< 1 s) may be slightly imprecise.
