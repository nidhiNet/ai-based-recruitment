import OpenAIApi from "openai";

export const getMessagesWithExperinceAndExpertisePrompt = (role: string, experince: number, expertise: string[]) => {
    const messages: OpenAIApi.Chat.Completions.ChatCompletionMessageParam[] = [
        {
            role: "user",
            content: `I want to hire a ${role} with experince of ${experince} years and must have skills from ${expertise.join(",")}, tell me all the questions i should be asking for in detail  for the following stages below. give me all the questions with in a category, so i understand which stage of the category is this. Minimum 2-3 questions for each category.`
        }
    ]
    return messages;
}