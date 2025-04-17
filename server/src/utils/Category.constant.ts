export const categories = {
    "Initial Screening Interview": [
        "Verification of Experience and Qualifications",
        "Resume Accuracy",
        "Relevance",
        "Communication Skills and Professionalism",
        "Motivation and Interest",
        "Logistical Considerations"
    ],
    "First-Round Interview": [
        "In-Depth Technical/Functional Skills Evaluation",
        "Practical Application",
        "Behavioural and Soft Skills Analysis",
        "Cultural Fit and Alignment with Company Values",
        "Candidate Preparedness and Engagement"
    ]
};

export const CATEGORY = {
    INITIAL_SCREENING_INTERVIEW: 'Initial Screening Interview',
    FIRST_ROUND_INTERVIEW: 'First-Round Interview'
}

export function parseJobList(response: string) {
    try {
        // Try parsing directly as JSON (if it's already JSON formatted)
        return JSON.parse(response);
    } catch (error) {
        // If parsing fails, extract list from formatted text
        const match = response.match(/\[([\s\S]*?)\]/);
        if (match) {
            return JSON.parse(match[0]); // Parse the extracted JSON part
        }

        // If it's a plain text list, split by newlines and clean up quotes
        return response
            .split("\n")
            .map(line => line.replace(/^[-\d.\s"]+|["]+$/g, "").trim())
            .filter(line => line.length > 0);
    }
}

export const SUB_CATEGORY_MEAN: Record<string, string> = {
    "Verification of Experience and Qualifications": "related to verification of experience, resume accuracy, and relevance of qualifications.",
    "Communication Skills and Professionalism": "related to clarity of speech, professional demeanor, and articulation.",
    "Motivation and Interest": "related to passion for the role, career aspirations, and alignment with company vision.",
    "Logistical Considerations": "related to availability, salary expectations, and relocation readiness.",
    
    "In-Depth Technical/Functional Skills Evaluation": "related to technical and functional skill assessments, problem-solving, and competency evaluation.",
    "Behavioural and Soft Skills Analysis": "related to interpersonal skills, adaptability, teamwork, and problem-solving.",
    "Cultural Fit and Alignment with Company Values": "related to team dynamics, value alignment, and organizational culture fit.",
    "Candidate Preparedness and Engagement": "related to research on the company, thoughtful questions, and genuine interest in the role.",
}