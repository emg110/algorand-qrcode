const QRCode = require('../lib')

const path = './tmp.png'
QRCode.toFile(path, {
  wallet: 'AMESZ5UX7ZJL5M6GYEHXM63OMFCPOJ23UXCQ6CVTI2HVX6WUELYIY262WI',
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
