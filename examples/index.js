// enable logging
require('cog/logger').enable('*');

var plugins = [
  require('../')
];

var qsa = require('fdom/qsa');
var media = require('rtc-media');
var quickconnect = require('rtc-quickconnect');

// capture media
media({ plugins: plugins })
  .on('error', function(err) {
    console.log('captured error: ', err);
  })
  .once('capture', function(stream) {
    quickconnect('http://rtc.io/switchboard', { room: 'iostest', plugins: plugins })
      .addStream(stream)
      .on('call:started', function(id, pc) {
        console.log('got remote connection from peer: ' + id);
        pc.getRemoteStreams().forEach(function(remoteStream) {
          var el = media(remoteStream).render(document.body);
          el.dataset.peerId = id;
        });
      })
      .on('call:ended', function(id) {
        console.log('called ended with peer: ' + id);
        qsa('*[data-peer-id="' + id + '"]').forEach(function(el) {
          el.parentNode.removeChild(el);
        });
      });
  })
  .render(document.querySelector('.localVideo'));
