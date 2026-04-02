import { useState, useEffect } from "react";
import { questionTypeLabels, QuestionType, Question } from "@/data/questions";
import { useAuth } from "@/context/AuthContext";
import { useSubmissions } from "@/context/SubmissionContext";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const types: (QuestionType | "all")[] = ["all", "debugging", "dsa", "output-prediction", "code-completion", "edge-case"];

const Questions = () => {
  const [filter, setFilter] = useState<QuestionType | "all">("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());

  const { user } = useAuth();
  const { getUserSubmissions } = useSubmissions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/questions");
        if (res.ok) {
          const data = await res.json();
          setQuestions(data);
        }
      } catch (e) {
        console.error("Failed to fetch questions");
      }

      if (user?.id) {
        const subs = await getUserSubmissions(user.id);
        const solved = new Set(
          subs.filter((s) => s.status === "accepted").map((s) => s.questionId)
        );
        setSolvedIds(solved);
      }
    };
    fetchData();
  }, [user]);

  const filtered = filter === "all" ? questions : questions.filter((q) => q.type === filter);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold gradient-text mb-1">Challenges</h1>
        <p className="text-muted-foreground mb-6">
          {solvedIds.size}/{questions.length} completed
        </p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-6">
        {types.map((t) => (
          <Button
            key={t}
            variant={filter === t ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(t)}
            className="text-xs"
          >
            {t === "all" ? "All" : questionTypeLabels[t]}
          </Button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map((q, i) => (
          <QuestionCard key={q.id} question={q} index={i} solved={solvedIds.has(q.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No challenges in this category yet.</p>
      )}
    </div>
  );
};

export default Questions;
