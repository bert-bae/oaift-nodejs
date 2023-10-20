import { info } from "console";
import OpenAI from "openai";

export class ListTrainingFilesCmd {
  private oai: OpenAI;
  constructor(oai: OpenAI) {
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
