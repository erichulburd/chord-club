import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import { AccessTokenClaims } from '../src/util/auth';
import { config } from '../src/util/config';

const testPublicKeyJWK: jwkToPem.RSA = {
  kty: 'RSA',
  e: 'AQAB',
  // use: 'sig',
  // kid: '01',
  // alg: 'RS256',
  n: 't1oisi3UFywHU0u9XyUlg8KqtUz_0Pa_n3vFVMcVtG5uOSk6I3gj7-_djAScjfnjQQ_bFrDeNzMnPMaL4YOzElpT9qIykX-g-fJ9SUppAlKlBbTAgJcoR2sz3zp15P-9c525NEZ54BBTh4RVUDLJK5Ae7IQuxTAcMifXmgPJE2CRtrtlG09l5W04FtGisrVJN1fACqkvz_CLs-zwl0HHEkx7YGdKIv8dznoownyQs_nrIWLoepBK-7fFvGuYXLrIyIq7HOXhu9cO0seZHcAkZHohvbODa9yX5DZQ4ucYBQS1Omo0b10QjGIPcdHFUwLIF0iVUcOMv-7fYeD-qYG-Hw'
};

export const testPublicKey = jwkToPem(testPublicKeyJWK);

const testPrivateKeyJWK = {
  ...testPublicKeyJWK,
  p: '_mIRlRl4gw-m_xpYi_sZmISA5zMu8RWd4KQ3mQKO-vtPenWXiDx1CVB6CFVz884qF4yBV-ROiQQJYaTCchpBaIGkIEfKqTYHN6UQ9CHmHIL1hlf1T79FHQt79GsEtbcGMPg1Vo4AXgP0ieCdaooFjo9LRtP52Rwd78kah92FX8M',
  q: 'uIR8RuTBMHAit12pgD9nLADd96u0FyFNFMSdVGEFEadRRHMpqr0vaCoFp18oX92RU5jcnxJZgpPHruGDyqNDFKliGTd_m-DjIA7NhJQ-SE3I7ctMoy8rNdNDgd-FMp4chk18QN8UY1QctTecanFqpDlydfKEvw8OcaUFbnw5fnU',
  d: 'Lllrwe0R21W2-FiCI6YpSJiSPMidNn7ZzAAmzxqQow7zcCG637KEKyhQsg-MX9uWliDi-mZ1ljCpL5TlUXnQb8hDx2oTLHK-B9FD2J4l039-1eVucFNFzGAOOdT2bpAznSF26v8R2hFmfDB4vJBKCGgjWRjFFfXmestVlkp0rx_gYpXQPnj4ovblUncZi4ODM9Y9Xap24hjmeE82p_63zXj1aK2k10BjpcsAhQB1jTr3cYbyYqz4MVHl5y0kbyfzj3sqpOPsgkiQthCqr2ZQ1JCx_wPMSdhvzkTQV4ne_zA62X09u5D57LitIqjlCc41TiiNOw-QYHaWDmNyrW8O2Q',
  qi: 'lq0bd58VMJyAEVghrN6NUr3qi0o9AkGR6kB9Ol6CpNkj3Rrs6rQ_WtL7GDlnoh2blIk4KqLPuGsqXLcYSg42CKVPrA-ERMhej6JCMd_Io2qtsDs2A38sQpllg1DoXaGCRhXItAEan6gImJCs4pezWgiI2x0qpbckH0Izgn2AH2Q',
  dp: '_Cez7ArSdX_XdnnkGeWuqot1xzfqKRnXZG0Dm414s3rXfrj_mxDqpm_6dzZVeO_8s1kYgUoTOyggMIUEJdy2x2Pyj_j5_59JqjPaSVUs50g9Ho0j4ofjd3YByfcnNQUWgwYWwRSDcq4TAXUANTJZbcXGxY-r0zVWy3CZ9uFzqsc',
  dq: 'rA_XN-CvCfU3Wlg77HyzP8RbOE5kNEF4eIpTz9BdArZMwRDG5RFfuLme5hGFO8gIcbUU3j0lPO-DgF-JHxgZQJYnBS7Mj1YpVcaX_S6j2Za3bI9smqsslxe3Vs9RjP8FyHNPD8s2Xt2bm50M_fFfKV7sjnIlOWjX5j-lDf9HOdU',
};

export const testPrivateKey = jwkToPem(testPrivateKeyJWK, { private: true });

export const getTestKey: jwt.GetPublicKeyOrSecret =
  (_header: jwt.JwtHeader, cb: (err: Error | null, pk: string | undefined) => void) => {
    cb(null, testPublicKey);
};

export const signWithTestKey = (claims: Partial<AccessTokenClaims>): string =>
  jwt.sign({
    iss: `https://${config.AUTH0_DOMAIN}/`,
    aud: config.AUTH0_AUDIENCE,
    iat: Date.now(),
    exp: Date.now() + 3600 * 24,
    ...claims,
  }, testPrivateKey, { algorithm: 'RS256' });
