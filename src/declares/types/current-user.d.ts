declare global {
  interface CurrentUser {
    id: Id;
    jti: string;
    role: Roles;
  }
}
export {};
