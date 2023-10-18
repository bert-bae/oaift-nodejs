import OpenAI from "openai";
import { OaiConfig } from "../types/config";

export type BaseCmdParams = {
  config: OaiConfig;
  oai: OpenAI;
};

export abstract class BaseCmd {
  public config: OaiConfig;
  public oai: OpenAI;
  constructor(config: OaiConfig, oai: OpenAI) {
    this.config = config;
    this.oai = oai;
  }
}
