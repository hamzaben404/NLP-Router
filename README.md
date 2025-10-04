# nlp-router

> A tiny, ESM-only router that turns a **French** user prompt into a structured action + slots (intent, topic, level, etc.), with safety and policy gating.

- ✅ 100% TypeScript types included
- ✅ Language gate (FR only) + safety checks
- ✅ Deterministic, regex/YAML-driven intent detection
- ✅ Small API surface: one function, `routePrompt`

## Install

```bash
npm i nlp-router
```

> **Node.js**: requires **Node 18+**
> **Module format**: **ESM-only** (use dynamic import for CommonJS, see below)

## Quick start

```ts
import { routePrompt } from "nlp-router";

const out = routePrompt({
  message: "Je veux des exercices sur les équations du 2nd degré",
});

console.log(out);
/*
{
  action: "ROUTE",
  language: "fr",
  intent: "PRACTICE_TOPIC",
  level: null,
  topic: "equations_second_degre",
  subtopic: null,
  format: "exercice",
  constraints: { difficulte: "auto", duree: null, indices: "oui" }
}
*/
```

### CommonJS usage (dynamic import)

```js
(async () => {
  const { routePrompt } = await import("nlp-router");
  const out = routePrompt({ message: "voici ma solution, est-ce correct ?" });
  console.log(out);
})();
```

## API

### `routePrompt(input: RouterInput): RouterOutput`

#### `RouterInput`

```ts
type RouterInput = {
  message: string;
  userProfile?: { level?: string | null };
};
```

#### `RouterOutput` (shape)

```ts
type RouterOutput = {
  action: "ROUTE" | "CLARIFY" | "UNSUPPORTED_LANGUAGE" | "BLOCKED";
  language: "fr" | "non_fr" | null;
  intent:
    | "ASK_EXPLANATION"
    | "START_DIAGNOSTIC"
    | "PRACTICE_TOPIC"
    | "CHECK_SOLUTION"
    | "GENERATE_PLAN"
    | "OTHER_SUPPORT"
    | null;
  level: string | null;
  topic: string | null;
  subtopic: string | null;
  format: "cours" | "exercice" | "qcm" | "demonstration" | null;
  constraints: {
    difficulte: "auto" | "facile" | "moyen" | "difficile";
    duree: string | null; // e.g. "30min"
    indices: "oui" | "non";
  };
  clarify?: { question: string };
  reasonCode?:
    | "unsupported_language"
    | "inappropriate_content"
    | "internal_validation_error"
    | "unknown";
};
```

### Behavior (at a glance)

- **Safety first**: inappropriate content → `action: "BLOCKED"`.
- **FR-only**: non-French → `action: "UNSUPPORTED_LANGUAGE"`.
- **Intent & slots** are extracted from the normalized prompt.
- **Policy** decides `ROUTE` vs `CLARIFY`:
  - `START_DIAGNOSTIC` routes if `level` is known; otherwise clarifies.
  - `PRACTICE_TOPIC` routes if a `topic` is present; otherwise clarifies.
  - `CHECK_SOLUTION` always **clarifies** to request the solution to review.
  - `ASK_EXPLANATION` routes if a `topic` is present; otherwise clarifies.

## Development

```bash
npm run check     # lint + typecheck + test
npm run build     # ESM bundle + d.ts
npm run test
```

> The package bundles YAML rules and validation schemas—no runtime file I/O required.

## License

[ISC](./LICENSE)

```

---

### `LICENSE` (ISC)
ISC License

Copyright (c) 2025, HMZ4040

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted,
provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN
AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE
OF THIS SOFTWARE.
```
