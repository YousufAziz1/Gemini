import { db } from "../db.js";
import { makeAgent } from "./base.js";
import { logEvent } from "./events.js";

const markPublished = db.prepare(`
  UPDATE content_posts SET status = 'published', engagement = ?, published_at = datetime('now')
  WHERE id = ?
`);

export const socialAgent = makeAgent("SocialAgent", async ({ runId, context }) => {
  const { client } = context;
  if (!client) throw new Error("socialAgent requires context.client");

  const drafts = db
    .prepare(`SELECT * FROM content_posts WHERE client_id = ? AND status = 'draft' ORDER BY created_at ASC LIMIT 3`)
    .all(client.id);

  if (drafts.length === 0) {
    logEvent({
      runId,
      agent: "SocialAgent",
      action: "skip",
      detail: `No drafts to publish for ${client.name}.`,
      level: "warn",
    });
    return 0;
  }

  for (const post of drafts) {
    const engagement = Math.floor(8 + Math.random() * 40);
    markPublished.run(engagement, post.id);
    logEvent({
      runId,
      agent: "SocialAgent",
      action: "publish",
      detail: `Published ${post.platform} post for ${client.name}. Engagement: ${engagement} interactions.`,
      level: "success",
    });
  }
  return drafts.length;
});
