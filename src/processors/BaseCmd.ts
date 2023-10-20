import OpenAI from "openai";
import { OaiGenerateConfig, OaiFineTuneConfig } from "../types/config";

export type BaseCmdParams<T> = {
  config: T;
  oai: OpenAI;
};

export abstract class BaseCmd<TConfig> {
  public config: TConfig;
  public oai: OpenAI;
  constructor(config: TConfig, oai: OpenAI) {
    this.config = config;
    this.oai = oai;
  }
}
