
/* Kids4All2Learn - Character Voice Engine v2 */
(function () {
  "use strict";

  const characters = {
    robo: { rate: 0.9, pitch: 1.05 },
    lila: { rate: 0.95, pitch: 1.15 }
  };

  let activeAudio = null;
  let activeUtterance = null;
  let playbackId = 0;

  function prepareText(text) {
    return String(text || "").replace(
      /\bKids4All2Learn\b/gi,
      "Kids For All To Learn"
    );
  }

  function stop() {
    playbackId++;

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }

    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    activeUtterance = null;
  }

  function getVoice(language, character) {
    const voices = speechSynthesis.getVoices();
    const matches = voices.filter(v =>
      v.lang.toLowerCase().startsWith(
        language.split("-")[0].toLowerCase()
      )
    );

    return matches[character === "lila" ? 1 : 0]
      || matches[0]
      || null;
  }

  function speak(character, text, language = "nl-NL") {
    stop();

    if (!("speechSynthesis" in window)) {
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(
      prepareText(text)
    );

    const profile = characters[character] || characters.robo;
    utterance.lang = language;
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;

    const voice = getVoice(language, character);
    if (voice) utterance.voice = voice;

    activeUtterance = utterance;
    speechSynthesis.speak(utterance);
    return true;
  }

  async function speakLine(line, language = "nl-NL") {
    if (!line) return false;

    stop();
    const currentId = playbackId;
    const lang = language.toLowerCase();

    if (line.audio && lang.startsWith("nl")) {
      const audio = new Audio(
        new URL(line.audio, document.baseURI).href
      );

      activeAudio = audio;

      try {
        await audio.play();
        if (currentId !== playbackId) {
          audio.pause();
          return false;
        }
        return true;
      } catch (error) {
        if (currentId !== playbackId) return false;
        activeAudio = null;
        console.warn("Audio niet beschikbaar:", error);
      }
    }

    if (currentId !== playbackId) return false;

    return speak(
      line.character || "robo",
      line.text || "",
      language
    );
  }

  window.K4AVoices = {
    speak,
    speakLine,
    stop,
    prepareText,
    characters
  };

  console.log("Kids4All2Learn Voice Engine v2 geladen");
})();
