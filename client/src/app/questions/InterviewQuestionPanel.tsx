import React from "react";
import "./InterviewQuestionPanel.css";

type Question = {
  ques: string;
};

type Category = {
  category: string;
  questions: Question[];
  expertise: string[];
};

type Criteria = {
  [stage: string]: Category[];
};

type InterviewData = {
  role: string;
  experience: number;
  expertise: string[];
  criteria: Criteria;
};

type Props = {
  data: InterviewData;
  reGenerateQuestion: any
};

const InterviewQuestionPanel: React.FC<Props> = ({ data , reGenerateQuestion }) => {
  const { role, experience, expertise, criteria } = data;
  const handleReGenQuestion = (cat: any, q:any, stage:any, index:any ,id:any) => {
    console.log("operation not allowed!" , cat, q, stage , id)
    reGenerateQuestion({category: stage, q:q, subcategory: cat.category, qIndex: index, sIndex:id});
  }

  return (
    <div className="interview-container">
      <h1 className="role-title">{role}</h1>
      <p className="experience">Experience: {experience} years</p>
      <div className="section">
        <h2 className="section-title">Expertise</h2>
        <ul className="expertise-list">
          {expertise.map((skill, idx) => (
            <li key={idx} className="expertise-item">
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2 className="section-title">Interview Stages</h2>
        {Object.entries(criteria).map(([stage, categories]) => (
          <div key={stage} className="stage-section">
            <h3 className="stage-title">{stage}</h3>
            {categories.map((cat, index) => (
              <div key={index} className="category-block">
                <h4 className="category-title">{cat.category}</h4>
                {cat.expertise.map((exa, exIndex) => (
                    <span className="bg-gray-300 p-1 mt-3 mb-5 ml-2 rounded-md border" key={exIndex}>{exa}</span>
                ))}
                <ul className="question-list">                    
                  {cat.questions.map((q, qIndex) => (
                    <li key={qIndex} className="question-item">
                      {q.ques} : <span className="cursor-pointer bg-green-400 px-2 py-[1.4] border rounded-md" onClick={() => {handleReGenQuestion(cat, cat.expertise,stage,qIndex,index)}}>Regnerate</span> 
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewQuestionPanel;
