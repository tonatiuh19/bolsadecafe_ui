import "dotenv/config";
import { createServer as createAPIServer } from "../api/index";

export function createServer() {
  // Use the same server configuration from api/index.ts
  return createAPIServer();
}
