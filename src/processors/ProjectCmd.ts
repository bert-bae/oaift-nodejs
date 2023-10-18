import fs from "fs/promises";
import configTemplate from "../templates/oaift-template.config.json";
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
    try {
      await fs.readdir("./projects");
    } catch {
      await fs.mkdir("./projects");
    }

    const projectPath = `./projects/${this.opts.name}`;
    let projectFolder;
    try {
      projectFolder = await fs.readdir(projectPath);
    } catch {
      await fs.mkdir(projectPath);
    }

    if (projectFolder?.length > 0) {
      throw new Error(
        `Project folder is not empty. If you want to proceed, please choose a different project name or delete the existing directory: ${projectPath}`
      );
    }

    await fs.writeFile(
      `${projectPath}/oaift.config.json`,
      prettifyJson(configTemplate)
    );
  }
}
