import { Command } from "commander";
import { GenerateCmd, GenerateOptions } from "../processors/GenerateCmd";
import { getProjectConfig } from "../types/config";
import { oai } from "../openaiClient";
import { validateProjectExists } from "../utils/project";

export const appendCommands = (program: Command) => {
  program
    .command("generate")
    .description(
      "Generate training data using ChatGPT4 model for a project given a configuration file"
    )
    .requiredOption(
      "--project <project>",
      "The name of the project. This project must exist under `./projects/{name}/ with an `oaift.config.json` file."
    )
    .option(
      "--apply",
      "Apply the data generation (there will be costs associated). To only preview the chat completion templates, call this command without the `--apply` flag."
    )
    .option(
      "--name <name>",
      "Your own custom name for the dataset that will be generated. If this value is not passed in, the default value is {project}-{unixtime}"
    )
    .option(
      "--force",
      "Used in conjunction with the '--name' flag. If there is a dataset name conflict, it will cancel the process by default. Add this flag to force the generation which will overwrite existing files."
    )
    .action(async (opt: GenerateOptions) => {
      await validateProjectExists(opt.project);
      const config = await getProjectConfig(opt.project);
      const cmd = new GenerateCmd(opt, { oai, config });
      await cmd.process();
    });
};
