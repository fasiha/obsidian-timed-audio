/*
  Timed Audio — Obsidian plugin
  Fixes the src on <audio> tags so local files resolve correctly in Obsidian.
  Obsidian rewrites <img> src attributes to app:// URLs but not <audio> src.
  This post-processor does the same rewrite for audio, so standard
  W3C media fragment syntax works:
    <audio src="song.webm#t=10.48,14.76" controls></audio>
  Only active in Reading mode (MarkdownPostProcessor).
*/

const { Plugin } = require("obsidian");

module.exports = class TimedAudioPlugin extends Plugin {
  async onload() {
    this.registerMarkdownPostProcessor((el, ctx) => {
      const noteDir = ctx.sourcePath.replace(/\/[^/]+$/, "");

      // Use data-src instead of src so the browser doesn't resolve the
      // relative path against the wrong base URL before we can intercept it.
      el.querySelectorAll("audio[data-src]").forEach((audio) => {
        const src = audio.dataset.src;
        // Split off any media fragment (#t=start,end) before resolving path.
        const [path, fragment] = src.split("#");
        const vaultRelative = noteDir ? noteDir + "/" + path : path;
        const resolved = this.app.vault.adapter.getResourcePath(vaultRelative);
        audio.src = fragment ? resolved + "#" + fragment : resolved;
        audio.style.cssText = "display:inline;vertical-align:middle;height:1.8em;max-width:10rem;";
      });
    });
  }

  onunload() {}
};
