import fs from "fs/promises";

export type ValidationCmdOptions = {
  file: string;
};

export type DataSet = {
  messages: Array<{
    role: string;
    content: string;
    name: string;
    function_call: any;
  }>;
};

const MESSAGE_KEYS = ["role", "content", "name", "function_call"];
const ROLES = ["system", "user", "assistant", "function"];
export class ValidationCmd {
  private errorTracker: {
    missingKey: number;
    unrecognizedKey: number;
    unrecognizedRole: number;
    missingContent: number;
    missingAssistantMessage: boolean;
  };
  private opts: ValidationCmdOptions;
  constructor(opts: ValidationCmdOptions) {
    this.opts = opts;
    this.errorTracker = {
      missingKey: 0,
      unrecognizedKey: 0,
      unrecognizedRole: 0,
      missingContent: 0,
      missingAssistantMessage: false,
    };
  }

  public async process() {
    const json = await this.open(this.opts.file);
    this.validate(json)
      .then(() => {
        for (const error in this.errorTracker) {
          console.log("Validation result");
          console.log(`${error}: ${this.errorTracker[error]}`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  private async validate(dataset: Array<DataSet>) {
    if (!Array.isArray(dataset)) {
      throw new Error("Data set is not an array");
    }

    for (const data of dataset) {
      if (!data.messages.some((msg) => msg.role === "assistant")) {
        this.errorTracker.missingAssistantMessage = true;
      }

      for (const msg of data.messages) {
        this.validateMessage(msg);
      }
    }
  }

  private validateMessage(message: DataSet["messages"][number]) {
    if (!message.role || !message.content) {
      this.errorTracker.missingKey += 1;
    }

    const messageKeys = Object.keys(message);
    for (const key of messageKeys) {
      if (!MESSAGE_KEYS.includes(key)) {
        this.errorTracker.unrecognizedKey += 1;
      }
    }

    if (!ROLES.includes(message.role)) {
      this.errorTracker.unrecognizedRole += 1;
    }

    if (!message.content && !message.function_call) {
      this.errorTracker.missingContent += 1;
    }
  }

  /**
   * @param path Path to Jsonl file
   */
  private async open(path: string) {
    const content = await fs.readFile(path, "utf8");
    return JSON.parse(content);
  }
}
