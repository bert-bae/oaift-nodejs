import { Command } from "commander";
import { oai } from "./openaiClient";
import { ProjectCmd, ProjectCmdOptions } from "./processors/ProjectCmd";
import { GenerateCmd, GenerateOptions } from "./processors/GenerateCmd";
import fs from "fs/promises";

const validateProjectExists = async (project: string) => {
  try {
    await fs.readdir(`./projects/${project}`);
  } catch {
    throw new Error(
      `Project ${project} does not exist or does not have the necessary folders. Run the initialization command with "init --name <name>.`
    );
  }
};

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

program
  .command("generate")
  .description(
    "Generate training data using ChatGPT4 model for a project given a configuration file"
  )
  .option(
    "--project <project>",
    "The name of the project. This project must exist under `./projects/{name}/ with an `oaift.config.json` file."
  )
  .option(
    "--apply",
    "Apply the data generation (there will be costs associated). To only preview the chat completion templates, simply call this command without the `--apply` flag."
  )
  .action(async (opt: GenerateOptions) => {
    await validateProjectExists(opt.project);
    const cmd = new GenerateCmd(opt, oai);
    await cmd.process();
  });

program.parse();
