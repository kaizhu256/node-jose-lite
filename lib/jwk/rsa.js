const { generateKeyPairSync, generateKeyPair: async } = require('crypto')
const { promisify } = require('util')

const {
    THUMBPRINT_MATERIAL, JWK_MEMBERS, PUBLIC_MEMBERS,
    PRIVATE_MEMBERS, KEY_MANAGEMENT_DECRYPT, KEY_MANAGEMENT_ENCRYPT
} = require('../help/consts')
const { oaepHashSupported, keyObjectSupported } = require('../help/runtime_support')
const { createPublicKey, createPrivateKey } = require('../help/key_object')

const Key = require('./base')

const generateKeyPair = promisify(async)

const SIG_ALGS = ['PS256', 'RS256', 'PS384', 'RS384', 'PS512', 'RS512']
const WRAP_ALGS = ['RSA-OAEP', 'RSA1_5']

const RSA_PUBLIC = new Set(['e', 'n'])
Object.freeze(RSA_PUBLIC)
const RSA_PRIVATE = new Set([...RSA_PUBLIC, 'd', 'p', 'q', 'dp', 'dq', 'qi'])
Object.freeze(RSA_PRIVATE)

// RSA Key Type
class RSAKey extends Key {
    constructor (...args) {
        super(...args)
        this[JWK_MEMBERS]()
        Object.defineProperties(this, {
            kty: {
                value: 'RSA',
                enumerable: true
            },
            length: {
                configurable: true
            }
        })
    }

    static get [PUBLIC_MEMBERS] () {
        return RSA_PUBLIC
    }

    static get [PRIVATE_MEMBERS] () {
        return RSA_PRIVATE
    }
}

module.exports = RSAKey
