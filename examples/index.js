var quickconnect = require('rtc-quickconnect');
var media = require('rtc-media');
var qsa = require('fdom/qsa');

var plugins = [
  require('../')
];

var opts = {
  room: 'nictaios-conftest',
  plugins: plugins,
  iceServers: [
    { url: 'stun:stun.l.google.com:19302' }
  ]
};

var localMedia = media({ plugins: plugins });

function handleStreamCap(stream) {
  console.log('captured stream: ', stream);

  // render the media
  localMedia.render(document.querySelector('video.localVideo'));

  // establish connectivity
  quickconnect('http://rtc.io/switchboard/', opts)
    // broadcast our captured media to other participants in the room
    .addStream(stream)
    // when a peer is connected (and active) pass it to us for use
    .on('call:started', function(id, pc, data) {
      console.log('call started: ', pc);

      // render the remote streams
      pc.getRemoteStreams().forEach(function(stream) {
        var el = media({ stream: stream, plugins: plugins }).render(document.body);

        // set the data-peer attribute of the element
        el.dataset.peer = id;
      });
    })
    // when a peer leaves, remove the media
    .on('call:ended', function(id) {
      // remove video elements associated with the remote peer
      qsa('video[data-peer="' + id + '"]').forEach(function(el) {
        el.parentNode.removeChild(el);
      });
    });
}

require('cog/logger').enable('*');
localMedia.once('capture', handleStreamCap);
