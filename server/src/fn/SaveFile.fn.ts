import fs from 'fs';
import path from 'path';

type QuestionData = {
  role: string;
  experience: number;
  expertise: string[];
  criteria: Record<
    string,
    {
      category: string;
      expertise: string[];
      questions: { ques: string }[];
    }[]
  >;
};


function generateAssistantMessage(data: QuestionData): string {
  const lines: string[] = [];

  for (const [round, topics] of Object.entries(data.criteria)) {
    lines.push(`\n${round}:\n`);
    for (const topic of topics) {
      lines.push(`Category: ${topic.category}`);
      for (const q of topic.questions) {
        lines.push(`- ${q.ques}`);
      }
      lines.push(""); // Empty line between categories
    }
  }

  return lines.join("\n");
}


/**
 * Save GPT response as a .jsonl file in a folder
 * @param {string} folderPath - Target directory
 * @param {string} fileNamePrefix - Prefix like role name
 * @param {object[]} data - Array of JSON objects to save
 */

export const saveFileJson = (
  folderPath: string,
  fileNamePrefix: string,
  data: object[]
) => {
  if (!Array.isArray(data)) {
    throw new Error("Expected 'data' to be an array of objects.");
  }

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${fileNamePrefix}.jsonl`;
  const fullPath = path.join(folderPath, fileName);

  const jsonlContent = data.map((entry: any, index: number) => {
    const userMessage = `Role: ${entry.role}\nExperience: ${entry.experience}\nExpertise: ${entry.expertise.join(', ')}`;
    const assistantMessage = generateAssistantMessage(entry);

    return JSON.stringify({
      messages: [
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage },
      ],
    });
  });

  fs.writeFileSync(fullPath, jsonlContent.join("\n"), "utf-8");
  console.log(`File saved: ${fullPath}`);
  return fullPath;
};