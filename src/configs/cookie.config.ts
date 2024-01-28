export const cookieConfig = {
  // signed: true,
  domain: env('API_FRONT_URL'),
  // sameSite: 'none',
  secure: true,
  httpOnly: true,
};
