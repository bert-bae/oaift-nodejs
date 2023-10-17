import fs from "fs/promises";
import { chunk } from "lodash";
import OpenAI from "openai";
import { OaiConfig, OaiConfigSchema } from "../types/config";
import {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
} from "openai/resources";

export type GenerateOptions = {
  project: string;
  plan?: boolean;
  apply?: boolean;
  model?: ChatCompletionCreateParams["model"];
};

export class GenerateCmd {
  private batchSize: number;
  private opts: GenerateOptions;
  private oai: OpenAI;
  constructor(opts: GenerateOptions, oai: OpenAI) {
    this.batchSize = 3;
    this.opts = opts;
    this.oai = oai;
  }

  public async process() {
    const json = await this.getProjectConfig();
    const config = OaiConfigSchema.parse(json);
    const chatConfigs = this.generateChatConfigs(config);
    if (!this.opts.apply) {
      console.info(
        "Apply flag with --apply has not been set. To apply the data generation, use the `--apply` option."
      );
      console.info(
        `Previewing data generation using model ${
          this.opts.model || "gpt-3.5-turbo"
        } with the following templates:\n\n${JSON.stringify(
          chatConfigs,
          null,
          2
        )}`
      );
      return;
    }

    console.info("Applying generation tasks.");
    const requestId = `${this.opts.project}-${new Date().getTime()}`;
    const completions: ChatCompletion[] = [
      {
        id: "chatcmpl-8AgfUtQNrxLf77VsVz6syXqJXiXaR",
        object: "chat.completion",
        created: 1697557988,
        model: "gpt-3.5-turbo-0613",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content:
                "User: Hello, I need some advice on how to handle difficult conversations with underperforming employees. Can you help?\n\nAssistant: Of course! I'd be happy to assist you with that. Difficult conversations can be challenging, but with the right approach, you can effectively address performance issues. What specific situation are you facing with your underperforming employee?\n\nUser: Well, one of my team members consistently fails to meet deadlines and produces work that doesn't meet our standards. I need to have a conversation with them about their performance, but I'm not sure how to approach it without causing conflict.\n\nAssistant: I understand your concern. It's important to approach the conversation with empathy and a focus on finding a solution. One approach you can consider is to start the conversation by expressing your expectations and the impact their performance has on the team's goals. Make sure to provide specific instances where their underperformance was observed.\n\nUser: That's a good point. I don't want them to feel attacked, but I do want them to understand the consequences of their actions. How can I ensure the conversation remains productive and doesn't become confrontational?\n\nAssistant: Excellent question! It's crucial to maintain a calm and respectful tone throughout the conversation. Instead of placing blame, try to understand their perspective first. Ask open-ended questions to encourage their input and actively listen to their responses. This will demonstrate that you value their opinion and are genuinely interested in finding a solution together.\n\nUser: That's valuable advice. I'll make sure to create a safe space for open communication. Is there anything specific I should do to prepare for this conversation?\n\nAssistant: Absolutely! Preparation is key to ensuring a successful conversation. Take some time to outline the key points you want to address during the conversation. Write down specific examples of their underperformance as evidence for your concerns. Additionally, anticipate potential reactions or questions they may have, so you can respond effectively.\n\nUser: Thank you for the valuable guidance. I feel more confident now in approaching this difficult conversation with my underperforming employee.\n\nAssistant: You're welcome! I'm glad I could help. Remember, difficult conversations can be uncomfortable, but they also present an opportunity for growth and improvement. I'm confident that by approaching the conversation with empathy and clear expectations, you'll be able to guide your employee towards better performance. If you need any further assistance or have more questions, feel free to ask. Good luck!",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 93,
          completion_tokens: 489,
          total_tokens: 582,
        },
      },
      {
        id: "chatcmpl-8AgfUjxyfX6dwEQfy9otMSMMaXZnz",
        object: "chat.completion",
        created: 1697557988,
        model: "gpt-3.5-turbo-0613",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content:
                "User: Hi, I need some support with meeting a deadline. Can you help?\n\nAssistant: Of course! I'm here to assist you. Please let me know more about the deadline and the challenges you're facing.\n\nUser: We have a project due in two weeks, and I'm feeling overwhelmed with the workload. I can't seem to prioritize tasks effectively, and it's causing me stress.\n\nAssistant: I understand how overwhelming deadlines can be. Don't worry, we can work through this together. Let's start by breaking down the tasks involved in the project. Can you provide me with a list of everything that needs to be done?\n\nUser: Sure, here's a list of tasks: researching, drafting the report, creating a presentation, and reviewing it with team members.\n\nAssistant: Great! Now let's prioritize these tasks. Which ones are the most critical and need to be completed first?\n\nUser: I think researching and drafting the report are the most time-sensitive tasks. The presentation and review can be done closer to the deadline.\n\nAssistant: That sounds like a good plan. Now, let's allocate specific time slots for each task. Have you considered blocking off dedicated time in your schedule for focused work on the research and report drafting?\n\nUser: I haven't thought about that, but it makes sense. I'll find some time every day to focus solely on those tasks.\n\nAssistant: Excellent. By allocating dedicated time for focused work, you'll make progress on the most critical tasks and alleviate some of the stress. Additionally, don't hesitate to communicate with your team members and delegate smaller tasks if possible. Teamwork can help lighten the workload.\n\nUser: That's a good point. I'll reach out to my team and see if anyone can assist with smaller tasks. Thank you for your guidance!\n\nAssistant: You're welcome! Remember, we're here to support you. If you need further assistance or have any more questions, feel free to reach out. Good luck in meeting your deadline, and I'm confident you'll do great!",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 89,
          completion_tokens: 411,
          total_tokens: 500,
        },
      },
      {
        id: "chatcmpl-8AgfUBgeStbCFrFXYmHPoU5Phl8DE",
        object: "chat.completion",
        created: 1697557988,
        model: "gpt-3.5-turbo-0613",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content:
                "User: Hi there! I heard that GroupStart is all about fostering teamwork. I'm looking for ideas on how to celebrate success with my team. Any suggestions?\n\nAssistant: Hi! Absolutely, I'd be happy to help. Celebrating success with everyone on the team is a great way to boost morale and motivation. One idea is to organize a team-wide recognition event. You could plan an informal gathering, like a team lunch or happy hour, where you can publicly acknowledge and appreciate everyone's achievements. Additionally, you could create a \"Wall of Fame\" in your office or a virtual platform, where you showcase the successes and milestones of team members. This not only celebrates the accomplishments but also encourages friendly competition and inspires others to strive for success. Would you like any more ideas or specific tips for your team?",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 92,
          completion_tokens: 163,
          total_tokens: 255,
        },
      },
    ];
    const batches = chunk(chatConfigs, this.batchSize);
    let counter = this.batchSize;
    for (const batch of batches) {
      console.info(
        `Processing data generation ${counter} / ${
          batches.length * this.batchSize
        }`
      );
      const output = await Promise.all(
        batch.map((config) => this.oai.chat.completions.create(config))
      );
      completions.push(...output);
      counter += this.batchSize;
    }
    await this.generateReportFile(requestId, completions);
    await this.generateDataFile(requestId, completions);
  }

  private async generateDataFile(
    reportName: string,
    completions: ChatCompletion[]
  ) {
    await fs.writeFile(
      `./projects/${this.opts.project}/data/${reportName}.json`,
      JSON.stringify(completions, null, 2)
    );
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

    const reportPath = `./projects/${this.opts.project}/reports/${reportName}.json`;
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.info(`Data generation usage report created to "${reportPath}"`);
  }

  private generateChatConfigs(config: OaiConfig) {
    return config.topics.map((t) => {
      const withVariables = this.interpolateTemplate(config.template, {
        ...config.variables,
        count: config.count,
        topic: t,
      });
      return {
        model: this.opts.model || "gpt-3.5-turbo",
        messages: [
          { role: "assistant", content: config.assistant },
          { role: "user", content: withVariables },
        ] as ChatCompletionMessageParam[],
      };
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

  private async getProjectConfig() {
    const config = await fs.readFile(
      `./projects/${this.opts.project}/oaift.config.json`,
      "utf-8"
    );
    return JSON.parse(config) as OaiConfig;
  }
}
