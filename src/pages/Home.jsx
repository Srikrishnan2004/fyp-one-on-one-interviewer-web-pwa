import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    key: "language",
    title: "Programming Languages",
    description: "JavaScript, Python, Java, C++, C#, Go, Rust, TypeScript.",
  },
  {
    key: "framework",
    title: "Framework-based Questions",
    description: "React, Angular, Vue, Next.js.",
  },
  {
    key: "skills",
    title: "Skill & Tools Questions",
    description: "Git, Docker, CI/CD, Cloud, and others.",
  },
  {
    key: "data",
    title: "Data & Algorithms",
    description: "DSA, SQL, NoSQL, and system design.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const categoryStyles = useMemo(
    () => ({
      language: {
        bg: "from-rose-500 via-pink-500 to-fuchsia-500",
        ring: "ring-rose-300/60",
        badge: "from-rose-200 to-pink-200",
      },
      framework: {
        bg: "from-indigo-500 via-violet-500 to-purple-500",
        ring: "ring-indigo-300/60",
        badge: "from-indigo-200 to-violet-200",
      },
      skills: {
        bg: "from-emerald-500 via-teal-500 to-cyan-500",
        ring: "ring-emerald-300/60",
        badge: "from-emerald-200 to-teal-200",
      },
      data: {
        bg: "from-amber-500 via-orange-500 to-red-500",
        ring: "ring-amber-300/60",
        badge: "from-amber-200 to-orange-200",
      },
    }),
    []
  );

  const optionsByCategory = useMemo(
    () => ({
      language: [
        { key: "javascript", label: "JavaScript" },
        { key: "typescript", label: "TypeScript" },
        { key: "python", label: "Python" },
        { key: "java", label: "Java" },
        { key: "cpp", label: "C++" },
        { key: "csharp", label: "C#" },
        { key: "go", label: "Go" },
        { key: "rust", label: "Rust" },
      ],
      framework: [
        { key: "react", label: "React" },
        { key: "nextjs", label: "Next.js" },
        { key: "angular", label: "Angular" },
        { key: "vue", label: "Vue" },
        { key: "node", label: "Node.js" },
        { key: "express", label: "Express" },
      ],
      skills: [
        { key: "git", label: "Git" },
        { key: "docker", label: "Docker" },
        { key: "kubernetes", label: "Kubernetes" },
        { key: "ci-cd", label: "CI/CD" },
        { key: "aws", label: "AWS" },
        { key: "gcp", label: "GCP" },
        { key: "azure", label: "Azure" },
      ],
      data: [
        { key: "dsa", label: "Data Structures & Algorithms" },
        { key: "sql", label: "SQL" },
        { key: "nosql", label: "NoSQL" },
        { key: "system-design", label: "System Design" },
      ],
    }),
    []
  );

  const openCategory = (categoryKey) => {
    setActiveCategory(categoryKey);
  };

  const handleSelect = (optionKey) => {
    const categoryKey = activeCategory;
    setActiveCategory(null);
    navigate(`/interview?category=${categoryKey}&topic=${optionKey}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900/90 drop-shadow-sm">
          Virtual AI Interviewer
        </h1>
        <p className="mt-3 text-base md:text-lg text-gray-700">
          Choose a category to start your tailored interview.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl w-full">
        {categories.map((item, index) => (
          <motion.button
            key={item.key}
            onClick={() => openCategory(item.key)}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.05 * index, duration: 0.45, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative overflow-hidden rounded-2xl p-6 text-left shadow-lg shadow-black/20 ring-1 ${
              categoryStyles[item.key]?.ring || "ring-white/50"
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                categoryStyles[item.key]?.bg || "from-pink-400 to-violet-400"
              }`}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              transition={{ duration: 0.8, delay: 0.15 * index }}
              className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/30 blur-2xl"
            />
            <div className="relative">
              <div className="flex items-start justify-between">
                <h2 className="text-lg md:text-xl font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                  {item.title}
                </h2>
                <span className={`ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${
                  categoryStyles[item.key]?.badge || "from-pink-200 to-violet-200"
                } text-gray-900 text-sm font-bold shadow-sm ring-1 ring-black/10`}>
                  {index + 1}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">{item.description}</p>
              <div className="mt-5 inline-flex items-center text-sm font-semibold text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                Start
                <svg
                  className="ml-2 h-4 w-4 opacity-90 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-10 text-xs text-gray-700/80"
      >
        Tip: You can install this as a PWA from your browser menu.
      </motion.p>

      {activeCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setActiveCategory(null)}
          />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="relative z-10 w-full sm:max-w-xl mx-auto rounded-t-3xl sm:rounded-3xl bg-white/90 backdrop-blur-md border border-white/60 shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900/90">
                {categories.find((c) => c.key === activeCategory)?.title}
              </h3>
              <button
                onClick={() => setActiveCategory(null)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-black/5 text-gray-800"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(optionsByCategory[activeCategory] || []).map((opt, i) => (
                <motion.button
                  key={opt.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={() => handleSelect(opt.key)}
                  className={`rounded-xl border border-black/10 bg-white/85 hover:bg-white text-gray-900/90 text-sm font-medium px-3 py-2 text-left shadow-sm ring-1 ${
                    categoryStyles[activeCategory]?.ring || "ring-black/10"
                  }`}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>

            <div className="mt-5 text-[11px] text-gray-700/80">
              Pick one to start a tailored interview.
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}


