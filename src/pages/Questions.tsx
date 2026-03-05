import { useState } from "react";
import { questions, questionTypeLabels, QuestionType } from "@/data/questions";
import { useAuth } from "@/context/AuthContext";
import { useSubmissions } from "@/context/SubmissionContext";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const types: (QuestionType | "all")[] = ["all", "debugging", "dsa", "output-prediction", "code-completion", "edge-case"];

const Questions = () => {
  const [filter, setFilter] = useState<QuestionType | "all">("all");
  const { user } = useAuth();
  const { getUserSubmissions } = useSubmissions();

  const solvedIds = new Set(
    getUserSubmissions(user?.id || "")
      .filter((s) => s.status === "accepted")
      .map((s) => s.questionId)
  );

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
