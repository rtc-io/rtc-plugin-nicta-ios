var append = require('fdom/append');
var capture = require('rtc-capture');
var attach = require('rtc-attach');
var kgo = require('kgo');

// require the mocks
require('./mock-environment');

kgo({
  constraints: { video: true, audio: true },
  options: {
    plugins: [
      require('../')
    ]
  }
})
('capture', [ 'constraints', 'options' ], capture)
('attach', [ 'capture', 'options' ], attach.local)
('render-local', [ 'attach' ], append.to(document.body))
.on('error', console.error.bind(console));
