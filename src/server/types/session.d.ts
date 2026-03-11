import 'express-session';

declare module 'express-session' {
  interface SessionData {
    directusAuth?: {
      access_token: string;
      refresh_token: string;
      expires?: number;
    };
    returnTo?: string;
  }
}
