# OAIFT - OpenAI Fine Tuner CLI

This CLI contains minimal logic to support developers and OpenAI users generate training data and create / track fine-tuning jobs. It uses OpenAI's endpoints under the hood to ensure that changes can be maintained easily.

## Setup

Save your `OPENAI_API_KEY` environment variable on your host machine. This tool does not save or store your secret keys.

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

Once a project is initialized, you will find a `oaift.config.json` file in the project folder. This contains configurations that can be modified to support generating your training data set.

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
- `token_report.json`: Contains the count of all tokens as a result of your training data generation. This can be used to estimate your cost for your project.
- `training_set.jsonl`: OpenAI requires your training dataset to be in a `.jsonl` format. With the `chat_completions.json` data, this tool will try to determine if the built-in function call `convertToTrainingData` can be called. If the chat completion detects `convertToTrainingData`, then the tool will parse this data and automatically convert it into the `training_set.jsonl` for you. Otherwise, you'll need to inspect the `chat_completions.json` file and manually parse this data to meaningful training data.

```sh
Generate training data using ChatGPT4 model for a project given a configuration file

Options:
  --project <project>  The name of the project. This project must exist under `./projects/{name}/ with an `oaift.config.json` file.
  --apply              Apply the data generation (there will be costs associated). To only preview the chat completion templates, call this command without the `--apply` flag.
  -h, --help           display help for command
```

#### Fine-Tune

Fine-Tune uses the generated `training_set.jsonl` to upload the training file and then create a fine tuning job.

By default, `--apply` will be false. This will output the preliminary information about your training data before it goes through fine tuning. If `--apply` is applied, then the API call to OpenAI will occur and costs will be applied to your OpenAI account.

- This report is generated TODO

```sh
Fine tune your model with a training data set.

Options:
  --project <project>  The name of the project. This project must exist under `./projects/{name}/ with an `oaift.config.json` file.
  --dataset <dataset>  Path to the training dataset file relative to the project folder. If the project path is './projects/example', the value for dataset is the name of the training dataset folder like 'test-1697567929095'
  --apply              Apply the fine tuning job (there will be costs associated). To preview the fine tuning job's potential cost without running the training, call this command without the `--apply` flag.
  -h, --help           display help for command
```
