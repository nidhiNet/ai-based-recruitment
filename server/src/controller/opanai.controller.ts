import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import OpenAIApi from "openai";
import fs from "fs";
import mongoose from "mongoose";
import { ResponseHelper, CommonHelper } from "@/helpers";
import { catchErrors } from "@/utils/utils.fn";
import { ExpertiseModel, JobRoleModel, QuestionModel } from "@/model";
import { saveFileJson } from "@/fn/SaveFile.fn";
import { parseJobList, SUB_CATEGORY_MEAN } from "@/utils/category.constant";
import { getMessagesWithExperinceAndExpertisePrompt } from "@/fn/MessagePrompt.fn";
import { getGenerateWithExpertiseNExperienceFnTools } from "@/fn/Generate.fn";

const OpenAIClient = new OpenAIApi({
  apiKey: process.env.API_KEY,
});

class OpenAIController {
  
  public static async GenerateQuestionsController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        body: { role, expertise, experience },
      } = req;

      const response: OpenAIApi.Chat.Completions.ChatCompletion =
        await OpenAIClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: getMessagesWithExperinceAndExpertisePrompt(
            role,
            experience,
            expertise
          ),
          tools: getGenerateWithExpertiseNExperienceFnTools(),
          store: true,
        });

      const result = JSON.parse(
        response.choices[0].message!.tool_calls?.[0]?.function
          .arguments as string
      );
      const data = CommonHelper.GetPreparedJSONResponse(result as any);
      const model = new QuestionModel(data);
      const document = await model.save();
      result._id = document._id;

      res
        .status(StatusCodes.OK)
        .send(new ResponseHelper("Question generated successfully", data));
    } catch (error: any) {
      console.error(
        "Error occured while generating a questions list",
        JSON.stringify(error, null, 2)
      );
      next(catchErrors(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
  }


  /**
   * Generate the result set with interview questions
   * @param req
   * @param res
   * @param next
   */
  public static async GenerateInterviewQuestionsSetController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        body: { role, experience, expertise, criteria },
      } = req;

      const generateTools: OpenAIApi.Chat.Completions.ChatCompletionTool[] = [
        {
          type: "function",
          function: {
            name: "generate_summarized_word_list",
            description:
              "Generate a structured summarized word list based on job role, experience level, expertise and interview criteria.",
            parameters: {
              type: "object",
              properties: {
                role: { type: "string" },
                experience: { type: "integer" },
                expertise: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "List of skills/technologies to cover in interviews",
                },
                criteria: {
                  type: "object",
                  properties: {
                    "Initial Screening Interview": {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: { type: "string" },
                          expertise: {
                            type: "array",
                            items: { type: "string" },
                            description:
                              "Specific expertise areas related to this category",
                          },
                          questions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                ques: { type: "string" },
                              },
                              required: ["ques"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["category", "expertise", "questions"],
                        additionalProperties: false,
                      },
                    },
                    "First-Round (In-Person or Detailed Video) Interview": {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          category: { type: "string" },
                          expertise: {
                            type: "array",
                            items: { type: "string" },
                            description:
                              "Specific expertise areas related to this category",
                          },
                          questions: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                ques: { type: "string" },
                              },
                              required: ["ques"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["category", "expertise", "questions"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: [
                    "Initial Screening Interview",
                    "First-Round (In-Person or Detailed Video) Interview",
                  ],
                  additionalProperties: false,
                },
              },
              required: ["role", "experience", "expertise", "criteria"],
              additionalProperties: false,
            },
            strict: true,
          },
        },
      ];

      const response = await OpenAIClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that generates structured question lists based on job roles, experience levels, and interview criteria.",
          },
          {
            role: "user",
            content: `I want to hire a ${role} with experience of ${experience} years and must have skills from ${expertise.join(",")}, tell me all the questions i should be asking for in detail  for the following stages below. give me all the questions with in a category, so i understand which stage of the category is this. Minimum 3 questions for each category.`,
          },
          {
            role: "user",
            content: JSON.stringify({ role, experience, expertise, criteria }),
          },
        ],
        tools: generateTools,
        store: true,
      });

      const result = JSON.parse(
        response.choices[0].message!.tool_calls?.[0]?.function
          .arguments as string
      );
      res
        .status(StatusCodes.OK)
        .send(
          new ResponseHelper(
            "Question summerized word generated successfully",
            result
          )
        );
    } catch (error: any) {
      console.error(
        "Error occured while generatinr a question summerized word",
        JSON.stringify(error, null, 2)
      );
      next(catchErrors(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
  }

  /**
   * For generating one perticular question
   * @param req
   * @param res
   * @param next
   */
  public static async GenerateIndividualQuestionGenratorController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log("into the Generate individual question");
    console.log(req.body)
    try {
      const {
        body: { role, experience, category, subCategory, keyword },
      } = req;
      console.log(
        "into the generate question",
        role,
        experience,
        category,
        subCategory,
        keyword
      );
      const generateQuestionTools: OpenAIApi.Chat.Completions.ChatCompletionTool[] =
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
                      "generate interview question for given category, subcategory and keywords",
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

      const response = await OpenAIClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that generates interview questions strictly based on a given job role, experience level, main category, sub-category, and keyword. Only generate questions relevant to the provided criteria.",
          },
          {
            role: "user",
            content: `Generate one short and relevant interview questions for a candidate applying for the role of "${role}" with ${experience} years of experience.
                        Keyword: "${keyword}"  
                        Sub-category: "${subCategory}"
                        Main category: "${category}"  
                        Ensure the questions are concise and directly related to the keyword.  
                        Return the response as a JSON array of strings.`,
          },
        ],
        response_format: { type: "json_object" },
      });

      console.log(JSON.stringify(response.choices[0].message.content, null, 2));
      const result = JSON.parse(response.choices[0].message.content!);
      res
        .status(StatusCodes.OK)
        .send(new ResponseHelper("Question generated successfully", result));
    } catch (error: any) {
      console.error(
        "Error occured while generating a questions for summerized word",
        JSON.stringify(error, null, 2)
      );
      next(catchErrors(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
  }

    /**
   *
   * @param req
   * @param res
   * @param next
   * @returns List of Roles
   * @description : Changes have been done by Nidhi are as below
   * - add the condition on the job role fetch operation
   * - if data is there in DB than fetch from there or from AI
   *
   */
    public static async GetJobRolesController(
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      try {
        const {
          body: { role },
        } = req;
        console.log("into get job role controller", role);
        let existingJobRoles = await JobRoleModel.find({
          roles: { $regex: role, $options: "i" },
        });
        existingJobRoles = await JobRoleModel.aggregate([
          {
            $project: {
              roles: {
                $filter: {
                  input: "$roles",
                  as: "role",
                  cond: {
                    $regexMatch: { input: "$$role", regex: role, options: "i" },
                  },
                },
              },
            },
          },
        ]);
        console.log("existingJobRoles", existingJobRoles);
  
        if ([...(existingJobRoles?.[0]?.roles || [])].length) {
          console.log("from database!");
          res.status(StatusCodes.OK).send(
            new ResponseHelper("Question rating updated successfully", {
              role,
              roles: existingJobRoles?.[0]?.roles || [],
            })
          );
          return;
        } else {
          // generate role list from AI
          console.log("into the AI Role Generation");
          // const response: OpenAIApi.Chat.Completions.ChatCompletion =
          //   await OpenAIClient.chat.completions.create({
          //     model: "gpt-4o",
          //     messages: [
          //       {
          //         role: "user",
          //         content: `Keyword: ${role}`,
          //       },
          //       {
          //         role: "system",
          //         content:"You are a job search assistant. Given a keyword, return a JSON array of job titles related to it. Exclude explanations or formatting—just the array."
          //       },
          //     ],
          //   });

          const response = await OpenAIClient.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: "Find job titles that are related to the keyword '${role}'.The keyword can be a job role, technology, industry term, or specialization. Provide a comprehensive list of relevant job titles across different industries.",
              },
              {
                role: "system",
                content:
                  "You are a job search assistant. Given a keyword, return only a structured list of job titles related to the keyword. Exclude any extra explanations, numbers, or formatting. The output should be a plain JSON array of job titles.",
              },
            ],
          });
  
          console.log(
            JSON.stringify(response.choices[0].message.content, null, 2)
          );
          const result = parseJobList(response.choices[0].message.content!);
          await JobRoleModel.updateOne(
            { _id: new mongoose.Types.ObjectId("67a9da5b5056cde501a87548") }, // Use a fixed document for storing all roles
            { $addToSet: { roles: { $each: result || [] } } }, // Append only unique roles
            { upsert: true } // Create document if not exists
          );
  
          res.status(StatusCodes.OK).send(
            new ResponseHelper("Jobs roles fetch successfully", {
              role,
              roles: result,
            })
          );
        }
      } catch (error: any) {
        console.error(
          "Error occured while fetching a Job roles",
          JSON.stringify(error, null, 2)
        );
        next(catchErrors(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
      }
    }
  

  /**
   * @param req
   * @param res
   * @param next
   * @returns List of expertise
   * @description Get xpertise from the DB or generate from AI
   * - get the expertises from teh role
   * - if role not exists create one and generate expertise
   * - add more expertise if users add manually
   */

  public static async GetJobExpertiseController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        body: { role, experience },
      } = req;

      let existingExpertise = await ExpertiseModel.find({ role , experiencelevel: experience });

      if (existingExpertise.length > 0) {
        // return the expertise
        console.log("role is exists into the system!");
        res.status(StatusCodes.OK).send(
          new ResponseHelper(
            `Expertise for the role ${role} retrived successfully`,
            {
              role,
              expertise: existingExpertise?.[0].expertise || [],              
            }
          )
        );
        return;
      } else {
        //create role expertise mannually in expertise collection
        const response: OpenAIApi.Chat.Completions.ChatCompletion =
          await OpenAIClient.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: `List exactly 5 technical & non-technical skills or areas of expertise required for a ${role} role with between ${experience} years of working experience. Format the response as a plain list, one item per line, without numbering or extra text.`,
              },
              {
                role: "system",
                content: `You are an expert career advisor. Return a list of exactly 5 key skills (both technical and soft) needed for a given job role and experience level. Format the output as a plain, unnumbered list.`,
              },
            ],
          });

        const result = parseJobList(response.choices[0].message.content!);
        const doc = new ExpertiseModel({
          role,
          expertise: result,
          experiencelevel: experience
        });
        await doc.save();

        res.status(StatusCodes.OK).send(
          new ResponseHelper("Jobs roles fetch successfully", {
            role,
            expertise: result,
          })
        );
      }
    } catch (error: any) {
      console.error(
        "Error occured while fetching a Job roles",
        JSON.stringify(error, null, 2)
      );
      next(catchErrors(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
  }

  /**
   * Create Expertise Mannually
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public static async SaveExpertiseManually(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const {
      body: { role, expertise },
    } = req;
    console.log("body", req.body);
    try {
      // find role and add expertise into the array

      const expertiseSaved = await ExpertiseModel.updateOne(
        { role },
        { $addToSet: { expertise: { $each: [expertise] } } } // Append only unique expertise
      );
      res.status(StatusCodes.OK).send(
        new ResponseHelper(
          `Expertise for the role ${role} retrived successfully`,
          {
            role,
            expertise: expertiseSaved || [],
          }
        )
      );
      return;
    } catch (error: any) {
      console.error(
        "Error occured while fetching a role expertise",
        JSON.stringify(error, null, 2)
      );
      next(catchErrors(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
  }

  public static pollFineTuneJob = async (jobId: string, interval = 5000): Promise<string> => {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const job = await OpenAIClient.fineTuning.jobs.retrieve(jobId);
          console.log(`[Polling] Status: ${job.status}`);
  
          if (job.status === 'succeeded') {
            console.log("Fine-tuning completed. Model ID:", job.fine_tuned_model);
            resolve(job.fine_tuned_model!);
          } else if (job.status === 'failed') {
            console.error("Fine-tuning failed:", job);
            reject(new Error("Fine-tuning failed"));
          } else {
            setTimeout(checkStatus, interval); // Keep checking
            // resolve(job.fine_tuned_model!);
          }
        } catch (error) {
          reject(error);
        }
      };
  
      checkStatus();
    });
  };

  /**
   * save data for the training of model
   */
  public static async SaveFileWithExistingPromptResult(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const {
      body: { role, dataToSave },
    } = req;
    try {
      // find role and add expertise into the array
      // save whole data to the jsonL file and create that file to the folder
      // save data into file
      const filePath = await saveFileJson("./output", `${role}`, dataToSave);
      console.log(`[file path] : ${filePath}`);

      //upload file to the 
      try {
        const file = await OpenAIClient.files.create({
          file: fs.createReadStream(filePath),
          purpose: "fine-tune",
        });
        try {
          //create a job for the tuning
          const fineTune = await OpenAIClient.fineTuning.jobs.create({
            training_file: file.id,
            model: "gpt-4o-mini-2024-07-18",
            });
          console.log("finetune job", fineTune);
          try {
            const waitForFineTune = OpenAIController.
            pollFineTuneJob(fineTune.id, 50000)
            console.log("fine tune status", waitForFineTune);
            res.status(StatusCodes.OK).send(
              new ResponseHelper(`Ai is learning with the given knowledge!`, {
                waitForFineTune,
              })
            );
            return;
          } catch (error) {
            throw error;
          }
        } catch (error) {
          console.log("error in creating job", error);
          throw error;
        }
      } catch (error) {
        console.log("error in create finetune file");
        throw error;
      }

      //get the status of the finetunning
    } catch (error: any) {
      console.log(error);
      console.error(
        "Error occured while fetching a role expertise",
        JSON.stringify(error, null, 2)
      );
      next(catchErrors(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
  }
}

export default OpenAIController;
