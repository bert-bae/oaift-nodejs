import { Command } from "commander";
import {
  ListTrainingFilesCmd,
  DeleteTrainingFilesCmd,
} from "../processors/trainingFiles";
import { oai } from "../openaiClient";

export const appendCommands = (program: Command) => {
  const filesProgram = program
    .command("files <command>")
    .description("Commands to manage your training files.");

  filesProgram
    .command("list")
    .description("List all training files uploaded to OpenAI.")
    .action(async () => {
      await new ListTrainingFilesCmd(oai).process();
    });

  filesProgram
    .command("delete")
    .description("Delete comma delimited list of training files by IDs.")
    .requiredOption("--id <id>")
    .option("--apply")
    .action(async (opts) => {
      const ids = opts.id.split(",");
      await new DeleteTrainingFilesCmd(
        { ids, apply: opts.apply },
        oai
      ).process();
    });
};
