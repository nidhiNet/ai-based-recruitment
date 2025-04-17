import OpenAIApi from "openai";

export const getJobRolesFnTools = () => {
    const generateTools: OpenAIApi.Chat.Completions.ChatCompletionTool[] = [{
        type: "function",
        function: {
            "name": "get_similar_jobs",
            // "description": "Retrieve a list of job titles that contain or are related to a given keyword.",
            // "description": "Retrieve a list of job titles that match or are related to a given keyword, including job roles, technologies, specializations or any industries.",
            "description": "Find and return a list of job titles that match or are related to a given keyword. The keyword can refer to a job role, technology, industry term, or specialization.",
            "parameters": {
                "type": "object",
                "properties": {
                    "role": {
                        "type": "string",
                        "description": "The keyword to find related job titles."
                    },
                    "roles": {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        description: "word or phrase related to a job title, such as a role (e.g., 'Engineer'), a technology (e.g., 'Java'), or a field (e.g., 'Healthcare').",
                        additionalProperties: false
                    }
                },
                "required": ["role", "roles"],
                additionalProperties: false
            },
            strict: true,
        }

    }];
    return generateTools;
};