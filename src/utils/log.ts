export const log = console.log;
export const info = console.info;
export const warn = console.warn;
export const error = console.error;

export const prettifyJson = (json: Record<string, any>) =>
  JSON.stringify(json, null, 2);
