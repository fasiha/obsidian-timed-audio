/*
  Timed Audio — Obsidian plugin
  Replaces <timed-audio start="MM:SS.s" end="MM:SS.s" path="file.mp3" />
  with a play/stop button that clips the audio to [start, end].
  Only active in Reading mode (MarkdownPostProcessor).
*/

const { Plugin } = require("obsidian");

/** Parse "MM:SS.s" or "SS.s" into seconds (float). */
function parseTimestamp(ts) {
  const parts = ts.split(":");
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(ts);
}

module.exports = class TimedAudioPlugin extends Plugin {
  async onload() {
    this.registerMarkdownPostProcessor((el, ctx) => {
      el.querySelectorAll("timed-audio").forEach((tag) => {
        const start = parseTimestamp(tag.getAttribute("start") ?? "0");
        const end   = parseTimestamp(tag.getAttribute("end")   ?? "0");
        const file  = tag.getAttribute("path") ?? "";

        // Resolve the mp3 path relative to the note's directory.
        const noteDir = ctx.sourcePath.replace(/\/[^/]+$/, "");
        const vaultRelative = noteDir ? noteDir + "/" + file : file;
        const resourceUrl = this.app.vault.adapter.getResourcePath(vaultRelative);

        const btn = createEl("button", {
          text: "▶",
          cls: "timed-audio-btn",
          title: `Play ${tag.getAttribute("start")} → ${tag.getAttribute("end")}`,
        });

        let currentAudio = null;
        let stopTimer    = null;

        btn.addEventListener("click", () => {
          // If something is already playing, stop it.
          if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            return;
          }

          const audio = new Audio(resourceUrl);
          currentAudio = audio;
          audio.currentTime = start;
          audio.play();
          btn.setText("⏹");

          // Automatically stop at the end timestamp.
          stopTimer = setTimeout(() => audio.pause(), (end - start) * 1000);

          audio.addEventListener(
            "pause",
            () => {
              btn.setText("▶");
              clearTimeout(stopTimer);
            },
            { once: true }
          );
        });

        tag.replaceWith(btn);
      });
    });
  }

  onunload() {}
};
