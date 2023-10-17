import fs from "fs";
import fsPromise from "fs/promises";
import OpenAI from "openai";
import { OaiConfig } from "../types/config";
import { ChatCompletionCreateParams } from "openai/resources";
import { spawn } from "child_process";
import { DEFAULT_MODEL } from "../constants/openai";

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
    await fsPromise.writeFile(`${projectJobPath}/fine_tune_preview.txt`, data);
    if (this.opts.apply) {
      const data = await this.createFineTuneJob(
        `${projectJobPath}/training_set.jsonl`
      );
      await fsPromise.writeFile(
        `${projectJobPath}/tuning-${new Date().getTime()}`,
        JSON.stringify(data, null, 2)
      );
    }
  }

  public async createFineTuneJob(trainingFilePath: string) {
    const config = await this.getProjectConfig();
    console.info(`Uploading fine tuning training file: ${trainingFilePath}`);
    const trainingFile = await this.oai.files.create({
      file: fs.createReadStream(trainingFilePath),
      purpose: "fine-tune",
    });

    console.info(
      `Startiing fine tuning job with training file ID: ${trainingFile.id}`
    );
    const job = await this.oai.fineTuning.jobs.create({
      model: config.model || DEFAULT_MODEL,
      training_file: trainingFile.id,
    });

    return {
      trainingFile,
      job,
    };
  }

  // Runs the python code for OpenAI cookbook to preview specs on the fine tuning job
  // TODO: Enhance with capturing the data as an object to auto-detect whether training can proceed or not.
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
    const config = await fsPromise.readFile(
      `./projects/${this.opts.project}/oaift.config.json`,
      "utf-8"
    );
    return JSON.parse(config) as OaiConfig;
  }
}