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
  datasetName,
  fineTuningDataset,
  fineTuningReport,
} from "../constants/fileNames";

export type FineTuneOptions = {
  project: string;
  name: string;
  datasets: string;
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
    const datasets = this.opts.datasets.split(",");
    await this.prepareFolders();

    for (const dataset of datasets) {
      await this.previewJobReport(dataset);
    }
    if (this.opts.apply) {
      const path = await this.consolidateDatasets(datasets);
      const trainingFile = await this.uploadTrainingFile(path);
      const job = await this.createFineTuneJob(trainingFile.id);
      await fsPromise.writeFile(
        fineTuningReport(this.opts.project, this.opts.name, job.id),
        prettifyJson({
          trainingFile,
          job,
          datasets: datasets,
        })
      );
    }
  }

  private async prepareFolders() {
    const path = fineTuningNamespace(this.opts.project, this.opts.name);
    const exists = fs.existsSync(path);
    if (exists) {
      throw new Error(
        `Fine tuning job namespace ${this.opts.name} already exists. If this is a mistake, delete the folder './projects/${this.opts.project}/fineTune/${this.opts.name}'`
      );
    }

    // Prepare folders for following process
    await fsPromise.mkdir(
      fineTuningNamespace(this.opts.project, this.opts.name),
      {
        recursive: true,
      }
    );
  }

  private async createFineTuneJob(trainingFileId: string) {
    info(`Starting fine tuning job with training file ID: ${trainingFileId}`);
    const job = await this.oai.fineTuning.jobs.create({
      model: this.config.model || DEFAULT_MODEL,
      training_file: trainingFileId,
      hyperparameters: {
        n_epochs: this.config.fineTuning.epochs || "auto",
      },
      suffix: this.config.fineTuning.suffix || this.opts.name,
    });

    return job;
  }

  private async uploadTrainingFile(datasetPath: string) {
    info(`Uploading fine tuning training file at '${datasetPath}`);
    return this.oai.files.create({
      file: fs.createReadStream(datasetPath),
      purpose: "fine-tune",
    });
  }

  private async consolidateDatasets(datasets: string[]): Promise<string> {
    let dataset = "";
    for (const set of datasets) {
      const path = `${datasetName(this.opts.project, set)}/${TRAINING_SET}`;
      const content = await fsPromise.readFile(path, { encoding: "utf-8" });
      dataset += content;
    }
    const path = fineTuningDataset(this.opts.project, this.opts.name);
    await fsPromise.writeFile(path, dataset.trim());
    return path;
  }

  // Runs the python code for OpenAI cookbook to preview specs on the fine tuning job
  // TODO: Enhance with capturing the data as an object to auto-detect whether training can proceed or not.
  private async previewJobReport(dataset: string): Promise<void> {
    const datasetPath = `${datasetName(
      this.opts.project,
      dataset
    )}/${TRAINING_SET}`;
    const previewFilePath = fineTuningPreview(
      this.opts.project,
      this.opts.name
    );
    return new Promise((resolve, reject) => {
      info("Initializing python script to preview training data...");
      const python = spawn("python3", [
        path.resolve(__dirname, "../scripts/validate.py"),
        datasetPath,
      ]);

      python.stdout.on("data", async function (res) {
        info(`\nPreview ${datasetPath}\n\n`);
        const data = res.toString();
        info(data);
        await fsPromise.writeFile(previewFilePath, data.toString() as string);
        resolve();
      });

      python.on("error", (err) => {
        log("Err: ", err);
        reject(err);
      });

      python.on("close", (code, signal) => {
        log(`Process closed with ${code}: ${signal}`);
      });

      python.on("disconnect", () => {
        log(`Process disconnected`);
      });
    });
  }
}
