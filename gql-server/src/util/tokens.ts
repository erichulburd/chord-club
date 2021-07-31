import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { readFileSync } from 'fs';
import { config } from './config';

const JWKS_B64 = config.JWKS_B64 || '';
const PRIVATE_SIGNING_KEY_B64 = config.PRIVATE_SIGNING_KEY_B64 || '';

export const jwks = JSON.parse(Buffer.from(JWKS_B64, 'base64').toString('utf-8'));
const privateKey = Buffer.from(PRIVATE_SIGNING_KEY_B64, 'base64').toString('utf-8').toString();


var client = jwksClient({
  jwksUri: '',
  cache: true,
  cacheMaxAge: 999999999999,
});
// A bit hacky, but basically we are signing our own tokens, so rather than fetch the
// JWKS over the network, just pull them out of memory.
client.getKeys = (cb) => {
  cb(null, jwks.keys);
};

const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
  client.getSigningKey(header.kid || '', (err: any, key) => {
    if (err) {
      console.error(err);
      callback(err);
      return;
    }
    callback(null, key.getPublicKey());
  });
}

interface StandardJWTHeaders {
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

export interface InvitationTokenPayload extends Partial<StandardJWTHeaders> {
  invitationID: number;
}

export const sign = <T extends Record<string, string>>(payload: T, opts: Partial<jwt.SignOptions>) => {
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    audience: config.CHORD_CLUB_TOKEN_AUDIENCE,
    issuer: config.CHORD_CLUB_TOKEN_ISSUER,
    keyid: config.CHORD_CLUB_TOKEN_KID,
    ...opts,
  });
};

export const parse = <T extends {}>(token: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      audience: config.CHORD_CLUB_TOKEN_AUDIENCE,
      issuer: config.CHORD_CLUB_TOKEN_ISSUER,
    }, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(decoded as T);
    });
  });
};


