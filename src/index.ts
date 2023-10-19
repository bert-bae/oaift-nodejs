#!/usr/bin/env node
import { Command } from "commander";
import { appendCommands as appendJobCommands } from "./commands/jobs";
import { appendCommands as appendInitCommands } from "./commands/init";
import { appendCommands as appendGenerateCommands } from "./commands/generate";
import { appendCommands as appendFineTuneCommands } from "./commands/fineTune";
import { appendCommands as appendTrainingFileCommands } from "./commands/trainingFiles";

const program = new Command();
program
  .name("OpenAI Fine-Tuner")
  .description("CLI to support fine tuning processes with OpenAI")
  .version("0.0.1");

appendInitCommands(program);
appendGenerateCommands(program);
appendFineTuneCommands(program);
appendFineTuneCommands(program);
appendTrainingFileCommands(program);
appendJobCommands(program);

program.parse();
