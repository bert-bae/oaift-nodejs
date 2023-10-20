import { info } from "console";
import { BaseCmdParams } from "../BaseCmd";
import OpenAI from "openai";

export type DeleteFineTuneOptions = {
  id: string;
  apply?: boolean;
};

export class DeleteFineTuneCmd {
  private oai: OpenAI;
  private opts: DeleteFineTuneOptions;
  constructor(opts: DeleteFineTuneOptions, oai: OpenAI) {
    this.opts = opts;
    this.oai = oai;
  }

  public async process() {
    if (!this.opts.apply) {
      info(
        `This command will delete your fine tuned model with ID ${this.opts.id}.\n\nThis action is not reversible. To continue, re-run this command with '--apply'.`
      );
      return;
    }

    info(`Deleting fine tuned model with ID ${this.opts.id}...`);
    await this.oai.models.del(this.opts.id);
    info(`Fine tuned model with ID ${this.opts.id} deleted successfully.`);
  }
}
