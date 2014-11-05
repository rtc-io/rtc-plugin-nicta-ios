function FakeStream(real) {
  if (! (this instanceof FakeStream)) {
    return new FakeStream(real);
  }

  this._real = real;
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
