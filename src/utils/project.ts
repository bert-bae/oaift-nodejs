import fs from "fs";

export const validateProjectExists = (project: string) => {
  return fs.existsSync(`./projects/${project}`);
};
