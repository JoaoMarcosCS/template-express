declare namespace Express {
  export interface Request {
    user: {
      id: string;
      email: string;
      name: string;
      document: string;
    };
  }

  export interface Response {
    body?: unknown;
  }
}
