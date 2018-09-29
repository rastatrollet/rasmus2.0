/*
 * Check for browser support
 */

const isSupported = 'speechSynthesis' in window;
let voices;
let selectedVoice;

// Fetch the list of voices and populate the voice options.
function loadVoices() {
  // Fetch the available voices.
  voices = window.speechSynthesis.getVoices();
  selectedVoice = voices.find((voice) => /Alva/i.test(voice.name));
  // Loop through each of the voices.
}

// Execute loadVoices.
if (isSupported) loadVoices();

// Chrome loads voices asynchronously.
window.speechSynthesis.onvoiceschanged = loadVoices;

// Create a new utterance for the specified text and add it to
// the queue.
export function speak(text) {
  if (!isSupported) return;
  // Create a new instance of SpeechSynthesisUtterance.
  var msg = new SpeechSynthesisUtterance();

  // Set the text.
  msg.text = text;

  // Set the attributes.
  msg.volume = 1;
  msg.rate = 0.9;
  msg.pitch = 1;

  // If a voice has been selected, find the voice and set the
  // utterance instance's voice attribute.
  if (!selectedVoice) {
    console.log('Could not select voice');
  } else {
    msg.voice = selectedVoice;
  }

  // Queue this utterance.
  window.speechSynthesis.speak(msg);
}

export default {
  speak
};
