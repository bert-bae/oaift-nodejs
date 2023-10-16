import { Command } from "commander";
import {
  ValidationCmd,
  ValidationCmdOptions,
} from "./processors/ValidationCmd";

const program = new Command();
program
  .name("OpenAI Fine-Tuner")
  .description("CLI to support fine tuning processes with OpenAI")
  .version("0.0.1");

program
  .command("validate")
  .description(
    "Validate the training data set to ensure that it meets the data contracts. Provide a report on invalid data, token sizes, etc."
  )
  .option(
    "--file <file>",
    "Path to the JSON file. It must meet the data model { dataset: Array<{...> }"
  )
  .action(async (opt: ValidationCmdOptions) => {
    const cmd = new ValidationCmd(opt);
    await cmd.process();
  });

program.parse();
