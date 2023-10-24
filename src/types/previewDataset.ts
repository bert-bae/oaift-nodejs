export type PreviewDataset = {
  dataset_size: number;
  format_errors: Record<string, number>;
  n_missing_system: number;
  n_missing_user: number;
  n_messages: number[];
  convo_lens: number[];
  assistant_message_lens: number[];
  num_messages_per_example: {
    min: number;
    max: number;
    mean: number;
    median: number;
    p5: number;
    p95: number;
  };
  num_total_tokens_per_example: {
    min: number;
    max: number;
    mean: number;
    median: number;
    p5: number;
    p95: number;
  };
  num_assistant_tokens_per_example: {
    min: number;
    max: number;
    mean: number;
    median: number;
    p5: number;
    p95: number;
  };
  n_too_long: number;
  n_epochs: number;
  n_train_examples: number;
  n_billing_tokens_in_dataset: number;
};
