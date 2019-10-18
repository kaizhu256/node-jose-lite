const errors = require('../errors')

const asKey = require('./index.js').asKey

const RSAKey = require('./key/rsa')
const ECKey = require('./key/ec')
const OKPKey = require('./key/okp')
const OctKey = require('./key/oct')

const generate = async (kty, crvOrSize, params, generatePrivate = true) => {
  switch (kty) {
    case 'RSA':
      return asKey(
        await RSAKey.generate(crvOrSize, generatePrivate),
        params
      )
    case 'EC':
      return asKey(
        await ECKey.generate(crvOrSize, generatePrivate),
        params
      )
    case 'OKP':
      return asKey(
        await OKPKey.generate(crvOrSize, generatePrivate),
        params
      )
    case 'oct':
      return asKey(
        await OctKey.generate(crvOrSize, generatePrivate),
        params
      )
    default:
      throw new errors.JOSENotSupported(`unsupported key type: ${kty}`)
  }
}

const generateSync = (kty, crvOrSize, params, generatePrivate = true) => {
  switch (kty) {
    case 'RSA':
      return asKey(RSAKey.generateSync(crvOrSize, generatePrivate), params)
    case 'EC':
      return asKey(ECKey.generateSync(crvOrSize, generatePrivate), params)
    case 'OKP':
      return asKey(OKPKey.generateSync(crvOrSize, generatePrivate), params)
    case 'oct':
      return asKey(OctKey.generateSync(crvOrSize, generatePrivate), params)
    default:
      throw new errors.JOSENotSupported(`unsupported key type: ${kty}`)
  }
}

module.exports.generate = generate
module.exports.generateSync = generateSync
