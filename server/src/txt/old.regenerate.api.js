const response = await OpenAIClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        {
            role: "system",
            content: "You generate structured interview questions based on job roles. Always return a JSON response in the specified format, ensuring all categories and subcategories are present."
        },
        {
            role: "user",
            content: `Regenerate interview questions only for the subcategory '${subcategory}' under the category '${category}' for the role '${role}'. 
            Ensure at least 2 relevant questions in the following JSON format:
            {
                "role": "${role}",
                "questions": {
                    "${category}": {
                        "${subcategory}": {
                            "questions": [
                                { "ques": "<New Question 1>" },
                                { "ques": "<New Question 2>" }
                            ]
                        }
                    }
                }
            }
            Preserve the structure of other categories and subcategories without modifying them.`
        }
    ],
    functions: [
        {
            name: "generate_interview_questions",
            description: "Generate structured interview questions based on a role, categorized into predefined categories and subcategories.",
            parameters: {
                type: "object",
                properties: {
                    role: {
                        type: "string",
                        description: "Job role for which interview questions are needed"
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
                                                        ques: { type: "string", description: "Interview question text" }
                                                    },
                                                    required: ["ques"]
                                                }
                                            }
                                        },
                                        required: ["questions"]
                                    }
                                },
                                required: [subcategory]
                            }
                        },
                        required: [category]
                    }
                },
                required: ["role", "questions"]
            }
        }
    ],
    function_call: { name: "generate_interview_questions" }
});

const result = JSON.parse(response.choices[0]!.message.function_call?.arguments as string);