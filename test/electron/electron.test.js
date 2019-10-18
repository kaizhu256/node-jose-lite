const test = require('ava')

if (!('electron' in process.versions)) return

const crypto = require('crypto')

const fixtures = require('../fixtures')

;['aes128', 'aes192', 'aes256'].forEach((cipher) => {
  test(`${cipher} is not supported`, t => {
    t.false(crypto.getCiphers().includes(cipher))
  })
})

test('secp256k1 is not supported', t => {
  t.false(crypto.getCurves().includes('secp256k1'))
})

;['Ed448', 'X25519', 'X448'].forEach((okp) => {
  test(`${okp} is not supported`, t => {
    t.throws(() => {
      crypto.createPrivateKey(fixtures.PEM[okp].private)
    }, { instanceOf: Error, code: 'ERR_OSSL_EVP_UNSUPPORTED_ALGORITHM' })
  })
})
