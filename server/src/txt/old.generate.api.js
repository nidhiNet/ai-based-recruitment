const response = await OpenAIClient.chat.completions.create({
    model: "gpt-4o",
    messages: [
        {
            role: "system",
            content: "You generate structured interview questions based on job roles. Always return a JSON response in the specified format, ensuring all categories and subcategories are present."
        },
        {
            role: "user",
            content: `Generate structured interview questions for the role '${role}'. 
                      Include all categories and subcategories from the following list: 
                      ${JSON.stringify(categories)}. 
                      Each subcategory must contain at least 2 questions, ensuring the response follows this JSON structure:
                      {
                        "role": "<Job Role>",
                        "questions": {
                          "category": {
                            "<Category Name>": {
                              "subcategory": {
                                "<Subcategory Name>": {
                                  "questions": [
                                    { "ques": "<Question 1>" },
                                    { "ques": "<Question 2>" }
                                  ]
                                }
                              }
                            }
                          }
                        }
                      }
                      Ensure each subcategory contains at least two relevant questions.`
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
                            "Initial Screening Interview": {
                                type: "object",
                                properties: {
                                    "Verification of Experience and Qualifications": {
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
                                    },
                                    "Resume Accuracy": { /* Same structure as above */ },
                                    "Relevance": { /* Same structure as above */ },
                                    "Communication Skills and Professionalism": { /* Same structure as above */ },
                                    "Motivation and Interest": { /* Same structure as above */ },
                                    "Logistical Considerations": { /* Same structure as above */ }
                                },
                                required: [
                                    "Verification of Experience and Qualifications",
                                    "Resume Accuracy",
                                    "Relevance",
                                    "Communication Skills and Professionalism",
                                    "Motivation and Interest",
                                    "Logistical Considerations"
                                ]
                            },
                            "First-Round Interview": {
                                type: "object",
                                properties: {
                                    "In-Depth Technical/Functional Skills Evaluation": { /* Same structure as above */ },
                                    "Practical Application": { /* Same structure as above */ },
                                    "Behavioural and Soft Skills Analysis": { /* Same structure as above */ },
                                    "Cultural Fit and Alignment with Company Values": { /* Same structure as above */ },
                                    "Candidate Preparedness and Engagement": { /* Same structure as above */ }
                                },
                                required: [
                                    "In-Depth Technical/Functional Skills Evaluation",
                                    "Practical Application",
                                    "Behavioural and Soft Skills Analysis",
                                    "Cultural Fit and Alignment with Company Values",
                                    "Candidate Preparedness and Engagement"
                                ]
                            }
                        },
                        required: ["Initial Screening Interview", "First-Round Interview"]
                    }
                },
                required: ["role", "questions"]
            }
        }
    ],
    function_call: { name: "generate_interview_questions" }
});

const result = JSON.parse(response.choices[0]!.message.function_call?.arguments as string);
const questions = Object.keys(result?.questions);
if (questions.length <= 1) {
    const quesKey = questions[0];
    const secondCategoryQuestions = result.questions?.[quesKey]?.[CATEGORY.FIRST_ROUND_INTERVIEW];
    delete result.questions?.[quesKey]?.[CATEGORY.FIRST_ROUND_INTERVIEW];
    result.questions = {
        ...result.questions,
        [CATEGORY.FIRST_ROUND_INTERVIEW]: { ...secondCategoryQuestions }
    }
}