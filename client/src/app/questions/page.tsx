"use client";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { CircleArrowLeft, CircleX, Loader } from 'lucide-react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { APIResults } from '@/interface/API.def';
import InterviewQuestionPanel from './InterviewQuestionPanel';
import { onSetNewQuestionUnderCategory } from '@/lib/global/Global.replica.slice';

type Props = {};
const Questions = ({ }: Props) => {
    const state = useAppSelector(state => state.globalreplica);
    const router = useRouter();
    const [error, setError] = React.useState<any>(null);
    const [questionsCriteria, setQuestionsCriteria] = React.useState<any>(
        { _id: "", role: "", experience: "", expertise: [""], criteria: {} });
    const [trainingStatus, setTrainingStatus] = React.useState<boolean>(false);
    const [isLoadingModelLearning, setIsLoadingModelLearning] = React.useState<boolean>(false)
    const dispatch = useAppDispatch();
    console.log("state", state)

    React.useEffect(() => {
        setQuestionsCriteria(state.SummerizedQuestionWordList)
    }, [state.SummerizedQuestionWordList]);

    const letRegenerateQuestion = async (param: any) => {
        try {
            setError(null);
            setIsLoadingModelLearning(true);
            const response = await axios.post<APIResults<any>>
                ('http://localhost:3010/api/v1/opanai/generate/summerizedquestions',
                    {
                        role: questionsCriteria.role,
                        experience: questionsCriteria.experience,
                        category: param.category,
                        subCategory: param.subcategory,
                        keyword: param.q
                    },
                    { headers: { "Content-Type": "application/json" } }
                );

            // Extract data
            const res = response.data;
            console.log("data back from the controller", res);
            dispatch(onSetNewQuestionUnderCategory({
                category: param.category,
                subCategory: param.subcategory,
                value: res.data.questions[0],
                qIndex : param.qIndex,
                subcatIndex:param.sIndex
            }));
        } catch (error: any) {
            console.log("Error ocurred while generating a questions", error);
            setError({ message: "Something went wrong! please try again" });
        } finally {
            console.log("individual question is generated" , state);
        }
    }

    const trainModelWithData = async () => {
        console.log('make the finetuning code!');
        try {
            setError(null);
            setIsLoadingModelLearning(true);
            const response = await axios.post<APIResults<{ questions: string[] }>>('http://localhost:3010/api/v1/opanai/train/modeldata',
                {
                    role: questionsCriteria.role,
                    dataToSave: [questionsCriteria]
                },
                { headers: { "Content-Type": "application/json" } }
            );

            // Extract data
            const data = response.data;
            console.log("data back from the controller", data);


            setTimeout(() => {
                setIsLoadingModelLearning(false);
                setTrainingStatus(true);
            }, 10000);
            setTimeout(() => {
                setTrainingStatus(false);
            }, 5000);

        } catch (error: any) {
            console.log("Error ocurred while generating a questions", error);
            setError({ message: "Something went wrong! please try again" });
        } finally {
            setTrainingStatus(true);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center p-24">
            <div className="w-[1000px] m-auto">
                <div className="flex items-center gap-2 text-4xl text-center font-extrabold text-blue-500">
                    <CircleArrowLeft size={30} className="animate-bounce cursor-pointer" onClick={() => router.push('/')} />
                    <div className="flex-1">{questionsCriteria?.role}</div>
                </div>
                <hr className="mt-2" />
                <div className="text-3xl text-center font-extrabold">Questions</div>
                <div className="relative mt-[3rem]">
                    <InterviewQuestionPanel data={questionsCriteria}
                        reGenerateQuestion={(data: any) => { letRegenerateQuestion(data) }} />
                </div>
                <div className="flex justify-center mt-[3rem]">
                   <button className='m-10 bg-green-900 rounded-md p-5 text-[1rem] text-gray-200' onClick={() => { console.log("click on submit!!"); trainModelWithData() }}>Submit</button>                    
                </div>
            </div>

            {!!error && (
                <div className="fixed center top-2 w-auto">
                    <div className="bg-red-200 py-3 px-5 rounded-full">
                        <div className="text-base font-semibold flex gap-2 items-center"><CircleX className="text-red-700" />{error?.message}</div>
                    </div>
                </div>
            )}
            {trainingStatus && (
                <div className="fixed center top-2 w-auto">
                    <div className="bg-green-200 py-3 px-5 rounded-full">
                        <div className="text-base font-semibold flex gap-2 items-center"><CircleX className="text-green-700" />Refrence has been saved for future!</div>
                    </div>
                </div>
            )}
        </div>
    )
};

export default Questions;