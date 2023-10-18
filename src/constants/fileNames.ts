export const GENERATION_REPORT = "generated_report.json";
export const CHAT_COMPLETIONS = "chat_completions.json";
export const TRAINING_SET = "training_set.jsonl";
export const datasetName = (project: string, name: string) => {
  return `./projects/${project}/${name}`;
};

export const fineTuningNamespace = (project: string, namespace: string) => {
  return `./projects/${project}/${namespace}`;
};

export const fineTuningReport = (
  project: string,
  namespace: string,
  jobId: string
) => {
  return `${fineTuningNamespace(project, namespace)}/ft_${jobId}.json`;
};

export const fineTuningPreview = (project: string, namespace: string) => {
  return `${fineTuningNamespace(project, namespace)}/ft_preview.json`;
};
