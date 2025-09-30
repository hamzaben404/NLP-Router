import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import meta2020 from "ajv/dist/refs/json-schema-2020-12/schema.json" assert { type: "json" };
import schema from "./schema.json" assert { type: "json" };

const ajv = new Ajv2020({
  allErrors: true,
  strict: true
});

// Only add the 2020-12 meta-schema if it isn't already present.
// This prevents: "schema with key ... already exists".
const META_ID = "https://json-schema.org/draft/2020-12/schema";
if (!ajv.getSchema(META_ID)) {
  ajv.addMetaSchema(meta2020);
}

addFormats(ajv);

const validate = ajv.compile(schema);

/**
 * Throws with a readable message if the object doesn't match RouterOutput schema.
 */
export function validateRouterOutput(obj: unknown) {
  const ok = validate(obj);
  if (!ok) {
    const msg = ajv.errorsText(validate.errors, { separator: " | " });
    throw new Error(`RouterOutput schema validation failed: ${msg}`);
  }
}
