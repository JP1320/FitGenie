import { apiError } from "../utils/apiError.js";

export function errorHandler(err, req, res, next) {
  console.error(err);
  return res.status(500).json(apiError("INTERNAL_ERROR", "Unexpected server error"));
}
