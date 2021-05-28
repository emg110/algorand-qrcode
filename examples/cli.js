const QRCode = require('../lib')

QRCode.toString({wallet: 'LP6QRRBRDTDSP4HF7CSPWJV4AG4QWE437OYHGW7K5Y7DETKCSK5H3HCA7Q',width: 256, label: 'emg110@gmail.com'}, function (error, data) {
  if (error) {
    throw new Error(error)
  }

  console.log(data)
})
