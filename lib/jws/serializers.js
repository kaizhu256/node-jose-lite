const isObject = require('../help/is_object')
let validateCrit = require('../help/validate_crit')
const { JWSInvalid } = require('../errors')

validateCrit = validateCrit.bind(undefined, JWSInvalid)

const compactSerializer = (payload, [recipient]) => {
  return `${recipient.protected}.${payload}.${recipient.signature}`
}
compactSerializer.validate = (jws, { 0: { unprotectedHeader, protectedHeader }, length }) => {
  if (length !== 1 || unprotectedHeader) {
    throw new JWSInvalid('JWS Compact Serialization doesn\'t support multiple recipients or JWS unprotected headers')
  }
  validateCrit(protectedHeader, unprotectedHeader, protectedHeader ? protectedHeader.crit : undefined)
}

const isJSON = (input) => {
  return isObject(input) && typeof input.payload === 'string'
}

const isValidRecipient = (recipient) => {
  return isObject(recipient) && typeof recipient.signature === 'string' &&
    (recipient.header === undefined || isObject(recipient.header)) &&
    (recipient.protected === undefined || typeof recipient.protected === 'string')
}

const isMultiRecipient = (input) => {
  if (Array.isArray(input.signatures) && input.signatures.every(isValidRecipient)) {
    return true
  }

  return false
}
module.exports.compact = compactSerializer;
