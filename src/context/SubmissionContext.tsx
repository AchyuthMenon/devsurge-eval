import React, { createContext, useContext, useState, useEffect } from "react";

export interface Submission {
  id: string;
  userId: string;
  questionId: string;
  submittedCode: string;
  language: string;
  output: string;
  status: "accepted" | "wrong_answer" | "error";
  errorType?: string;
  executionTime: string;
  memoryUsed: string;
  aiScore?: number | null;
  createdAt: string;
}

interface SubmissionContextType {
  submissions: Submission[];
  addSubmission: (sub: Omit<Submission, "id" | "createdAt" | "status" | "output" | "executionTime" | "memoryUsed" | "aiScore" | "errorType">) => Promise<Submission | null>;
  getUserSubmissions: (userId: string) => Promise<Submission[]>;
  getQuestionSubmissions: (userId: string, questionId: string) => Promise<Submission[]>;
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
    // Optionally fetch all on mount, but we will rely on contextual fetching
  }, []);

  const addSubmission = async (sub: Omit<Submission, "id" | "createdAt" | "status" | "output" | "executionTime" | "memoryUsed" | "aiScore" | "errorType">): Promise<Submission | null> => {
    try {
      const res = await fetch("http://localhost:5000/api/submissions/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (res.ok) {
        const newSub = await res.json();
        setSubmissions((prev) => [...prev, newSub]);
        return newSub;
      }
      return null;
    } catch {
      return null;
    }
  };

  const getUserSubmissions = async (userId: string): Promise<Submission[]> => {
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
        return data;
      }
      return [];
    } catch {
      return [];
    }
  };

  const getQuestionSubmissions = async (userId: string, questionId: string): Promise<Submission[]> => {
    try {
      const res = await fetch(`http://localhost:5000/api/submissions/user/${userId}/question/${questionId}`);
      if (res.ok) return await res.json();
      return [];
    } catch {
      return [];
    }
  };

  return (
    <SubmissionContext.Provider value={{ submissions, addSubmission, getUserSubmissions, getQuestionSubmissions }}>
      {children}
    </SubmissionContext.Provider>
  );
};
