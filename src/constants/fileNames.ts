export const GENERATION_REPORT = "generated_report.json";
export const CHAT_COMPLETIONS = "chat_completions.json";
export const TRAINING_SET = "training_set.jsonl";
export const datasetName = (project: string, name: string) => {
  return `./projects/${project}/datasets/${name}`;
};

export const fineTuningNamespace = (project: string, namespace: string) => {
  return `./projects/${project}/fineTune/${namespace}`;
};

export const fineTuningPreview = (project: string, namespace: string) => {
  return `${fineTuningNamespace(project, namespace)}/training_set_preview.txt`;
};

export const fineTuningDataset = (project: string, namespace: string) => {
  return `${fineTuningNamespace(project, namespace)}/training_set.jsonl`;
};

export const fineTuningReport = (
  project: string,
  namespace: string,
  jobId: string
) => {
  return `${fineTuningNamespace(project, namespace)}/ft_${jobId}.json`;
};
