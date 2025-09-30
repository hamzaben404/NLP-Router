// src/validation/validate.ts
import Ajv from "ajv";
import addFormats from "ajv-formats";
import schema from "./schema.json" assert { type: "json" };

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);

// helper you can call after building an output
export function validateRouterOutput(obj: unknown) {
  const ok = validate(obj);
  if (!ok) {
    const msg = ajv.errorsText(validate.errors, { separator: " | " });
    throw new Error(`RouterOutput schema validation failed: ${msg}`);
  }
}
