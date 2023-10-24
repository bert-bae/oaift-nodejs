import fs from "fs";
import ftTemplate from "../templates/oaift-temp.config.json";
import genTemplate from "../templates/oaigen-temp.config.json";
import { prettifyJson } from "../utils/log";

export type ProjectCmdOptions = {
  name: string;
};

export class ProjectCmd {
  private opts: ProjectCmdOptions;
  constructor(opts: ProjectCmdOptions) {
    this.opts = opts;
  }

  public async process() {
    await this.setup();
  }

  private async setup() {
    if (!fs.existsSync("./projects")) {
      fs.mkdirSync("./projects");
    }

    const projectPath = `./projects/${this.opts.name}`;
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath);
    }

    let projectFolder = fs.readdirSync(projectPath);
    if (projectFolder.length) {
      throw new Error(
        `Project folder is not empty. If you want to proceed, please choose a different project name or delete the existing directory: ${projectPath}`
      );
    }

    fs.writeFileSync(
      `${projectPath}/oaigen.config.json`,
      prettifyJson(genTemplate)
    );
    fs.writeFileSync(
      `${projectPath}/oaift.config.json`,
      prettifyJson(ftTemplate)
    );
  }
}
