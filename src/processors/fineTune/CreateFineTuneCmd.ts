import fs from "fs";
import path from "path";
import fsPromise from "fs/promises";
import { ChatCompletionCreateParams } from "openai/resources";
import { spawn } from "child_process";
import { DEFAULT_MODEL } from "../../constants/openai";
import { info, log } from "console";
import { prettifyJson } from "../../utils/log";
import { BaseCmd, BaseCmdParams } from "../BaseCmd";
import {
  TRAINING_SET,
  fineTuningNamespace,
  fineTuningPreview,
  datasetName,
  fineTuningDataset,
  fineTuningReport,
} from "../../constants/fileNames";
import { OaiFineTuneConfig } from "../../types/config";

export type CreateFineTuneOptions = {
  project: string;
  name: string;
  datasets: string;
  apply?: boolean;
  model?: ChatCompletionCreateParams["model"];
};

export class CreateFineTuneCmd extends BaseCmd<OaiFineTuneConfig> {
  private opts: CreateFineTuneOptions;
  constructor(
    opts: CreateFineTuneOptions,
    base: BaseCmdParams<OaiFineTuneConfig>
  ) {
    super(base.config, base.oai);
    this.opts = opts;
  }

  public async process() {
    const datasets = this.opts.datasets.split(",");
    await this.prepareFolders();
    const path = await this.consolidateDatasets(datasets);
    await this.previewJobReport(path);

    if (this.opts.apply) {
      const trainingFile = await this.uploadTrainingFile(path);
      const job = await this.createCreateFineTuneJob(trainingFile.id);
      await fsPromise.writeFile(
        fineTuningReport(this.opts.project, this.opts.name),
        prettifyJson({
          config: this.config,
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
      return;
    }

    // Prepare folders for following process
    await fsPromise.mkdir(
      fineTuningNamespace(this.opts.project, this.opts.name),
      {
        recursive: true,
      }
    );
  }

  private async createCreateFineTuneJob(trainingFileId: string) {
    info(`Starting fine tuning job with training file ID: ${trainingFileId}`);
    const job = await this.oai.fineTuning.jobs.create({
      model: this.config.baseModel || DEFAULT_MODEL,
      training_file: trainingFileId,
      hyperparameters: {
        n_epochs: this.config.epochs || "auto",
      },
      suffix: this.config.suffix || this.opts.name,
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
  private async previewJobReport(datasetPath: string): Promise<void> {
    const previewFilePath = fineTuningPreview(
      this.opts.project,
      this.opts.name
    );
    return new Promise((resolve, reject) => {
      info("Initializing python script to preview training data...");
      const python = spawn("python3", [
        path.resolve(__dirname, "../../scripts/validate.py"),
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
