import { decode } from 'jsonwebtoken'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('utils')
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken) {
  const decodedJwt = decode(jwtToken)
  return decodedJwt.sub
}

/**
 * getAuthorizedUserKey
 * @param key: key get from jwksUrl
 * @param headerKID: JWT header kid
 * @returns PEM string
 */
export async function getAuthorizedUserKey(keys, headerKID) {
  const authorizeKeys = keys
      .filter(key => key.use === 'sig' && key.kty === 'RSA' && key.kid && ((key.x5c && key.x5c.length) || (key.n && key.e)))
      .map(key => {
        return {
          kid: key.kid,
          nbf: key.nbf,
          publicKey: generatePEMKey(key.x5c[0])
        };
      });

  if (!authorizeKeys) {
    logger.error("0Auth JWKS is not valid ");
    throw new Error('0Auth JWKS is not valid ');
  }

  const authorizedUserKeyValue = authorizeKeys.find(key => key.kid === headerKID);

  if (!authorizedUserKeyValue) {
    logger.error(`No key matched with '${headerKID}'`);
    throw new Error(`No key matched with '${headerKID}'`);
  }

  return authorizedUserKeyValue.publicKey;
}
