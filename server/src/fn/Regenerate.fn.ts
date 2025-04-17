import OpenAIApi from "openai";


export const getRegenerateFnTools = (category: string, subcategory: string) => {
    const generateTools: OpenAIApi.Chat.Completions.ChatCompletionTool[] = [{
        type: "function",
        function: {
            name: "generate_interview_questions",
            description: "Generate structured interview questions based on a role, categorized into predefined categories and subcategories. Each subcategory must contain at least 3 questions",
            parameters: {
                type: "object",
                properties: {
                    role: {
                        type: "string",
                        description: "Job role for which interview questions are needed",
                        properties: {},
                        additionalProperties: false
                    },
                    questions: {
                        type: "object",
                        properties: {
                            [category]: {
                                type: "object",
                                properties: {
                                    [subcategory]: {
                                        type: "object",
                                        properties: {
                                            questions: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        ques: {
                                                            type: "string",
                                                            description: "Interview question text"
                                                        }
                                                    },
                                                    required: ["ques"],
                                                    additionalProperties: false
                                                }
                                            }
                                        },
                                        required: ['questions'],
                                        additionalProperties: false,
                                    },
                                },
                                required: [
                                    subcategory
                                ],
                                additionalProperties: false,
                            },
                        },
                        required: [category],
                        additionalProperties: false,
                    },
                },
                required: ["role", "questions"],
                additionalProperties: false
            },
            strict: true,
        }
    }];
    return generateTools;
};
