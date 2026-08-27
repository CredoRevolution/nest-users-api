import { Request } from 'express';

export type JwtPayload = {
  sub: number;
  login: string;
};

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
};
