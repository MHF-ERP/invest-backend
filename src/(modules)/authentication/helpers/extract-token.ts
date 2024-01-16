import { Request } from 'express';

function getToken(Bearer: string) {
  return Bearer.split(' ')[1];
}

export function extractJWT(req: Request) {
  if (req.headers?.authorization) return getToken(req.headers.authorization);
  if (
    req.signedCookies &&
    req?.signedCookies[env('ACCESS_TOKEN_COOKIE_KEY')]?.length > 0
  ) {
    return getToken(
      `Bearer ${req.signedCookies[env('ACCESS_TOKEN_COOKIE_KEY')]}`,
    );
  }
}
