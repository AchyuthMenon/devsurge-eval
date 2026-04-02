import { useAuth } from "@/context/AuthContext";
import { useSubmissions, Submission } from "@/context/SubmissionContext";
import { questionTypeLabels, QuestionType, Question } from "@/data/questions";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

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
        const userSubs = await getUserSubmissions(user.id);
        setSubs(userSubs);
      }
      setLoading(false);
    };

    if (user?.id) fetchData();
  }, [user]);

  if (!user) return <Navigate to="/login" />;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading results...</div>;

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
    const total = typeQuestions.length;
    return {
      name: questionTypeLabels[type],
      type,
      solved,
      total,
      percentage: total > 0 ? Math.round((solved / total) * 100) : 0,
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
              <RechartsTooltip
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

      {/* Skill Heatmap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="rounded-lg border border-border bg-card p-6 mb-8"
      >
        <h2 className="font-display font-semibold mb-6 flex items-center justify-between">
          <span>Skill Distribution</span>
        </h2>

        <div className="h-80 relative flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={typeData}>
              <PolarGrid stroke="hsl(215 12% 20%)" strokeWidth={1} />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fill: "hsl(215 12% 70%)", fontSize: 12, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Proficiency"
                dataKey="percentage"
                stroke="hsl(215, 100%, 70%)"
                strokeWidth={2}
                fill="hsl(215, 100%, 70%)"
                fillOpacity={0.4}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(220 18% 10%)",
                  border: "1px solid hsl(220 14% 18%)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: any, name: string, props: any) => [
                  `${props.payload.solved} / ${props.payload.total} Solved`,
                  "Proficiency"
                ]}
                labelFormatter={(label) => label}
              />
            </RadarChart>
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
