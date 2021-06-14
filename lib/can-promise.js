module.exports = function () {
  return typeof Promise === 'function' && Promise.prototype && Promise.prototype.then
}
