import { NextResponse } from "next/server";
export function jsonError(error: unknown) {
  const isError = error instanceof Error;
  const message = isError ? error.message : "Unexpected server error";
  const duplicate = typeof error === "object" && error !== null && "code" in error && error.code === 11000;
  const validation = isError && (error.name === "ZodError" || error.name === "ValidationError");
  const databaseUnavailable = isError && error.name === "MongooseServerSelectionError";
  const missingDatabaseConfig = isError && message === "MONGODB_URI is not configured";
  const missingAuthConfig = isError && message.startsWith("AUTH_SECRET must be set");
  const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : duplicate ? 409 : validation ? 400 : databaseUnavailable || missingDatabaseConfig || missingAuthConfig ? 503 : 500;
  const safeMessage = databaseUnavailable ? "Database is unreachable. Check the host's MONGODB_URI and the Atlas Network Access allowlist." : missingDatabaseConfig ? "Set MONGODB_URI in this deployment's environment settings, then redeploy." : missingAuthConfig ? "Set AUTH_SECRET in this deployment's environment settings, then redeploy." : status === 500 ? "Unexpected server error" : duplicate ? "This record already exists" : message;
  return NextResponse.json({ error: safeMessage }, { status });
}
