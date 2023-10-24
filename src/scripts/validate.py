# Taken from OpenAI cook book https://cookbook.openai.com/examples/chat_finetuning_data_prep

import json
import tiktoken # for token counting
import numpy as np
import sys
from collections import defaultdict

final_output = defaultdict()

# Load the dataset
try:
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        dataset = [json.loads(line) for line in f]
        final_output['dataset_size'] = len(dataset)
except Exception as error:
    print(error)

# Format error checks
format_errors = defaultdict(int)
for ex in dataset:
    if not isinstance(ex, dict):
        format_errors["data_type"] += 1
        continue
        
    messages = ex.get("messages", None)
    if not messages:
        format_errors["missing_messages_list"] += 1
        continue
        
    for message in messages:
        if "role" not in message or "content" not in message:
            format_errors["message_missing_key"] += 1
        
        if any(k not in ("role", "content", "name", "function_call") for k in message):
            format_errors["message_unrecognized_key"] += 1
        
        if message.get("role", None) not in ("system", "user", "assistant", "function"):
            format_errors["unrecognized_role"] += 1
            
        content = message.get("content", None)
        function_call = message.get("function_call", None)
        
        if (not content and not function_call) or not isinstance(content, str):
            format_errors["missing_content"] += 1
    
    if not any(message.get("role", None) == "assistant" for message in messages):
        format_errors["example_missing_assistant_message"] += 1

final_output['format_errors'] = format_errors

encoding = tiktoken.get_encoding("cl100k_base")

# not exact!
# simplified from https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
def num_tokens_from_messages(messages, tokens_per_message=3, tokens_per_name=1):
    num_tokens = 0
    for message in messages:
        num_tokens += tokens_per_message
        for key, value in message.items():
            num_tokens += len(encoding.encode(value))
            if key == "name":
                num_tokens += tokens_per_name
    num_tokens += 3
    return num_tokens

def num_assistant_tokens_from_messages(messages):
    num_tokens = 0
    for message in messages:
        if message["role"] == "assistant":
            num_tokens += len(encoding.encode(message["content"]))
    return num_tokens

def set_distribution(values, name):
    final_output[name] = defaultdict()
    final_output[name]['min'] = min(values)
    final_output[name]['max'] = max(values)
    final_output[name]['mean'] = np.mean(values)
    final_output[name]['median'] = np.median(values)
    final_output[name]['p5'] =np.quantile(values, 0.1)
    final_output[name]['p95'] = np.quantile(values, 0.9)

# Warnings and tokens counts
n_missing_system = 0
n_missing_user = 0
n_messages = []
convo_lens = []
assistant_message_lens = []

for ex in dataset:
    messages = ex["messages"]
    if not any(message["role"] == "system" for message in messages):
        n_missing_system += 1
    if not any(message["role"] == "user" for message in messages):
        n_missing_user += 1
    n_messages.append(len(messages))
    convo_lens.append(num_tokens_from_messages(messages))
    assistant_message_lens.append(num_assistant_tokens_from_messages(messages))
    
final_output["n_missing_system"] = n_missing_system
final_output["n_missing_user"] = n_missing_user
final_output["n_messages"] = n_messages
final_output["convo_lens"] = convo_lens
final_output["assistant_message_lens"] = assistant_message_lens

set_distribution(n_messages, "num_messages_per_example")
set_distribution(convo_lens, "num_total_tokens_per_example")
set_distribution(assistant_message_lens, "num_assistant_tokens_per_example")

n_too_long = sum(l > 4096 for l in convo_lens)
final_output["n_too_long"] = n_too_long

# Pricing and default n_epochs estimate
MAX_TOKENS_PER_EXAMPLE = 4096

TARGET_EPOCHS = 3
MIN_TARGET_EXAMPLES = 100
MAX_TARGET_EXAMPLES = 25000
MIN_DEFAULT_EPOCHS = 1
MAX_DEFAULT_EPOCHS = 25

n_epochs = TARGET_EPOCHS
n_train_examples = len(dataset)
if n_train_examples * TARGET_EPOCHS < MIN_TARGET_EXAMPLES:
    n_epochs = min(MAX_DEFAULT_EPOCHS, MIN_TARGET_EXAMPLES // n_train_examples)
elif n_train_examples * TARGET_EPOCHS > MAX_TARGET_EXAMPLES:
    n_epochs = max(MIN_DEFAULT_EPOCHS, MAX_TARGET_EXAMPLES // n_train_examples)

n_billing_tokens_in_dataset = sum(min(MAX_TOKENS_PER_EXAMPLE, length) for length in convo_lens)
# print(f"Dataset has ~{n_billing_tokens_in_dataset} tokens that will be charged for during training")
# print(f"By default, you'll train for {n_epochs} epochs on this dataset")
# print(f"By default, you'll be charged for ~{n_epochs * n_billing_tokens_in_dataset} tokens")

final_output["n_epochs"] = n_epochs
final_output["n_train_examples"] = n_train_examples
final_output["n_billing_tokens_in_dataset"] = n_billing_tokens_in_dataset

print(json.dumps(final_output))
sys.stdout.flush()