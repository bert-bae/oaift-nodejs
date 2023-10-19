import { info } from "console";
import { BaseCmdParams } from "../BaseCmd";

export class ListTrainingFilesCmd {
  private oai: BaseCmdParams["oai"];
  constructor(oai: BaseCmdParams["oai"]) {
    this.oai = oai;
  }

  public async process() {
    const files = await this.oai.files.list();
    files.data.forEach((file) => {
      info(
        `ID: ${file.id} | FileName: ${file.filename} | Purpose: ${file.purpose} | Size: ${file.bytes} | Created: ${file.created_at}`
      );
    });
  }
}
