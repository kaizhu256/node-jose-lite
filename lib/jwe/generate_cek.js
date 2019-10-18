module.exports = function (alg) {
    return require('../jwk/import')(
        require('../help/key_object').createSecretKey(require('crypto').randomBytes(require('../help/consts').KEYLENGTHS[alg] / 8)),
        { use: 'enc', alg }
    );
};
