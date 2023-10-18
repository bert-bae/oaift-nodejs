import fs from "fs/promises";
import { ChatCompletionCreateParams } from "openai/resources";
import { z } from "zod";

type FineTuningConfigs = {
  epochs?: number;
  suffix?: string;
};

export type OaiConfig = {
  system: string;
  topics: string[];
  variables: Record<string, string | number>;
  count: number;
  template: string;
  model: ChatCompletionCreateParams["model"];
  fineTuning: FineTuningConfigs;
};

export const OaiConfigSchema = z.object({
  system: z.string(),
  topics: z.array(z.string()),
  variables: z.record(z.string(), z.string()),
  count: z.number(),
  template: z.string(),
  model: z.string(),
  fineTuning: z.object({
    epochs: z.optional(z.number()),
    suffix: z.optional(z.string()),
  }),
});

export const getProjectConfig = async (project: string): Promise<OaiConfig> => {
  const config = await fs.readFile(
    `./projects/${project}/oaift.config.json`,
    "utf-8"
  );
  return JSON.parse(config) as OaiConfig;
};
