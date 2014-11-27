function FakeStream(real, opts) {
  if (! (this instanceof FakeStream)) {
    return new FakeStream(real, opts);
  }

  this._real = real;
  this.muted = (opts || {}).muted;
}

module.exports = FakeStream;
var prot = FakeStream.prototype;

Object.defineProperty(prot, 'id', {
  get: function() {
    return this._real.id;
  }
});

prot.getVideoTracks = function() {
  return this._real.getVideoTracks();
};

prot.getAudioTracks = function() {
  return this._real.getAudioTracks();
};
