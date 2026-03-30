/*
  Timed Audio — Obsidian plugin
  Finds <audio data-src="file.webm#t=start,end"> tags and replaces them with
  a ▶ button that plays exactly the specified clip, restartable on each click.

  Uses data-src instead of src because the browser resolves src against the
  wrong base URL before the post-processor runs. The #t=start,end fragment
  follows W3C Media Fragments syntax, with times in seconds.

  Only active in Reading mode (MarkdownPostProcessor).
*/

const { Plugin } = require("obsidian");

module.exports = class TimedAudioPlugin extends Plugin {
  async onload() {
    this.registerMarkdownPostProcessor((el, ctx) => {
      const noteDir = ctx.sourcePath.replace(/\/[^/]+$/, "");

      el.querySelectorAll("audio[data-src]").forEach((tag) => {
        const [path, fragment] = (tag.dataset.src ?? "").split("#");
        const vaultRelative = noteDir ? noteDir + "/" + path : path;
        const url = this.app.vault.adapter.getResourcePath(vaultRelative);

        const [start, end] = (fragment ?? "").replace(/^t=/, "").split(",").map(parseFloat);

        const btn = createEl("button", {
          text: "▶",
          cls: "timed-audio-btn",
          attr: { title: fragment ?? "" },
        });
        btn.style.cssText = "padding:0 0.4em;font-size:0.8em;vertical-align:middle;cursor:pointer;";

        let audio = null;
        let timer = null;

        btn.addEventListener("click", () => {
          if (audio && !audio.paused) {
            audio.pause();
            return;
          }
          clearTimeout(timer);
          audio = new Audio(url);
          audio.currentTime = start;
          audio.play();
          btn.setText("⏹");
          timer = setTimeout(() => audio.pause(), (end - start) * 1000);
          audio.addEventListener("pause", () => {
            btn.setText("▶");
            clearTimeout(timer);
          }, { once: true });
        });

        tag.replaceWith(btn);
      });
    });
  }

  onunload() {}
};
