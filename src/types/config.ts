export type OaiConfig = {
  assistant: string;
  variables: {
    topic: string[];
  } & Record<string, string | number>;
  template: string;
};
