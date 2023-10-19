import { Command } from "commander";
export const appendCommands = (program: Command) => {
  const filesProgram = program
    .command("files <command>")
    .description("Commands to manage your training files.");

  filesProgram
    .command("list")
    .description("List all training files uploaded to OpenAI.")
    .action(async () => {});
};
