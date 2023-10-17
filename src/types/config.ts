import { z } from "zod";

export type OaiConfig = {
  assistant: string;
  topics: string[];
  variables: Record<string, string | number>;
  count: number;
  template: string;
};

export const OaiConfigSchema = z.object({
  assistant: z.string(),
  topics: z.array(z.string()),
  variables: z.record(z.string(), z.string()),
  count: z.number(),
  template: z.string(),
});
