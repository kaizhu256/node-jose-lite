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
        if (ops !== undefined) {
            if (!Array.isArray(ops) || !ops.length || ops.some(o => typeof o !== 'string')) {
                throw new TypeError('`key_ops` must be a non-empty array of strings when provided')
            }
            ops = Array.from(new Set(ops)).filter(x => OPS.has(x))
        }
        if (keyObjectSupported && x5c !== undefined) {
            x5c.forEach((cert, i) => {
                let publicKey
                try {
                    publicKey = createPublicKey({
                        key: `-----BEGIN CERTIFICATE-----${EOL}${cert.match(/.{1,64}/g).join(EOL)}${EOL}-----END CERTIFICATE-----`, format: 'pem'
                    })
                } catch (err) {
                    throw new errors.JWKInvalid(`\`x5c\` member at index ${i} is not a valid base64-encoded DER PKIX certificate`)
                }
                if (i === 0) {
                    try {
                        assert.deepEqual(
                            publicKey.export({ type: 'spki', format: 'der' }),
                            (keyObject.type === 'public' ? keyObject : createPublicKey(keyObject)).export({ type: 'spki', format: 'der' })
                        )
                    } catch (err) {
                        throw new errors.JWKInvalid('The key in the first `x5c` certificate MUST match the public key represented by the JWK')
                    }
                }
            })
        }
        Object.defineProperties(this, {
            [KEYOBJECT]: { value: isObject(keyObject) ? undefined : keyObject },
            type: { value: keyObject.type },
            private: { value: keyObject.type === 'private' },
            public: { value: keyObject.type === 'public' },
            secret: { value: keyObject.type === 'secret' },
            alg: { value: alg, enumerable: alg !== undefined },
            use: { value: use, enumerable: use !== undefined },
            x5c: { value: x5c, enumerable: x5c !== undefined },
            key_ops: {
                enumerable: ops !== undefined,
                ...(ops ? { get () { return [...ops] } } : { value: undefined })
            },
            kid: {
                enumerable: true,
                ...(kid ? { value: kid } : {
                    configurable: true
                })
            },
            ...(x5c ? {
                x5t: {
                    enumerable: true,
                    ...(x5t ? { value: x5t } : {
                        configurable: true
                    })
                }
            } : undefined),
            ...(x5c ? {
                'x5t#S256': {
                    enumerable: true,
                    ...(x5t256 ? { value: x5t256 } : {
                        configurable: true
                    })
                }
            } : undefined),
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
    /* c8 ignore next 8 */
    [inspect.custom] () {
        return `${this.constructor.name} ${inspect(this.toJWK(false), {
            depth: Infinity,
            colors: process.stdout.isTTY,
            compact: false,
            sorted: true
        })}`
    }
    /* c8 ignore next 3 */
    [THUMBPRINT_MATERIAL] () {
        throw new Error(`"[THUMBPRINT_MATERIAL]()" is not implemented on ${this.constructor.name}`)
    }
    /* c8 ignore next 3 */
    algorithms () {
        throw new Error(`"algorithms()" is not implemented on ${this.constructor.name}`)
    }
    /* c8 ignore next 3 */
    static async generate () {
        throw new Error(`"static async generate()" is not implemented on ${this.name}`)
    }
    /* c8 ignore next 3 */
    static generateSync () {
        throw new Error(`"static generateSync()" is not implemented on ${this.name}`)
    }
    /* c8 ignore next 3 */
    static get [PUBLIC_MEMBERS] () {
        throw new Error(`"static get [PUBLIC_MEMBERS]()" is not implemented on ${this.name}`)
    }
    /* c8 ignore next 3 */
    static get [PRIVATE_MEMBERS] () {
        throw new Error(`"static get [PRIVATE_MEMBERS]()" is not implemented on ${this.name}`)
    }
}
module.exports = Key
