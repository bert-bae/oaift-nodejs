import fs from "fs/promises";
import { chunk } from "lodash";
import OpenAI from "openai";
import { OaiConfig, OaiConfigSchema, getProjectConfig } from "../types/config";
import { ChatCompletion, ChatCompletionCreateParams } from "openai/resources";
import oaiFn from "../oaiFunctions";
import { DEFAULT_MODEL } from "../constants/openai";
import { error, info, prettifyJson, warn } from "../utils/log";

export type GenerateOptions = {
  project: string;
  name?: string;
  force?: boolean;
  apply?: boolean;
};

export class GenerateCmd {
  private batchSize: number;
  private opts: GenerateOptions;
  private oai: OpenAI;
  constructor(opts: GenerateOptions, oai: OpenAI) {
    this.batchSize = 3;
    this.opts = opts;
    this.oai = oai;
    this.completeChat = this.completeChat.bind(this);
  }

  public async process() {
    const json = await getProjectConfig(this.opts.project);
    const config = OaiConfigSchema.parse(json);
    const chatConfigs = this.generateChatConfigs(config);
    if (!this.opts.apply) {
      info(
        "Apply flag with --apply has not been set. To apply the data generation, use the `--apply` option.\n",
        `Previewing data generation using model ${
          config.model || "gpt-3.5-turbo"
        } with the following templates:\n\n${prettifyJson(chatConfigs)}`
      );
      return;
    }

    const allowApply = await this.validateForceWrite();
    if (!allowApply) {
      error(
        `Dataset name ${this.opts.name} exists and will be overwritten. If you want to proceed, apply the '--force' option.`
      );
      return;
    }

    info("Applying generation tasks.");
    const completions: ChatCompletion[] = [];
    const batches = chunk(chatConfigs, this.batchSize);
    let counter = 1;
    for (const batch of batches) {
      info(`Processing data generation batch ${counter} / ${batches.length}`);
      const output = await Promise.all(batch.map(this.completeChat));
      completions.push(...output);
      counter += 1;
    }

    const requestId =
      this.opts.name || `${this.opts.project}-${new Date().getTime()}`;
    const reportPath = `./projects/${this.opts.project}/${requestId}`;
    await fs.mkdir(reportPath, { recursive: true });
    await Promise.all([
      fs.writeFile(
        `${reportPath}/chat_completions.json`,
        prettifyJson(completions)
      ),
      this.generateReportFile(reportPath, completions),
      this.generateDataFile(reportPath, config, completions),
    ]);
  }

  private async validateForceWrite(): Promise<boolean> {
    if (!this.opts.name) {
      return true;
    }

    if (!this.opts.force) {
      return false;
    }

    try {
      await fs.readdir(`./projects/${this.opts.project}/${this.opts.name}`);
      info(`Dataset name ${this.opts.name} exists and will be overwritten.`);
      return true;
    } catch {
      return false;
    }
  }

  private async completeChat(
    messageConfig: ChatCompletionCreateParams,
    i: number
  ): Promise<ChatCompletion> {
    info(`Generating chat completion #${i + 1}...`);
    const response: ChatCompletion = await this.oai.chat.completions.create({
      ...messageConfig,
      function_call: "auto",
      functions: oaiFn.definitions,
      temperature: 0.5,
      stream: false,
    });
    return response;
  }

  private async generateDataFile(
    reportName: string,
    config: OaiConfig,
    completions: ChatCompletion[]
  ) {
    let modified: string = "";
    completions.forEach((c) => {
      const message = c.choices[0].message;
      if (message.function_call) {
        const fnName = message.function_call.name;
        const fnCall = oaiFn.functions[fnName];
        const fnArgs = JSON.parse(message.function_call.arguments);
        const fnRes = fnCall(fnArgs) as any[];
        fnRes.unshift({ role: "system", content: config.system });
        modified +=
          prettifyJson({
            messages: fnRes,
          }) + "\n";
      } else {
        warn(
          'Ignoring generated data response due to missng of function_call "convertToTrainingData" from OpenAI completion'
        );
      }
    });

    await fs.writeFile(`${reportName}/training_set.jsonl`, modified);
    info(`Training data set written to ${reportName}/training_set.jsonl`);
  }

  private async generateReportFile(
    reportName: string,
    completions: ChatCompletion[]
  ) {
    const report = {
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
      model: completions[0].model,
    };
    completions.forEach((comp) => {
      if (comp.usage) {
        const { prompt_tokens, completion_tokens, total_tokens } = comp.usage!;
        report.usage.prompt_tokens += prompt_tokens;
        report.usage.completion_tokens += completion_tokens;
        report.usage.total_tokens += total_tokens;
      }
    });

    await fs.writeFile(`${reportName}/token_report.json`, prettifyJson(report));
    info(
      `Data generation usage report written to ${reportName}/token_report.json`
    );
  }

  private generateChatConfigs(config: OaiConfig) {
    return config.topics.map((t) => {
      const withVariables = this.interpolateTemplate(config.template, {
        ...config.variables,
        count: config.count,
        topic: t,
      });
      return {
        model: config.model || DEFAULT_MODEL,
        stream: false,
        messages: [
          { role: "system", content: config.system },
          { role: "user", content: withVariables },
        ],
      } as ChatCompletionCreateParams;
    });
  }

  private interpolateTemplate(
    template: string,
    interpolations: Record<string, string | number>
  ) {
    let templateString = template;
    for (const variable in interpolations) {
      const regex = new RegExp(`{{${variable}}}`, "g");
      templateString = templateString.replace(
        regex,
        String(interpolations[variable] || `Error::{{${variable}}}`)
      );
    }
    return templateString;
  }
}
