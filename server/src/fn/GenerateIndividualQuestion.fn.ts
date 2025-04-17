
import OpenAIApi from "openai";


export const generateIndividiualQuestionTools: OpenAIApi.Chat.Completions.ChatCompletionTool[] =
[
  {
    type: "function",
    function: {
      name: "generate_summerized_interview_questions",
      description:
        "Generate a one interview question for each given summarized word based on job role and experience level.",
      parameters: {
        type: "object",
        properties: {
          role: {
            type: "string",
            description:
              "The job role for which interview questions are being generated.",
          },
          experience: {
            type: "integer",
            description: "Years of work experience of the candidate.",
          },
          questions: {
            type: "array",
            description:
              "generate interview question for given category and subcategory",
            items: {
              type: "string",
            },
          },
        },
        required: ["role", "experience", "questions"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];
