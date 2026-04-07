export function parseModelJson(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("MODEL_OUTPUT_NOT_JSON");
  }
}
