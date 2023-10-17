import { z } from "zod";

export type OaiConfig = {
  system: string;
  topics: string[];
  variables: Record<string, string | number>;
  count: number;
  template: string;
};

export const OaiConfigSchema = z.object({
  system: z.string(),
  topics: z.array(z.string()),
  variables: z.record(z.string(), z.string()),
  count: z.number(),
  template: z.string(),
});
