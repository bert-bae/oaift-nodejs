import { info } from "console";
import OpenAI from "openai";

export type ReadTrainingFileOptions = {
  id: string;
};

export class ReadTrainingFilesCmd {
  private oai: OpenAI;
  private opts: ReadTrainingFileOptions;
  constructor(opts: ReadTrainingFileOptions, oai: OpenAI) {
    this.oai = oai;
    this.opts = opts;
  }

  public async process() {
    const content = await this.oai.files.retrieveContent(this.opts.id);
    info(content);
  }
}
