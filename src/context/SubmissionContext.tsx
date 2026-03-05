import React, { createContext, useContext, useState, useEffect } from "react";

export interface Submission {
  id: string;
  userId: string;
  questionId: string;
  submittedCode: string;
  output: string;
  status: "accepted" | "wrong_answer" | "error";
  executionTime: string;
  memoryUsed: string;
  createdAt: string;
}

interface SubmissionContextType {
  submissions: Submission[];
  addSubmission: (sub: Omit<Submission, "id" | "createdAt">) => Submission;
  getUserSubmissions: (userId: string) => Submission[];
  getQuestionSubmissions: (userId: string, questionId: string) => Submission[];
}

const SubmissionContext = createContext<SubmissionContextType | null>(null);

export const useSubmissions = () => {
  const ctx = useContext(SubmissionContext);
  if (!ctx) throw new Error("useSubmissions must be inside SubmissionProvider");
  return ctx;
};

export const SubmissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("sdep_submissions");
    if (stored) setSubmissions(JSON.parse(stored));
  }, []);

  const save = (subs: Submission[]) => {
    localStorage.setItem("sdep_submissions", JSON.stringify(subs));
    setSubmissions(subs);
  };

  const addSubmission = (sub: Omit<Submission, "id" | "createdAt">) => {
    const newSub: Submission = {
      ...sub,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...submissions, newSub];
    save(updated);
    return newSub;
  };

  const getUserSubmissions = (userId: string) =>
    submissions.filter((s) => s.userId === userId);

  const getQuestionSubmissions = (userId: string, questionId: string) =>
    submissions.filter((s) => s.userId === userId && s.questionId === questionId);

  return (
    <SubmissionContext.Provider value={{ submissions, addSubmission, getUserSubmissions, getQuestionSubmissions }}>
      {children}
    </SubmissionContext.Provider>
  );
};
