const {
    THUMBPRINT_MATERIAL, PUBLIC_MEMBERS, PRIVATE_MEMBERS, JWK_MEMBERS, KEYOBJECT,
    USES_MAPPING, OPS, USES
} = require('../help/consts')
class Key {
    constructor (keyObject, { alg, use, kid, key_ops: ops, x5c, x5t, 'x5t#S256': x5t256 } = {}) {
        Object.defineProperties(this, {
            [KEYOBJECT]: { value: keyObject },
            type: { value: keyObject.type },
            private: { value: keyObject.type === 'private' },
            public: { value: keyObject.type === 'public' },
            secret: { value: keyObject.type === 'secret' },
            alg: { value: alg, enumerable: alg !== undefined },
            use: { value: use, enumerable: use !== undefined },
            x5c: { value: x5c, enumerable: x5c !== undefined },
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
