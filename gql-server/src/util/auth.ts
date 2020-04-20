import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from './config';

const client = jwksClient({
  jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`
});


export const auth0GetKey: jwt.GetPublicKeyOrSecret =
  (header: jwt.JwtHeader, cb: (err: Error | null, pk: string | undefined) => void) => {
  client.getSigningKey(header.kid || '', function(err, key) {
    if (err) {
      cb(err, undefined);
    }
    cb(null, key.getPublicKey());
  });
};

const options: jwt.VerifyOptions = {
  audience: config.AUTH0_CLIENT_ID,
  issuer: `https://${config.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
};

export interface IDTokenClaims {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
}

export interface AccessTokenClaims {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
}

const bearerRegex = /^Bearer (.+)$/;

export const getBearerToken = (authorization: string) => {
  const match = authorization.match(bearerRegex);
  if (match !== null) {
    return match[1];
  }
  return undefined;
};

export const parseAuthorization =
  (token: string, getKey: jwt.GetPublicKeyOrSecret): Promise<AccessTokenClaims> => {
  return new Promise((resolve, reject) => {
    const cb: jwt.VerifyCallback = (err, decoded) => {
      if(err) {
        return reject(err);
      }
      resolve(decoded as AccessTokenClaims);
    };
    jwt.verify(token, getKey, options, cb);
  });
};

export const getUID = async (authHeader: string | undefined, getKey: jwt.GetPublicKeyOrSecret): Promise<string> => {
  if (!authHeader) return '';
  const token = getBearerToken(authHeader);
  if (!token) return '';
  let uid: string;
  const claims = await parseAuthorization(token, getKey);
  return claims?.sub || '';
}
