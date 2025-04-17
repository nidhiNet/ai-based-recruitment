import OpenAIApi from "openai";

export const getGenerateWithExpertiseFnTools = () => {
    const generateTools: OpenAIApi.Chat.Completions.ChatCompletionTool[] = [{
        type: "function",
        function: {
            name: "generate_interview_questions_with_experince_n_expertise",
            description: "Generate structured interview questions based on a role, no of years Experince and expertise. Each category must contain at least 3 questions",
            parameters: {
                type: "object",
                properties: {
                    role: {
                        type: "string",
                        description: "Job role for which interview questions are needed",                        
                    },
                    experience:{
                        type: "number",  
                        description: "Years of experience a candidate should have for this job."                      
                    },
                    expertise:{
                        type: "array",
                        description: "List of required skills a candidate should have for this job.",
                        items: {
                            type: "string"
                        },
                        minItems: 1
                    },
                },
                required: ["role","experience","expertise"],
                additionalProperties: false
            },
            strict: true,
        }
    }];
    return generateTools;
};

export const getGenerateWithExpertiseNExperienceFnTools = () => {
    const generateTools: OpenAIApi.Chat.Completions.ChatCompletionTool[] = [{
        type: "function",
        function: {
            name: "generate_interview_questions_with_experince_n_expertise",
            description: "Generate interview questions structured by role, experience, and each provided expertise. The expertise items become categories under both Initial Screening and First-Round Interview stages.",
            parameters: {
                type: "object",
                properties: {
                    role: {
                        type: "string",
                        description: "Job role for which interview questions are needed"
                    },
                    experience: {
                        type: "number",
                        description: "Years of experience the candidate should have"
                    },
                    expertise: {
                        type: "array",
                        description: "List of skills or technologies the candidate should have expertise in",
                        items: {
                            type: "string"
                        },
                        minItems: 1
                    },
                    questions: {
                        type: "object",
                        properties: {
                            "Initial Screening Interview": {
                                type: "object",
                                description: "Expertise categories with screening-level questions",
                                patternProperties: {
                                    "^[a-zA-Z0-9_\\-\\s]+$": {
                                        type: "object",
                                        properties: {
                                            questions: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        ques: {
                                                            type: "string",
                                                            description: "Screening interview question"
                                                        }
                                                    },
                                                    required: ["ques"],
                                                    additionalProperties: false
                                                }
                                            }
                                        },
                                        required: ["questions"],
                                        additionalProperties: false
                                    }
                                },
                                additionalProperties: false
                            },
                            "First-Round Interview": {
                                type: "object",
                                description: "Expertise categories with deeper technical questions",
                                patternProperties: {
                                    "^[a-zA-Z0-9_\\-\\s]+$": {
                                        type: "object",
                                        properties: {
                                            questions: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        ques: {
                                                            type: "string",
                                                            description: "First-round interview question"
                                                        }
                                                    },
                                                    required: ["ques"],
                                                    additionalProperties: false
                                                }
                                            }
                                        },
                                        required: ["questions"],
                                        additionalProperties: false
                                    }
                                },
                                additionalProperties: false
                            }
                        },
                        required: ["Initial Screening Interview", "First-Round Interview"],
                        additionalProperties: false
                    }
                },
                required: ["role", "experience", "expertise"],
                additionalProperties: false
            },
            strict: true
        }
    }];

    return generateTools;
};