# NLP Router — API Contract (v1)

## Purpose

Turn a raw French prompt into a structured decision the app can route.

## Input

```json
{
  "message": "string",
  "userProfile": { "level": "string|null" }
}
```

- `message` (required): the user’s text in natural language.
- `userProfile.level` (optional): previously known level (used as fallback).

## Output

```json
{
  "action": "ROUTE | CLARIFY | UNSUPPORTED_LANGUAGE | BLOCKED",
  "language": "fr | non_fr | null",
  "intent": "ASK_EXPLANATION | START_DIAGNOSTIC | PRACTICE_TOPIC | CHECK_SOLUTION | GENERATE_PLAN | OTHER_SUPPORT | null",
  "level": "string|null",
  "topic": "string|null",
  "subtopic": "string|null",
  "format": "cours | exercice | qcm | demonstration | null",
  "constraints": {
    "difficulte": "auto | facile | moyen | difficile",
    "duree": "NNmin|null",
    "indices": "oui | non"
  },

  "clarify": { "question": "string" }, // present only when action == "CLARIFY"
  "reasonCode": "unsupported_language | inappropriate_content | internal_validation_error | unknown" // only when action == "UNSUPPORTED_LANGUAGE" or "BLOCKED"
}
```

### Field notes

- `language`: `"fr"` if accepted French; `"non_fr"` if detected otherwise; `null` only if unknown.
- `intent`: one of the six intents or `null` if unknown (e.g., during `CLARIFY`).
- `level/topic/subtopic`: normalized IDs (e.g., `3e_college`, `equations_second_degre`, `discriminant`) or `null`.
- `format`: inferred desired content type or `null` if not applicable.
- `constraints.duree`: normalized as `"NNmin"` (e.g., `"30min"`) or `null`.
- `clarify.question`: single, short follow-up; included only for `CLARIFY`.
- `reasonCode`: machine-readable reason; included only for `UNSUPPORTED_LANGUAGE` or `BLOCKED`.

## Action policy (summary)

- **ROUTE**: downstream modules use `intent` + slots.
- **CLARIFY**: `clarify.question` **must** be provided; ask the user, do not route yet.
- **UNSUPPORTED_LANGUAGE**: show “FR uniquement”; `reasonCode="unsupported_language"`.
- **BLOCKED**: safety or internal validation; include a `reasonCode`.

## Minimal examples

### ROUTE (practice)

```json
{
  "action": "ROUTE",
  "language": "fr",
  "intent": "PRACTICE_TOPIC",
  "level": "3e_college",
  "topic": "derivees",
  "subtopic": null,
  "format": "exercice",
  "constraints": { "difficulte": "moyen", "duree": null, "indices": "oui" }
}
```

### CLARIFY

```json
{
  "action": "CLARIFY",
  "language": "fr",
  "intent": null,
  "level": null,
  "topic": null,
  "subtopic": null,
  "format": "cours",
  "constraints": { "difficulte": "auto", "duree": null, "indices": "oui" },
  "clarify": {
    "question": "Sur quel chapitre veux-tu travailler ? (ex: équations du 2nd degré, dérivées…)"
  }
}
```

### UNSUPPORTED_LANGUAGE

```json
{
  "action": "UNSUPPORTED_LANGUAGE",
  "language": "non_fr",
  "intent": null,
  "level": null,
  "topic": null,
  "subtopic": null,
  "format": null,
  "constraints": { "difficulte": "auto", "duree": null, "indices": "oui" },
  "reasonCode": "unsupported_language"
}
```

### BLOCKED

```json
{
  "action": "BLOCKED",
  "language": "fr",
  "intent": null,
  "level": null,
  "topic": null,
  "subtopic": null,
  "format": null,
  "constraints": { "difficulte": "auto", "duree": null, "indices": "oui" },
  "reasonCode": "inappropriate_content"
}
```
