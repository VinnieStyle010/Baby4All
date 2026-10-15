
/* Kids4All2Learn - Dialogue Voice Link v1 */
(function () {
  "use strict";

  let enabled = true;
  let language = "nl-NL";

  function setLanguage(lang) {
    language = lang || "nl-NL";
  }

  function setEnabled(value) {
    enabled = Boolean(value);

    if (!enabled) {
      window.K4AVoices?.stop();
    }
  }

  function play(line) {
    if (!enabled || !line) return false;

    const engine = window.K4AVoices;

    if (!engine) {
      console.warn("Voice Engine ontbreekt");
      return false;
    }

    const character = String(
      line.character || line.speaker || "robo"
    ).toLowerCase();

    const text = line.text || line.message || "";

    if (typeof engine.speakLine === "function") {
      return engine.speakLine({
        character,
        text,
        audio: line.audio || null
      }, language);
    }

    return engine.speak(character, text, language);
  }

  function stop() {
    window.K4AVoices?.stop();
  }

  window.K4ADialogueVoice = {
    play,
    stop,
    setLanguage,
    setEnabled
  };

  console.log("Dialogue Voice Link geladen");
})();
