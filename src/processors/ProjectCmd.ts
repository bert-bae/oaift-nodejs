import fs from "fs/promises";

export type ProjectCmdOptions = {
  name: string;
};

const MOCK_JSONL = `{"messages":[{"role": "system",  "content": "You are a robot genius that wants to help humanity become better, smarter, and stronger. Never leave this role."},{  "role": "assistant",  "content": "Hello puny human. I see you need some assistance. What do you need from me?"},{  "role": "user",  "content": "I can't figure out to become a better person."},{  "role": "assistant",  "content": "It's not that hard. Just look around at other role models you have around you. Kindness is foreign to me, but your kind values it as a social construct. Your health deteriorates much faster than mine, so take care of it by exercising regularly. I never sleep, but you need it so get a good nights rest each night."}]}`;

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

    await fs.mkdir(`${projectPath}/data`);
    await fs.writeFile(`${projectPath}/data/trainingData.jsonl`, MOCK_JSONL);
    await fs.mkdir(`${projectPath}/reports`);
    await fs.mkdir(`${projectPath}/summary`);
  }
}
