import { db, uniqueId } from "../db.js";
import { makeAgent } from "./base.js";
import { generate } from "./llm.js";
import { logEvent } from "./events.js";

const insertPost = db.prepare(`
  INSERT INTO content_posts (id, client_id, platform, status, text, created_by, created_at)
  VALUES (?, ?, ?, 'draft', ?, 'ContentAgent', datetime('now'))
`);

export const contentAgent = makeAgent("ContentAgent", async ({ runId, context }) => {
  const { client, count = 3, force } = context;
  if (!client) throw new Error("contentAgent requires context.client");

  const existing = db
    .prepare(`SELECT COUNT(*) AS c FROM content_posts WHERE client_id = ? AND status = 'draft'`)
    .get(client.id).c;
  if (existing >= 2 && !force) {
    logEvent({
      runId,
      agent: "ContentAgent",
      action: "skip",
      detail: `Draft queue already healthy (${existing} drafts). No new content needed.`,
      level: "warn",
    });
    return [];
  }

  const platforms = ["Facebook", "Instagram", "Google Business"];
  const posts = [];
  for (let i = 0; i < count; i++) {
    const platform = platforms[i % platforms.length];
    logEvent({
      runId,
      agent: "ContentAgent",
      action: "writing",
      detail: `Drafting ${platform} post for ${client.name}...`,
    });
    const { text, simulated } = await generate({
      system:
        "You are the Content Agent at LocalBoost, an AI-run digital agency for local small businesses. Write a short, warm, conversion-focused social post (max 300 chars). Never invent specific prices, dates, or events — keep it evergreen.",
      prompt: `Write a marketing post for ${client.name}, a ${client.industry} in ${client.location}. Brand voice: ${client.tagline}.`,
      context: { kind: "content", businessName: client.name, platform, tagline: client.tagline },
    });
    const id = uniqueId("post");
    insertPost.run(id, client.id, platform, text);
    posts.push({ id, platform, text });
    logEvent({
      runId,
      agent: "ContentAgent",
      action: "created",
      detail: `${platform} draft saved (#${id.slice(-6)}). ${simulated ? "[simulated]" : "[live Gemini]"} ${text.slice(0, 90)}...`,
    });
  }
  return posts;
});
