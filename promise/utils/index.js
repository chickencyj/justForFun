const toStringEqual = (obj, str) => Object.prototype.toString.call(obj) === str

const isFunction = obj => toStringEqual(obj, '[object Function]')

const isArray = obj => toStringEqual(obj, '[object Array]')

module.exports = { isFunction, isArray }
