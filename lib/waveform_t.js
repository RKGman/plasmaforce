function Microphone(_fft) {
  var FFT_SIZE = _fft || 1024;
  this.spectrum = [];
  this.volume = this.vol = 0;
  this.peak_volume = 0;
  var self = this;
  var audioContext = new AudioContext();
  var SAMPLE_RATE = audioContext.sampleRate;

  // this is just a browser check to see
  // if it supports AudioContext and getUserMedia
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia;  // now just wait until the microphone is fired up

  window.addEventListener('load', init, false); function init() {
    try {
      startMic(new AudioContext());
    }
    catch (e) {
      console.error(e);
      alert('Web Audio API is not supported in this browser');
    }
  }

  function startMic(context) {
    navigator.mediaDevices.getUserMedia({ audio: true }, processSound, error); function processSound(stream) {     // analyser extracts frequency, waveform, etc.
      var analyser = context.createAnalyser();
      analyser.smoothingTimeConstant = 0.2;
      analyser.fftSize = FFT_SIZE; var node = context.createScriptProcessor(FFT_SIZE * 2, 1, 1); node.onaudioprocess = function () {       // bitcount returns array which is half the FFT_SIZE
        self.spectrum = new Uint8Array(analyser.frequencyBinCount);       // getByteFrequencyData returns amplitude for each bin
        analyser.getByteFrequencyData(self.spectrum);
        // getByteTimeDomainData gets volumes over the sample time
        // analyser.getByteTimeDomainData(self.spectrum);

        self.vol = self.getRMS(self.spectrum);
        // get peak - a hack when our volumes are low
        if (self.vol > self.peak_volume) self.peak_volume = self.vol;
        self.volume = self.vol;
      }; var input = context.createMediaStreamSource(stream);
      input.connect(analyser);
      analyser.connect(node);
      node.connect(context.destination);
    } function error() {
      console.log(arguments);
    }
  }

  //////// SOUND UTILITIES  ///////////// ..... we going to put more stuff here....
  return this;
}

var Mic = new Microphone();