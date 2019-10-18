const {
    JWK_MEMBERS,
    PRIVATE_MEMBERS,
    PUBLIC_MEMBERS
} = require('../help/consts')
class Key {
    constructor (keyObject, { alg, use, kid, key_ops: ops, x5c, x5t, 'x5t#S256': x5t256 } = {}) {
        Object.assign(this, {
            [KEYOBJECT]: keyObject,
            type: keyObject.type,
            private: keyObject.type === 'private',
            public: keyObject.type === 'public'
        })
    }
    [JWK_MEMBERS] () {
        const props = this[globalThis.KEYOBJECT].type === 'private' ? this.constructor[PRIVATE_MEMBERS] : this.constructor[PUBLIC_MEMBERS]
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
