import { Command } from "commander";
import { oai } from "./openaiClient";
import { ProjectCmd, ProjectCmdOptions } from "./processors/ProjectCmd";
import {
  TestDataGenerationCmd,
  TestDataGenerationOptions,
} from "./processors/TestDataGenerationCmd";

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
  .action(async (opt: TestDataGenerationOptions) => {
    const cmd = new TestDataGenerationCmd(opt, oai);
    await cmd.process();
  });

program.parse();
