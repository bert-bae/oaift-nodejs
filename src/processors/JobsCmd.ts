import OpenAI from "openai";
import { info, log, prettifyJson } from "../utils/log";

export type JobListOptions = {
  id: string;
};

export type JobEventsOptions = {
  id: string;
};

export class JobsCmd {
  private oai: OpenAI;
  constructor(oai: OpenAI) {
    this.oai = oai;
  }

  public async list(opts: JobListOptions) {
    if (opts.id) {
      await this.listOne(opts.id);
    } else {
      await this.listAll();
    }
  }

  public async events(opts: JobEventsOptions) {
    const events = await this.oai.fineTunes.listEvents(opts.id);
    events.data.forEach((event, i) => {
      log(`----${i + 1}----`);
      info(`Level: ${event.level} | CreatedAt: ${event.created_at}`);
      info(`Message: ${event.message}`);
      info(`Details: ${prettifyJson(event.object as any)}`);
    });
  }

  private async listOne(id: string) {
    const job = await this.oai.fineTunes.retrieve(id);
    info(
      `ID: ${job.id} | Model: ${job.model} | FineTunedModel: ${job.fine_tuned_model}`
    );

    const trainingFileIds = job.training_files.map((file) => file.id);
    info(`Status: ${job.status} | TrainingFiles: ${trainingFileIds}`);
  }

  private async listAll() {
    const jobList = await this.oai.fineTunes.list();
    jobList.data.forEach((job, i) => {
      log(`----${i + 1}----`);
      info(
        `ID: ${job.id} | Model: ${job.model} | FineTunedModel: ${job.fine_tuned_model}`
      );

      const trainingFileIds = job.training_files.map((file) => file.id);
      info(`Status: ${job.status} | TrainingFiles: ${trainingFileIds}`);
    });
  }
}
