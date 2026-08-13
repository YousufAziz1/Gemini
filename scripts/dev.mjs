import { spawn } from "node:child_process";

const server = spawn("node", ["server/src/index.js"], {
  stdio: "inherit",
  env: { ...process.env, PORT: process.env.PORT || "8080" },
});

const client = spawn(
  "npm",
  ["--prefix", "client", "run", "dev", "--", "--port", "5173", "--strictPort"],
  { stdio: "inherit", env: { ...process.env } },
);

const stop = () => {
  server.kill("SIGTERM");
  client.kill("SIGTERM");
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
