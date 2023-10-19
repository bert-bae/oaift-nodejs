import { info } from "console";
import { BaseCmdParams } from "../BaseCmd";

export class ListFineTuneCmd {
  private oai: BaseCmdParams["oai"];
  constructor(oai: BaseCmdParams["oai"]) {
    this.oai = oai;
  }

  public async process() {
    const models = await this.oai.models.list();
    models.data.forEach((m) => {
      if (m.owned_by.startsWith("user-")) {
        info(`ID: ${m.id} | Created: ${m.created} | OwnedBy: ${m.owned_by}`);
      }
    });
  }
}
