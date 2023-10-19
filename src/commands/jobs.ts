import { Command } from "commander";
import { JobsCmd } from "../processors/JobsCmd";
import { oai } from "../openaiClient";

export const appendCommands = (program: Command) => {
  const jobs = program
    .command("jobs <command>")
    .description(
      "Command related to managing and viewing fine tuning jobs. Command can be `list`, `cancel`, or `events`"
    );
  jobs
    .command("cancel")
    .description(
      "Cancel an existing fine tuning job that has not completed yet."
    )
    .option("--id <id>")
    .action(async (opts) => {
      const cmd = new JobsCmd(oai);
      await cmd.cancel(opts);
    });

  jobs
    .command("list")
    .description(
      "List fine tuning jobs. If `--id` is provided, it will only list that job's details. Otherwise, it will list everything."
    )
    .option("--id <id>")
    .action(async (opts) => {
      const cmd = new JobsCmd(oai);
      await cmd.list(opts);
    });

  jobs
    .command("events")
    .description("Lists all events associated to a fine tuning job ID")
    .requiredOption("--id <id>")
    .action(async (opts) => {
      const cmd = new JobsCmd(oai);
      await cmd.events(opts);
    });
};
