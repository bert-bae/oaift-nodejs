import fs from "fs";
import path from "path";
import fsPromise from "fs/promises";
import { getProjectConfig } from "../types/config";
import { ChatCompletionCreateParams } from "openai/resources";
import { spawn } from "child_process";
import { DEFAULT_MODEL } from "../constants/openai";
import { info, log } from "console";
import { prettifyJson } from "../utils/log";
import { BaseCmd, BaseCmdParams } from "./BaseCmd";
import {
  TRAINING_SET,
  fineTuningNamespace,
  fineTuningPreview,
  fineTuningReport,
} from "../constants/fileNames";

export type FineTuneOptions = {
  project: string;
  dataset: string;
  apply?: boolean;
  model?: ChatCompletionCreateParams["model"];
};

export class FineTuneCmd extends BaseCmd {
  private opts: FineTuneOptions;
  constructor(opts: FineTuneOptions, base: BaseCmdParams) {
    super(base.config, base.oai);
    this.opts = opts;
  }

  public async process() {
    const trainingSet = `${fineTuningNamespace(
      this.opts.project,
      this.opts.dataset
    )}/${TRAINING_SET}`;
    const data = await this.previewJobReport(trainingSet);
    info("-----Preview-----");
    info(data);
    await fsPromise.writeFile(
      fineTuningPreview(this.opts.project, this.opts.dataset),
      data
    );
    if (this.opts.apply) {
      const data = await this.createFineTuneJob(trainingSet);
      await fsPromise.writeFile(
        fineTuningReport(this.opts.project, this.opts.dataset, data.job.id),
        prettifyJson(data)
      );
    }
  }

  public async createFineTuneJob(trainingFilePath: string) {
    const config = await getProjectConfig(this.opts.project);
    info(`Uploading fine tuning training file: ${trainingFilePath}`);
    const trainingFile = await this.oai.files.create({
      file: fs.createReadStream(trainingFilePath),
      purpose: "fine-tune",
    });

    info(`Starting fine tuning job with training file ID: ${trainingFile.id}`);
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
      const python = spawn("python3", [
        path.resolve(__dirname, "../scripts/validate.py"),
        datasetPath,
      ]);

      python.stdout.on("data", function (data) {
        info("Initializing python script to preview training...");
        resolve(data.toString());
      });

      python.on("error", (err) => {
        log("Err: ", err);
        reject(err);
      });
    });
  }
}
