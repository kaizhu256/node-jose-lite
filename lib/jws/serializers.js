let validateCrit = require('../help/validate_crit')
const compactSerializer = (payload, [recipient]) => {
    return `${recipient.protected}.${payload}.${recipient.signature}`
}
module.exports.compact = compactSerializer;
