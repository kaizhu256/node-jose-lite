const { randomBytes } = require('crypto')
const importKey = require('../jwk/import')

module.exports = function (alg) {
    return importKey(
        require('../help/key_object').createSecretKey(randomBytes(require('../help/consts').KEYLENGTHS[alg] / 8)),
        { use: 'enc', alg }
    );
};
