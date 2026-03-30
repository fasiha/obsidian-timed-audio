/*
  Timed Audio — Obsidian plugin
  Replaces <span data-timed-audio data-start="MM:SS.s" data-end="MM:SS.s" data-path="file.mp3"></span>
  with a play/stop button that clips the audio to [start, end].
  Only active in Reading mode (MarkdownPostProcessor).

  NOTE: Custom HTML elements like <timed-audio> are stripped by Obsidian's
  sanitizer before post-processors run. Using <span data-timed-audio> instead
  because data-* attributes on known elements survive sanitization.
*/

const { Plugin } = require("obsidian");

const TAG = "timed-audio";

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
    console.log(`[${TAG}] plugin loaded`);

    this.registerMarkdownPostProcessor((el, ctx) => {
      el.querySelectorAll("[data-timed-audio]").forEach((tag) => {
        const startAttr = tag.dataset.start ?? "0";
        const endAttr   = tag.dataset.end   ?? "0";
        const start     = parseTimestamp(startAttr);
        const end       = parseTimestamp(endAttr);

        const noteDir = ctx.sourcePath.replace(/\/[^/]+$/, "");
        const vaultRelative = noteDir ? noteDir + "/" + (tag.dataset.path ?? "") : (tag.dataset.path ?? "");
        const resourceUrl = this.app.vault.adapter.getResourcePath(vaultRelative);

        const btn = createEl("button", {
          text: "▶",
          cls: "timed-audio-btn",
          title: `Play ${startAttr} → ${endAttr}`,
        });

        let audio = null;

        btn.addEventListener("click", () => {
          if (audio && !audio.paused) {
            audio.pause();
            return;
          }
          audio = new Audio(resourceUrl);
          audio.currentTime = start;
          audio.play();
          btn.setText("⏹");
          setTimeout(() => audio.pause(), (end - start) * 1000);
          audio.addEventListener("pause", () => btn.setText("▶"), { once: true });
        });

        tag.replaceWith(btn);
      });
    });
  }

  onunload() {}
};
