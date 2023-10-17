import fs from "fs";
import fsPromise from "fs/promises";
import OpenAI from "openai";
import { ChatCompletionCreateParams } from "openai/resources";
import { spawn } from "child_process";
import { DEFAULT_MODEL } from "../constants/openai";

export type JobEventsOptions = {
  id: string;
};

export class JobsCmd {
  private oai: OpenAI;
  constructor(oai: OpenAI) {
    this.oai = oai;
  }

  public async list() {
    const jobList = await this.oai.fineTunes.list({});
    jobList.data.forEach((job, i) => {
      console.log(`----${i + 1}----`);
      console.info(
        `ID: ${job.id} | Model: ${job.model} | FineTunedModel: ${job.fine_tuned_model}`
      );

      const trainingFileIds = job.training_files.map((file) => file.id);
      console.info(`Status: ${job.status} | TrainingFiles: ${trainingFileIds}`);
    });
  }

  public async events(opts: JobEventsOptions) {
    const events = await this.oai.fineTunes.listEvents(opts.id);
    events.data.forEach((event, i) => {
      console.log(`----${i + 1}----`);
      console.info(`Level: ${event.level} | CreatedAt: ${event.created_at}`);
      console.info(`Message: ${event.message}`);
      console.info(`Details: ${JSON.stringify(event.object, null, 2)}`);
    });
  }
}
