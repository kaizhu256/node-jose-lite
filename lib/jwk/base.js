const { strict: assert } = require('assert')
const { inspect } = require('util')
const { EOL } = require('os')
const { keyObjectSupported } = require('../help/runtime_support')
const { createPublicKey } = require('../help/key_object')
const { keyObjectToJWK } = require('../help/key_utils')
const {
    THUMBPRINT_MATERIAL, PUBLIC_MEMBERS, PRIVATE_MEMBERS, JWK_MEMBERS, KEYOBJECT,
    USES_MAPPING, OPS, USES
} = require('../help/consts')
const isObject = require('../help/is_object')
const errors = require('../errors')
class Key {
    constructor (keyObject, { alg, use, kid, key_ops: ops, x5c, x5t, 'x5t#S256': x5t256 } = {}) {
        Object.defineProperties(this, {
            [KEYOBJECT]: { value: isObject(keyObject) ? undefined : keyObject },
            type: { value: keyObject.type },
            private: { value: keyObject.type === 'private' },
            public: { value: keyObject.type === 'public' },
            secret: { value: keyObject.type === 'secret' },
            alg: { value: alg, enumerable: alg !== undefined },
            use: { value: use, enumerable: use !== undefined },
            x5c: { value: x5c, enumerable: x5c !== undefined },
            thumbprint: {
                configurable: true
            }
        })
    }
    [JWK_MEMBERS] () {
        const props = this[KEYOBJECT].type === 'private' ? this.constructor[PRIVATE_MEMBERS] : this.constructor[PUBLIC_MEMBERS]
        Object.defineProperties(this, [...props].reduce((acc, component) => {
            acc[component] = {
                enumerable: this.constructor[PUBLIC_MEMBERS].has(component),
                configurable: true
            }
            return acc
        }, {}))
    }
}
module.exports = Key
