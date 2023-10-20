# OAIFT - OpenAI Fine Tuner CLI

This CLI contains minimal logic to support developers and OpenAI users generate training data and create / track fine-tuning jobs. It uses OpenAI's endpoints under the hood to ensure that changes can be maintained easily.

## Setup

1. Save your `OPENAI_API_KEY` environment variable on your host machine. This tool does not save or store your secret keys.
2. Install python3 alongside NodeJS
3. Clone repository and after installing dependencies, run `npm i -g .`
4. Run `oaift` to verify installation.

This package has not been published as it is a work in process. It is also easier to clone and modify the code here for your own use cases.

## OAIFT Config

```ts
type FineTuningConfigs = {
  epochs?: number;
  suffix?: string;
};

type OaiConfig = {
  system: string;
  topics: string[];
  variables: Record<string, string | number>;
  count: number;
  template: string;
  model: ChatCompletionCreateParams["model"];
  fineTuning: FineTuningConfigs;
};
```

#### Properties

`template`: This is the testing data chat completion prompt template. This string should provide prompt instructions on what the chat completion should try to generate for us that is relevant to our fine tuning. Interpolation is supported and the following are required.

- Property `topics` is required. Interpolation field is `{{topic}}`.
- Property `count` is required. Interpolation field is `{{count}}`.
- Any other matching fields `{{STRING}}` can also be supported by using values supplied to the `variables` object which can only receive key value pairs of `string | number`.

`system`: This is the message that defines the behaviour of OpenAI's chat models. It will be the initial set of instructions to supply in order to provide training data that can further reinforce how your fine tuned model should behave.

- Example: Your name is Bert. You are very knowledgeable about software development. You try to help others as best as you can with a calm demeanor. Oftentimes, you try to explain things in a way that will help them learn without giving away the answer.

`topics`: This is the array of strings that will be interpolated to the `template` string. The template string should contain the text `{{topic}}` which each item in this array will replace to help generate different variations of our testing data.

`count`: This is a number to supply to our testing data generation prompt to provide instructions on how many variations of examples we should create. Different variations will provide better training for models as long as it meets the following rules:

- Similar prompts with same responses.
- Same prompts with slightly varying responses, but same core message.
- It CANNOT have similar prompts with completely different responses. This will confuse the model during fine tuning.

`model`: By default, the model is `gpt-3.5-turbo`. However, you can change this to whatever you want as long as it is listed in the OpenAI models.

`fineTuning`: Contains parameters that will be passed into the fine tuning job creation.

- `suffix`: By default, the fine tuning namespace will be used. However, if this is provided, then the model suffix will use this value instead.
- `epoch`: The number of training iterations that will occur for OpenAI. By default this is 'auto'.

#### Function Calls

There is one built-in function call called `convertToTrainingData` with the following schema:

```ts
{
  name: "convertToTrainingData",
  description:
    "Convert the conversation to an array of messages alternating between the user and assistant.",
  parameters: {
    type: "object",
    properties: {
      conversation: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              enum: ["user", "assistant"],
              description:
                "The name of the role that's currently responding.",
            },
            content: {
              type: "string",
              description: "The message content",
            },
          },
          required: ["role", "content"],
        },
      },
    },
    required: ["conversation"],
  },
}
```

This is used to help standardize the response data from the testing data generation prompts. If this function call is not in the chat completions, `training_set.jsonl` will not automatically be generated. To increase the likelihood of function calls being returned from chat completions, include it in the `template` property of the `oaift.config.json`.,

Example template to get function calls:

```
Generate {{count}} examples of conversations between you and the {{audience}} about the topic below. The resulting conversation between the assistant and user should call convertToTrainingData({ conversation: { role: 'user' | 'assistant', content: string }[] }).\n\n{{topic}}
```

