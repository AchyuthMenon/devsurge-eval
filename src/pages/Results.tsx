import { useAuth } from "@/context/AuthContext";
import { useSubmissions } from "@/context/SubmissionContext";
import { questions, questionTypeLabels, QuestionType } from "@/data/questions";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const typeColors: Record<QuestionType, string> = {
  debugging: "#f87171",
  dsa: "#60a5fa",
  "output-prediction": "#fb923c",
  "code-completion": "#34d399",
  "edge-case": "#a78bfa",
};

const Results = () => {
  const { user } = useAuth();
  const { getUserSubmissions } = useSubmissions();

  if (!user) return <Navigate to="/login" />;

  const subs = getUserSubmissions(user.id);
  const accepted = subs.filter((s) => s.status === "accepted");
  const uniqueSolved = new Set(accepted.map((s) => s.questionId)).size;
  const totalAttempts = subs.length;
  const accuracy = totalAttempts > 0 ? ((accepted.length / totalAttempts) * 100).toFixed(0) : "0";

  // Stats by type
  const typeData = (Object.keys(questionTypeLabels) as QuestionType[]).map((type) => {
    const typeQuestions = questions.filter((q) => q.type === type);
    const solved = typeQuestions.filter((q) =>
      accepted.some((s) => s.questionId === q.id)
    ).length;
    return {
      name: questionTypeLabels[type],
      type,
      solved,
      total: typeQuestions.length,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold gradient-text mb-1">Your Performance</h1>
        <p className="text-muted-foreground mb-8">Track your progress across all challenge types</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Solved", value: uniqueSolved, sub: `of ${questions.length}` },
          { label: "Attempts", value: totalAttempts, sub: "total" },
          { label: "Accuracy", value: `${accuracy}%`, sub: "acceptance rate" },
          { label: "Streak", value: "—", sub: "coming soon" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-xs text-muted-foreground/60">{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-border bg-card p-6 mb-8"
      >
        <h2 className="font-display font-semibold mb-4">Progress by Category</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215 12% 50%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215 12% 50%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220 18% 10%)",
                  border: "1px solid hsl(220 14% 18%)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value}/${props.payload.total}`,
                  "Solved",
                ]}
              />
              <Bar dataKey="solved" radius={[4, 4, 0, 0]}>
                {typeData.map((entry) => (
                  <Cell key={entry.type} fill={typeColors[entry.type]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Submissions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-display font-semibold mb-4">Recent Submissions</h2>
        {subs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No submissions yet. Start solving challenges!</p>
        ) : (
          <div className="space-y-2">
            {subs.slice(-10).reverse().map((s) => {
              const q = questions.find((q) => q.id === s.questionId);
              return (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm font-medium">{q?.title || "Unknown"}</span>
                    <span className={`ml-2 text-xs font-mono ${s.status === "accepted" ? "text-neon-green" : "text-neon-red"}`}>
                      {s.status === "accepted" ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {s.executionTime} · {s.memoryUsed}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
