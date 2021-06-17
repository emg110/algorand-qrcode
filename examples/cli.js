const QRCode = require('../lib')

QRCode.toString({wallet: 'AMESZ5UX7ZJL5M6GYEHXM63OMFCPOJ23UXCQ6CVTI2HVX6WUELYIY262WI',width: 256, label: 'emg110@gmail.com'}, function (error, data) {
  if (error) {
    throw new Error(error)
  }

  console.log(data)
})
