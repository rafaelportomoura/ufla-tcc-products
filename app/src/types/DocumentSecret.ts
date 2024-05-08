export type DocumentSecret = {
  username: string;

  password: string;
};

export type DocumentParams = {
  host: string;

  protocol: string;

  options?: Record<string, string>;
};
