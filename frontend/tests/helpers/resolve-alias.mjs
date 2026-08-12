import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = pathToFileURL(path.join(root, specifier.slice(2)) + ".ts").href;
    return { url: target, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
