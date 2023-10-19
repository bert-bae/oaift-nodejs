import fs from "fs/promises";

export const validateProjectExists = async (project: string) => {
  try {
    await fs.readdir(`./projects/${project}`);
  } catch {
    throw new Error(
      `Project ${project} does not exist or does not have the necessary folders. Run the initialization command with "init --name <name>.`
    );
  }
};
