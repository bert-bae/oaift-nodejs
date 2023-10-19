import { Command } from "commander";
import { ProjectCmd, ProjectCmdOptions } from "../processors/ProjectCmd";

export const appendCommands = (program: Command) => {
  program
    .command("init")
    .description("Initialize a new fine-tuning project")
    .requiredOption(
      "--name <name>",
      "This will be initialized under the folder `projects/<name>`"
    )
    .action(async (opt: ProjectCmdOptions) => {
      const cmd = new ProjectCmd(opt);
      await cmd.process();
    });
};
