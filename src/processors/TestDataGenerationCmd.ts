import fs from "fs/promises";
import OpenAI from "openai";
import { OaiConfig } from "../types/config";

export type TestDataGenerationOptions = {
  project: string;
};

export class TestDataGenerationCmd {
  private opts: TestDataGenerationOptions;
  private oai: OpenAI;
  constructor(opts: TestDataGenerationOptions, oai: OpenAI) {
    this.opts = opts;
    this.oai = oai;
  }

  public async process() {
    const config = await this.getProjectConfig();
    if (!this.validateConfig(config)) {
      return;
    }
  }

  private async getProjectConfig() {
    const config = await fs.readFile(
      `./projects/${this.opts.project}/oaift.config.json`,
      "utf-8"
    );
    return JSON.parse(config);
  }

  private validateConfig(config: OaiConfig): boolean {
    if (!config.assistant) {
      console.error('Configuration is missing the "assistant" property.');
    }

    if (!config.variables?.topic) {
      console.error('Configuration is missing the "variables.topic" property.');
    }

    if (!config.template) {
      console.error('Configuration is missing the "template" property.');
    }

    return !config.assistant || !config.variables?.topic || !config.template;
  }
}
