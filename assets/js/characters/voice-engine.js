/*
 * Kids4All2Learn - Character Voice Engine v1
 * Centrale spraakmodule voor personages en avonturen.
 */
(function () {
  "use strict";

  const characters = {
    robo: { rate: 0.9, pitch: 1.05 },
    lila: { rate: 0.95, pitch: 1.15 }
  };

  const brand = /\bKids4All2Learn\b/gi;

  function prepareText(text) {
    return String(text || "").replace(
      brand,
      "Kids For All To Learn"
    );
  }

  function getVoice(language, character) {
    const voices = speechSynthesis.getVoices();
    const matching = voices.filter(v =>
      v.lang.toLowerCase().startsWith(
        language.split("-")[0].toLowerCase()
      )
    );

    if (!matching.length) return null;

    const index = character === "lila" ? 1 : 0;
    return matching[index] || matching[0];
  }

  function speak(character, text, language = "nl-NL") {
    if (!("speechSynthesis" in window)) return false;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      prepareText(text)
    );

    const profile = characters[character] || characters.robo;

    utterance.lang = language;
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;

    const voice = getVoice(language, character);
    if (voice) utterance.voice = voice;

    speechSynthesis.speak(utterance);
    return true;
  }

  function stop() {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
  }

  window.K4AVoices = {
    speak,
    stop,
    prepareText,
    characters
  };

  console.log("Kids4All2Learn Voice Engine geladen");
})();
