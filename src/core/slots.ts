// src/core/slots.ts
import YAML from "yaml";

// data (JSON imports work because tsconfig sets resolveJsonModule: true)
import LEVELS from "../data/levels.json";
import TOPICS from "../data/topics.json";
import SUBTOPICS from "../data/subtopics.json";
// yml is bundled as text (tsup loader) and loaded in Vitest via a tiny plugin
import FORMAT_LEXICON_TEXT from "../rules/format-lexicon.yml";

export type Slots = {
  level: string | null;
  topic: string | null;
  subtopic: string | null;
  format: "cours" | "exercice" | "qcm" | "demonstration" | null;
};

type LevelRec = { id: string; aliases: string[] };
type TopicRec = { id: string; synonyms: string[] };
type SubtopicRec = { id: string; topicId: string; synonyms: string[] };
type Format = NonNullable<Slots["format"]>;

const formatLexicon: Record<Format, string[]> = (() => {
  const parsed = YAML.parse(FORMAT_LEXICON_TEXT) as Record<string, string[]>;
  const map: Record<Format, string[]> = {
    cours: (parsed.cours ?? []).map(norm),
    exercice: (parsed.exercice ?? []).map(norm),
    qcm: (parsed.qcm ?? []).map(norm),
    demonstration: (parsed.demonstration ?? []).map(norm)
  };
  return map;
})();

const levels: LevelRec[] = (LEVELS as LevelRec[]).map((l) => ({
  id: l.id,
  aliases: l.aliases.map(norm)
}));
const topics: TopicRec[] = (TOPICS as TopicRec[]).map((t) => ({
  id: t.id,
  synonyms: t.synonyms.map(norm)
}));
const subtopics: SubtopicRec[] = (SUBTOPICS as SubtopicRec[]).map((s) => ({
  id: s.id,
  topicId: s.topicId,
  synonyms: s.synonyms.map(norm)
}));

function norm(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function includesWord(paddedHaystack: string, needle: string): boolean {
  // simple “word-ish” containment on normalized text
  return (
    paddedHaystack.includes(` ${needle} `) ||
    paddedHaystack.endsWith(` ${needle}`) ||
    paddedHaystack.includes(` ${needle},`) ||
    paddedHaystack.includes(` ${needle}.`)
  );
}

export function extractSlots(normalizedText: string): Slots {
  const text = norm(normalizedText);
  const padded = ` ${text} `;

  // format (priority: qcm > exercice > demonstration > cours)
  let format: Slots["format"] = null;
  const fmtOrder: Format[] = ["qcm", "exercice", "demonstration", "cours"];
  for (const f of fmtOrder) {
    const lex = formatLexicon[f] ?? [];
    if (lex.some((w: string) => includesWord(padded, w))) {
      format = f;
      break;
    }
  }

  // level
  let level: string | null = null;
  for (const l of levels) {
    if (l.aliases.some((a: string) => includesWord(padded, a))) {
      level = l.id;
      break;
    }
  }

  // topic
  let topic: string | null = null;
  for (const t of topics) {
    if (t.synonyms.some((a: string) => includesWord(padded, a))) {
      topic = t.id;
      break;
    }
  }

  // subtopic (must also set topic if not set)
  let subtopic: string | null = null;
  for (const s of subtopics) {
    if (s.synonyms.some((a: string) => includesWord(padded, a))) {
      subtopic = s.id;
      if (!topic) topic = s.topicId;
      break;
    }
  }

  return { level, topic, subtopic, format };
}
