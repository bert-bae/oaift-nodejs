import { Command } from "commander";
import { getProjectConfig } from "../types/config";
import { oai } from "../openaiClient";
import { validateProjectExists } from "../utils/project";
import {
  CreateFineTuneCmd,
  CreateFineTuneOptions,
} from "../processors/fineTune";

export const appendCommands = (program: Command) => {
  program
    .command("fine-tune")
    .description("Fine tune your model with a training data set.")
    .requiredOption(
      "--project <project>",
      "The name of the project. This project must exist under `./projects/{name}/ with an `oaift.config.json` file."
    )
    .requiredOption(
      "--name <name>",
      "Name of the fine tuning job. This cannot be overwritten so only one folder can exist for a given name. This will create a new folder with files related to the fine tuning job at './projects/fineTune/'"
    )
    .requiredOption(
      "--datasets <datasets>",
      "Dataset names to process. This field can be a comma delimited list. If the project path is './projects/datasets/example', the value for name is the name of the training name folder like 'test-1697567929095' and these folders must contain `training_set.jsonl` inside of them."
    )
    .option(
      "--apply",
      "Apply the fine tuning job (there will be costs associated). To preview the fine tuning job's potential cost without running the training, call this command without the `--apply` flag."
    )
    .action(async (opt: CreateFineTuneOptions) => {
      await validateProjectExists(opt.project);
      const config = await getProjectConfig(opt.project);
      const cmd = new CreateFineTuneCmd(opt, { oai, config });
      await cmd.process();
    });
};
