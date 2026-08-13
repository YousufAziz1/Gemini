import { logEvent } from "./events.js";

export function makeAgent(name, fn) {
  return async function runAgent({ runId = null, context = {} }) {
    const started = Date.now();
    logEvent({ runId, agent: name, action: "start", detail: "Task accepted." });
    try {
      const result = await fn({ runId, context });
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      logEvent({
        runId,
        agent: name,
        action: "complete",
        detail: `Finished in ${elapsed}s`,
        level: "success",
      });
      return result;
    } catch (err) {
      logEvent({
        runId,
        agent: name,
        action: "error",
        detail: err.message,
        level: "error",
      });
      throw err;
    }
  };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
