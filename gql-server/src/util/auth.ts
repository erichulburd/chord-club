import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from './config';


const client = jwksClient({
  jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`
});

const getKey: jwt.GetPublicKeyOrSecret = (header: jwt.JwtHeader, cb: (err: Error | null, pk: string | undefined) => void) => {
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

interface Claims {
  uid: string;
}

const bearerRegex = /^Bearer (\w+)/;

export const getBearerToken = (authorization: string) => {
  const match = authorization.match(bearerRegex);
  if (match !== null) {
    return match[1];
  }
  return undefined;
};

export const parseAuthorization = (token: string): Promise<Claims> => {
  return new Promise((resolve, reject) => {
    const cb: jwt.VerifyCallback = (err, decoded) => {
      if(err) {
        return reject(err);
      }
      resolve(decoded as Claims);
    };
    jwt.verify(token, getKey, options, cb);
  });
};
