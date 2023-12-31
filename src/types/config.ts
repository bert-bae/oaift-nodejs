import fs from "fs";
import {
  ChatCompletionCreateParams,
  FineTuneCreateParams,
} from "openai/resources";
import { z } from "zod";

export type OaiGenerateConfig = {
  system: string;
  topics: string[];
  variables: Record<string, string | number>;
  count: number;
  template: string;
  model: ChatCompletionCreateParams["model"];
};

export type OaiFineTuneConfig = {
  epochs?: "auto" | number;
  suffix?: string;
  baseModel: FineTuneCreateParams["model"] | string;
};

export const OaiGenerateConfigSchema = z.object({
  system: z.string(),
  topics: z.array(z.string()),
  variables: z.record(z.string(), z.string()),
  count: z.number(),
  template: z.string(),
  model: z.string(),
});

export const OaiFineTuneConfigSchema = z.object({
  epochs: z.optional(z.number().or(z.enum(["auto"]))),
  suffix: z.optional(z.string().min(4).max(18)),
  baseModel: z.string(),
});

export const getFineTuneConfig = (project: string): OaiFineTuneConfig => {
  const config = fs.readFileSync(
    `./projects/${project}/oaift.config.json`,
    "utf-8"
  );
  return JSON.parse(config) as OaiFineTuneConfig;
};

export const getGenerateConfig = (project: string): OaiGenerateConfig => {
  const config = fs.readFileSync(
    `./projects/${project}/oaigen.config.json`,
    "utf-8"
  );
  return JSON.parse(config) as OaiGenerateConfig;
};