[OpenAI Best Practices](https://openai.com/blog/function-calling-and-other-api-updates)

## Usage

The following is a list of the commands that are supported.

```sh
CLI to support fine tuning processes with OpenAI

Options:
  -V, --version        output the version number
  -h, --help           display help for command

Commands:
  init [options]       Initialize a new fine-tuning project
  generate [options]   Generate training data using ChatGPT4 model for a project given a configuration file
  fine-tune [options]  Fine tune your model with a training data set.
  list [options]       Lists all current fine tuning jobs
  events [options]     Lists all events associated to a fine tuning job ID
  help [command]       display help for command
```

#### Init

Init is to support folder standardization with our fine tuning jobs. The project folder ensures that further usage of the CLI has the necessary folders to know where to save reports, chat completion data, and training sets.

Once a project is initialized, you will find a `oaift.config.json` and `oaigen.config.json` file in the project folder. This contains configurations that can be modified to configure fine tuning jobs and generating training data.

```sh
Initialize a new fine-tuning project

Options:
  --name <name>  This will be initialized under the folder `projects/<name>`
  -h, --help     display help for command
```

#### Generate

Generate uses the `oaift.config.json` file to create templates for OpenAI's chat completion API. This is used to generate testing data for you to use in your fine-tuning requests.

By default, `--apply` will be false. This will output the expected templates on the terminal before calling the API. If `--apply` is applied, then the API call to OpenAI will occur and costs will be applied to your OpenAI account.

_Output_

Each time test data is generated, it will create 3 files under the project request (project name + timestamp):

- `chat_completions.json`: Contains the result of the chat completion API calls.
- `generated_report.json`: Contains the count of all tokens as a result of your training data generation and a copy of the `oaift.config.json` that was used to generate your training data. This can be used to estimate your cost for your project and see what prompts may have been used to generate your data.
- `training_set.jsonl`: OpenAI requires your training dataset to be in a `.jsonl` format. With the `chat_completions.json` data, this tool will try to determine if the built-in function call `convertToTrainingData` can be called. If the chat completion detects `convertToTrainingData`, then the tool will parse this data and automatically convert it into the `training_set.jsonl` for you. Otherwise, you'll need to inspect the `chat_completions.json` file and manually parse this data to meaningful training data.

```sh
Generate training data using ChatGPT4 model for a project given a configuration file

Options:
  --project <project>  The name of the project. This project must exist under `./projects/{name}/ with an `oaift.config.json` file.
  --apply              Apply the data generation (there will be costs associated). To only preview the chat completion templates,
                       call this command without the `--apply` flag.
  --name <name>        Your own custom name for the dataset that will be generated. If this value is not passed in, the default
                       value is {project}-{unixtime}
  --force              Used in conjunction with the '--name' flag. If there is a dataset name conflict, it will cancel the process
                       by default. Add this flag to force the generation which will overwrite existing files.
  -h, --help           display help for command
```

#### Fine-Tune

Fine-Tune uses the generated `training_set.jsonl` to upload the training file and then create a fine tuning job.

By default, `--apply` will be false. This will output the preliminary information about your training data before it goes through fine tuning. If `--apply` is applied, then the API call to OpenAI will occur and costs will be applied to your OpenAI account.

- This report is generated to `fine_tuning_${job.id}.json`. It will contain the job ID that can be used with the `list` and `events` commands.

```sh
Commands to manage your fine tuning jobs.

Options:
  -h, --help        display help for command

Commands:
  create [options]  Fine tune your model with a training data set.
  delete [options]  Delete an existing fine tuned model. This action cannot be reversed.
  list              Lists existing fine tuned models. This does not include on-going fine tuning jobs. For that, please use the 'jobs' command.
  help [command]    display help for command
```

#### Training Files

```sh
Commands to manage your training files.

Options:
  -h, --help        display help for command

Commands:
  list              List all training files uploaded to OpenAI.
  delete [options]  Delete comma delimited list of training files by IDs.
  help [command]    display help for command
```

#### Jobs

```sh
Command related to managing and viewing fine tuning jobs. Command can be `list`, `cancel`, or `events`

Options:
  -h, --help        display help for command

Commands:
  cancel [options]  Cancel an existing fine tuning job that has not completed yet.
  list [options]    List fine tuning jobs. If `--id` is provided, it will only list that job's details. Otherwise, it will list everything.
  events [options]  Lists all events associated to a fine tuning job ID
  help [command]    display help for command
```
