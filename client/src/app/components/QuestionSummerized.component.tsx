
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Bot, CircleX, Loader } from "lucide-react";
import axios from 'axios';
import { useAppDispatch } from "@/lib/store";
import { APIResults } from "@/interface/API.def";
import { IExpertiseDTO, IJobRoleDTO, IQuestionsDTO } from "@/interface/OpenAI.def";
import * as lodash from "lodash"
import { onSetSummerizedQuestionsWordList } from "@/lib/global/Global.replica.slice";

export default function QuestionSummerizedComponent() {
  const router = useRouter()
  const dispatch = useAppDispatch();
  const [role, setRole] = React.useState<string>('');
  const [experience, setExperience] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSearching, setIsSearching] = React.useState<boolean>(false);
  const [isLoadingSearch, setIsLoadingSearch] = React.useState<boolean>(false);
  const [expertise, setExpertise] = React.useState<string[]>([]);
  const [showAddMoreText, setShowAddMoreText] = React.useState<boolean>(false);
  const [isExpertiseLoading, setIsExpertiseLoading] = React.useState<boolean>(false);
  const [newExpertise, setNewExpertise] = React.useState<string>("");
  const [jobRoles, setJobRoles] = React.useState<ReadonlyArray<string>>([]);
  const [error, setError] = React.useState<any>(null);

  const generateQuestions = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!role) {
      return setError({ message: "Role is required" });
    }

    setError(null);
    setIsLoading(true);
    
    try {
      const response = await axios.post<APIResults<IQuestionsDTO>>('http://localhost:3010/api/v1/opanai/questionsummerized',
        {
          role,
          experience,
          expertise,
          criteria: [
            "Initial Screening Interview",
            "First-Round (In-Person or Detailed Video) Interview"
          ]
        }, // Request body
        { headers: { "Content-Type": "application/json" } }
      );

      // Extract data
      const data = response.data;

      // Dispatch the result
      dispatch(onSetSummerizedQuestionsWordList(data?.data));
      router.push('/questions');
    } catch (error: any) {
      console.log("Error ocurred while generating a questions", error);
      setError({ message: "Something went wrong! please try again" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async (search: string) => {
    if (!search || search === "") return;

    try {
      setIsLoadingSearch(true);
      const response = await axios.post<APIResults<IJobRoleDTO>>('http://localhost:3010/api/v1/opanai/jobroles',
        { role: search },
        { headers: { "Content-Type": "application/json" } }
      );
      setJobRoles(response.data?.data?.roles)
    } catch (error) {
      console.log("Error ocurred while getting job roles", error);
    }
    finally {
      setIsLoadingSearch(false);
    }
  };
    
  const debounceSearch = React.useCallback(lodash.debounce((search) => fetchRoles(search), 1000), []);
  React.useEffect(() => {
    return () => {
      debounceSearch.cancel();
    };
  }, []);

  const onSelectJobRole = (role: string) => {
    setRole(role);
    setIsSearching(false);
  };

  const fetchExpertise = async () => {
    console.log("fetch expertise");
    event?.preventDefault();

    if (!role) {
      return setError({ message: "Role is required" });
    }
    if(!experience){
      return setError({ message: "Experience is required"})
    }

    setError(null);
    setIsExpertiseLoading(true);
    try {
      const response = await axios.post<APIResults<IExpertiseDTO>>('http://localhost:3010/api/v1/opanai/fetch/expertise',
        {
          role,
          experience,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // Extract data
      const data = response.data;
      setExpertise(data.data.expertise);
    } catch (error: any) {
      console.log("Error ocurred while generating a questions", error);
      setError({ message: "Something went wrong! please try again" });
    } finally {
      setIsExpertiseLoading(false);
    }
  };

  const handleAddMoreExpertise = async () => {
    setIsExpertiseLoading(true);
    try {
      const response = await axios.post<APIResults<any>>('http://localhost:3010/api/v1/opanai/add/expertise',
        {
          role,
          expertise: newExpertise,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // Extract data
      const data = response.data;
      setExpertise([...expertise, newExpertise]);
    } catch (error: any) {
      console.log("Error ocurred while generating a questions", error);
      setError({ message: "Something went wrong! please try again" });
    } finally {
      setIsExpertiseLoading(false);
      setShowAddMoreText(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
      <div className="w-full max-w-lg mt-5 bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={generateQuestions} className="space-y-6">
          <div className="text-4xl text-center font-extrabold text-blue-500">Generate Question Summary</div>
          <p className="mt-2 text-center text-gray-600">
            This AI assists you in generating a question summary tailored to a specific role, helping you prepare effectively for interviews.
          </p>

          <div className="relative mt-8">
            <input
              type="text"
              placeholder="Enter role"
              className="w-full rounded-md border py-2 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              disabled={isLoading}
              required
              value={role}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setError(null);
                setRole(event.target.value);
                if (event.target.value !== "") {
                  setIsSearching(true);
                  setIsLoadingSearch(true);
                  debounceSearch(event.target.value)
                } else {
                  setIsSearching(false);
                }
                setJobRoles([]);
              }}
            />
            {isSearching && (
              <div className="absolute mt-2 bg-white shadow-lg w-full h-auto max-h-60 overflow-y-auto rounded-md border">
                {jobRoles.length ? (
                  <>
                    {jobRoles.map((role) => (
                      <div
                        key={role}
                        className="px-4 py-3 cursor-pointer hover:bg-gray-200 font-semibold"
                        onClick={() => onSelectJobRole(role)}
                      >
                        {role}
                      </div>
                    ))}
                  </>
                ) : (!isLoadingSearch && (
                  <div className="px-4 py-3 font-bold">NO JOBS FOUND!</div>
                ))}
                {isLoadingSearch && (
                  <div className="px-4 py-3 text-center">
                    <Loader size={20} className="animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Enter total no of experience"
              className="w-full mt-4 rounded-md border py-2 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              disabled={isLoading}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setExperience(event.target.value);
              }}
              required
            />
          </div>

          {/* Add Default Expertise Generator */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              className="flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded-md focus:bg-blue-400 disabled:opacity-50"
              onClick={() => { fetchExpertise(); }}
              disabled={isExpertiseLoading}
            >
              {!isExpertiseLoading ? (
                <ShieldCheck size={20} />
              ) : (
                <Loader size={20} className="animate-spin" />
              )}
              <span className="ml-2">Get Default Expertise</span>
            </button>
          </div>
          {expertise.length > 0 ?
            <div className="mt-4 text-center text-gray-600">
              <p className="font-medium">
                Thanks for selecting the role and years of experience. Here are the areas we think you should focus on during your interview preparation:
              </p>
            </div>
            : <></>
          }

          <div className="flex flex-wrap gap-2 mt-4">
            {expertise.map((data, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-gray-500 p-2 text-xs font-medium text-gray-200 ring-1 ring-gray-500/10"
              >
                {data}
              </span>
            ))}
            {expertise.length > 0 ?
            <span
              className="inline-flex items-center rounded-md bg-indigo-500 p-2 text-xs font-medium text-gray-200 ring-1 ring-indigo-700/10 cursor-pointer"
              onClick={() => { setShowAddMoreText(true); }}
            >
              ... + Add More
            </span> : <></>}
          </div>

          {showAddMoreText && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Add new required skill"
                className="w-full rounded-md border py-2 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="newExpertise"
                onChange={(e) => { e.preventDefault(); setNewExpertise(e.target.value); }}
                value={newExpertise}
              />
              <button
                type="button"
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md focus:bg-green-400"
                onClick={handleAddMoreExpertise}
              >
                Add
              </button>
            </div>
          )}

          <button
            type="submit"
            className="mt-6 w-full bg-blue-500 py-2 text-white rounded-md flex items-center justify-center focus:bg-blue-400"
            disabled={isLoading}
          >
            {!isLoading ? <Bot size={20} /> : <Loader size={20} className="animate-spin" />}
            <span className="pl-2 text-lg font-semibold">Generate Questions</span>
          </button>
        </form>
      </div>

      {!!error && (
        <div className="fixed top-4 right-4 w-auto">
          <div className="bg-red-200 py-3 px-5 rounded-lg shadow-md">
            <div className="text-base font-semibold text-red-700 flex items-center gap-2">
              <CircleX className="text-red-700" />
              {error?.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}