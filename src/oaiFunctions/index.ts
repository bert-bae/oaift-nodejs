import OpenAI from "openai";
import { ChatCompletionMessage } from "openai/resources";
const openai = new OpenAI();

// Example dummy function hard coded to return the same weather
// In production, this could be your backend API or an external API
type ConvertToTrainingDataExpectedMessage = {
  role: "user" | "assistant";
  content: string;
};
function convertToTrainingData(args: {
  conversation: ConvertToTrainingDataExpectedMessage[];
}) {
  return args.conversation;
}

const definitions = [
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
  },
];

const functions = {
  convertToTrainingData,
};

export default {
  definitions,
  functions,
};
