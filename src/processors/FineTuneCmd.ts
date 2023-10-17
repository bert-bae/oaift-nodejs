import fs from "fs/promises";
import { chunk } from "lodash";
import OpenAI from "openai";
import { OaiConfig, OaiConfigSchema } from "../types/config";
import { ChatCompletion, ChatCompletionCreateParams } from "openai/resources";
import oaiFn from "../oaiFunctions";

export type GenerateOptions = {
  project: string;
  plan?: boolean;
  apply?: boolean;
  model?: ChatCompletionCreateParams["model"];
};

export class GenerateCmd {
  private batchSize: number;
  private opts: GenerateOptions;
  private oai: OpenAI;
  constructor(opts: GenerateOptions, oai: OpenAI) {
    this.batchSize = 3;
    this.opts = opts;
    this.oai = oai;
  }

  public async process() {}

  private async getProjectConfig() {
    const config = await fs.readFile(
      `./projects/${this.opts.project}/oaift.config.json`,
      "utf-8"
    );
    return JSON.parse(config) as OaiConfig;
  }
}
