import { info } from "console";
import { BaseCmdParams } from "../BaseCmd";

export class ListFineTuneCmd {
  private oai: BaseCmdParams["oai"];
  constructor(oai: BaseCmdParams["oai"]) {
    this.oai = oai;
  }

  public async process() {
    const models = await this.oai.fineTunes.list();
    models.data.forEach((m) => {
      info(
        `ID: ${m.id} | Model: ${m.model} | FineTunedModel: ${m.fine_tuned_model}`
      );
      info(`Status: ${m.status} | TrainingFiles: ${m.training_files}`);
    });
  }
}
