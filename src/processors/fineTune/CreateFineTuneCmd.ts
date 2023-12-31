import fs from "fs";
import path from "path";
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
import { PreviewDataset } from "../../types/previewDataset";

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
    this.prepareFolders();
    const path = this.consolidateDatasets(datasets);
    const { previewData, path: previewFilePath } = await this.previewJobReport(
      path
    );
    this.validatePreviewResult(previewData, previewFilePath);

    if (this.opts.apply) {
      const trainingFile = await this.uploadTrainingFile(path);
      const job = await this.createCreateFineTuneJob(trainingFile.id);
      fs.writeFileSync(
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

  private prepareFolders() {
    const path = fineTuningNamespace(this.opts.project, this.opts.name);
    const exists = fs.existsSync(path);
    if (exists) {
      return;
    }

    // Prepare folders for following process
    fs.mkdirSync(fineTuningNamespace(this.opts.project, this.opts.name), {
      recursive: true,
    });
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

  private consolidateDatasets(datasets: string[]): string {
    let dataset = "";
    for (const set of datasets) {
      const path = `${datasetName(this.opts.project, set)}/${TRAINING_SET}`;
      const content = fs.readFileSync(path, { encoding: "utf-8" });
      dataset += content;
    }
    const path = fineTuningDataset(this.opts.project, this.opts.name);
    fs.writeFileSync(path, dataset.trim());
    return path;
  }

  /**
   * This method will throw an error if validation fails and stop the request.
   * @param preview PreviewDataset from output of validate.py
   * @param path Path where details of the preview are written for further inspection
   * @returns Throws an error if validation fails.
   */
  private validatePreviewResult(preview: PreviewDataset, path: string) {
    if (Object.keys(preview.format_errors).length) {
      throw new Error(
        `Dataset validation failed with format errors. Details can be found at ${path}`
      );
    }

    if (
      preview.n_missing_system ||
      preview.n_missing_user ||
      preview.n_too_long
    ) {
      throw new Error(
        `Dataset validation failed with either missing system message, user message, or too many tokens. Details can be found at ${path}`
      );
    }

    return true;
  }

  private async previewJobReport(datasetPath: string): Promise<{
    previewData: PreviewDataset;
    path: string;
  }> {
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
        info(`Previewing dataset at ${datasetPath}`);
        const data = res.toString();
        const parsed = JSON.parse(data);
        fs.writeFileSync(previewFilePath, prettifyJson(parsed));
        info(`Training dataset preview written to "${previewFilePath}"`);
        resolve({
          previewData: JSON.parse(data),
          path: previewFilePath,
        });
      });

      python.on("error", (err) => {
        log("Err: ", err);
        reject(err);
      });

      python.on("disconnect", () => {
        log(`Process disconnected`);
      });
    });
  }
}
