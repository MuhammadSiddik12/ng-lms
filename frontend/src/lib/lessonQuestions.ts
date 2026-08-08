export interface LessonQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

function hashSeed(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Warm-up questions shown before the lesson timer starts. */
export function getLessonQuestions(lesson: {
  id: string;
  title: string;
  content: string;
  course?: { category: string } | null;
}): LessonQuestion[] {
  const category = (lesson.course?.category || "").toLowerCase();
  const title = lesson.title.toLowerCase();
  const bank: LessonQuestion[] = [];

  if (category.includes("program") || title.includes("typescript") || title.includes("type")) {
    bank.push(
      {
        id: "ts-1",
        prompt: "What is the main benefit of TypeScript?",
        options: [
          "Faster runtime than JavaScript",
          "Static typing and earlier bug detection",
          "It replaces HTML",
          "It removes the need for tests",
        ],
        correctIndex: 1,
      },
      {
        id: "ts-2",
        prompt: "Which keyword defines a reusable type shape?",
        options: ["style", "interface", "className", "import"],
        correctIndex: 1,
      }
    );
  }

  if (category.includes("front") || title.includes("react") || title.includes("chart")) {
    bank.push(
      {
        id: "fe-1",
        prompt: "In React, what is a component?",
        options: [
          "A reusable UI building block",
          "A database table",
          "A CSS file only",
          "A server process",
        ],
        correctIndex: 0,
      },
      {
        id: "fe-2",
        prompt: "Why use loading / empty states?",
        options: [
          "To slow the app down",
          "To improve clarity while data is missing or loading",
          "To replace authentication",
          "To hide errors forever",
        ],
        correctIndex: 1,
      }
    );
  }

  if (category.includes("data") || title.includes("sql") || title.includes("index")) {
    bank.push(
      {
        id: "sql-1",
        prompt: "What does a foreign key do?",
        options: [
          "Encrypts passwords",
          "Links rows between related tables",
          "Caches API responses",
          "Styles the UI",
        ],
        correctIndex: 1,
      },
      {
        id: "sql-2",
        prompt: "Why add indexes?",
        options: [
          "To make common lookups faster",
          "To delete unused tables",
          "To replace primary keys",
          "To style charts",
        ],
        correctIndex: 0,
      }
    );
  }

  bank.push(
    {
      id: "gen-1",
      prompt: `Ready for “${lesson.title}”? What’s a good study habit?`,
      options: [
        "Skim once and quit",
        "Focus, take notes, then practice",
        "Skip the content entirely",
        "Only watch without reading",
      ],
      correctIndex: 1,
    },
    {
      id: "gen-2",
      prompt: "When should you mark a lesson complete?",
      options: [
        "Before opening it",
        "After you understand and finish the material",
        "Never",
        "Only if a mentor asks",
      ],
      correctIndex: 1,
    },
    {
      id: "gen-3",
      prompt: "What will this session timer measure?",
      options: [
        "Page load speed",
        "Your active study time for this lesson",
        "Network latency",
        "Database size",
      ],
      correctIndex: 1,
    }
  );

  const seed = hashSeed(lesson.id + lesson.title);
  const picked: LessonQuestion[] = [];
  const used = new Set<string>();
  let i = 0;
  while (picked.length < 3 && i < bank.length * 2) {
    const q = bank[(seed + i * 7) % bank.length];
    if (!used.has(q.id)) {
      used.add(q.id);
      picked.push(q);
    }
    i += 1;
  }
  return picked;
}
