const QRCode = require('../lib')

const path = './tmp.png'
QRCode.toFile(path, {
  wallet: 'LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q',
  width: 256,
   label: 'emg110',
  color: {
    dark: '#00F', // Blue modules
    light: '#0000' // Transparent background
  }
}, function (err) {
  if (err) throw err
  console.log('saved.')
})
