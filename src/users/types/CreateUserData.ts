export type CreateUserData = {
  login: string;
  email: string;
  passwordHash: string;
  age: number;
  about?: string;
};
