import { Command } from "commander";
import { ProjectCmd, ProjectCmdOptions } from "./processors/ProjectCmd";

const program = new Command();
program
  .name("OpenAI Fine-Tuner")
  .description("CLI to support fine tuning processes with OpenAI")
  .version("0.0.1");

program
  .command("init")
  .description("Initialize a new fine-tuning project")
  .option(
    "--name <name>",
    "This will be initialized under the folder `projects/<name>`"
  )
  .action(async (opt: ProjectCmdOptions) => {
    const cmd = new ProjectCmd(opt);
    await cmd.process();
  });

program.parse();
