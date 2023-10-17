import fs from "fs/promises";
import { chunk } from "lodash";
import OpenAI from "openai";
import { OaiConfig, OaiConfigSchema } from "../types/config";
import { ChatCompletion, ChatCompletionCreateParams } from "openai/resources";
import oaiFn from "../oaiFunctions";
import { spawn } from "child_process";

export type FineTuneOptions = {
  project: string;
  dataset: string;
  apply?: boolean;
  model?: ChatCompletionCreateParams["model"];
};

export class FineTuneCmd {
  private batchSize: number;
  private opts: FineTuneOptions;
  private oai: OpenAI;
  constructor(opts: FineTuneOptions, oai: OpenAI) {
    this.batchSize = 3;
    this.opts = opts;
    this.oai = oai;
  }

  public async process() {
    const projectJobPath = `./projects/${this.opts.project}/${this.opts.dataset}`;
    const data = await this.previewJobReport(
      `${projectJobPath}/training_set.jsonl`
    );
    await fs.writeFile(`${projectJobPath}/fine_tune_preview.txt`, data);
  }

  // Runs the python code for OpenAI cookbook to preview specs on the fine tuning job
  private async previewJobReport(datasetPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const python = spawn("python3", ["./scripts/validate.py", datasetPath]);

      python.stdout.on("data", function (data) {
        console.info("Initializing python script to preview training...");
        resolve(data.toString());
      });

      python.on("error", (err) => {
        reject(err);
      });
    });
  }

  private async getProjectConfig() {
    const config = await fs.readFile(
      `./projects/${this.opts.project}/oaift.config.json`,
      "utf-8"
    );
    return JSON.parse(config) as OaiConfig;
  }
}
