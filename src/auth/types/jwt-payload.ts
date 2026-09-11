import { Request } from 'express';

export type JwtPayload = {
  sub: number;
  login: string;
  ver: number;
};

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
};
