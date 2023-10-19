import { info } from "console";
import { BaseCmdParams } from "../BaseCmd";

export type DeleteTrainingFilesOptions = {
  ids: string[];
  apply?: boolean;
};

export class DeleteTrainingFilesCmd {
  private opts: DeleteTrainingFilesOptions;
  private oai: BaseCmdParams["oai"];
  constructor(opts: DeleteTrainingFilesOptions, oai: BaseCmdParams["oai"]) {
    this.opts = opts;
    this.oai = oai;
  }

  public async process() {
    if (!this.opts.apply) {
      info(
        `This command will delete your training files with IDs ${this.opts.ids}.\n\nThis action is not reversible. To continue, re-run this command with '--apply'.`
      );
      return;
    }

    const files = await this.oai.files.list();
    await Promise.all(files.data.map((f) => this.delete(f.id)));
  }

  private async delete(id: string) {
    await this.oai.files.del(id);
    info(`Training file with ID ${id} deleted successfully.`);
  }
}
