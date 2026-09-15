import { Codex } from "@openai/codex-sdk";
import { execFile } from "node:child_process";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const snapshotPrefix = "product-knowledge-snapshot-";

const snapshots = (await readdir(runsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name.startsWith(snapshotPrefix))
  .map((entry) => entry.name)
  .sort();
const latestSnapshot = snapshots.at(-1);
if (!latestSnapshot) {
  throw new Error(
    "No Product Knowledge snapshot found. Run npm run snapshot:product-knowledge first.",
  );
}

const snapshotDirectory = resolve(runsDirectory, latestSnapshot);
const snapshotRelativePath = `evals/runs/${latestSnapshot}`;
const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    snapshotAccessible: { type: "boolean" },
    snapshotPageCount: { type: "number" },
    retrievedPages: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          url: { type: "string" },
          title: { type: "string" },
        },
        required: ["url", "title"],
      },
    },
    jobSearchContext: { type: "string" },
    failures: { type: "array", items: { type: "string" } },
  },
  required: [
    "snapshotAccessible",
    "snapshotPageCount",
    "retrievedPages",
    "jobSearchContext",
    "failures",
  ],
} as const;

type ChildResult = {
  snapshotAccessible: boolean;
  snapshotPageCount: number;
  retrievedPages: Array<{ url: string; title: string }>;
  jobSearchContext: string;
  failures: string[];
};

async function gitStatus(): Promise<string> {
  const { stdout } = await execFileAsync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: repositoryRoot },
  );
  return stdout;
}

const prompt = `
You are a read-only child agent testing local Product Knowledge retrieval.

Do not use the network, Browser Use, web search, or any external tool. Do not create, edit, rename, or delete files. Do not run git.

Use only this local snapshot directory, relative to your current repository root:
${snapshotRelativePath}

1. Read manifest.json to confirm the snapshot and its page count.
2. Search all records in pages.jsonl yourself. Do not assume a preselected feature subset.
3. Find the most relevant page or pages for Job Search. Consider both English and Persian terminology present in the snapshot.
4. Return the original URL and title of each page you actually used, plus a short Job Search context grounded only in their text.
5. If retrieval fails or evidence is insufficient, report the exact reason instead of filling gaps from general knowledge.
`;

const startedAt = new Date();
const statusBefore = await gitStatus();
const codex = new Codex();
let thread: ReturnType<Codex["startThread"]> | null = null;
let childThreadId: string | null = null;
let childResult: ChildResult | null = null;
const failures: string[] = [];

try {
  thread = codex.startThread({
    workingDirectory: repositoryRoot,
    sandboxMode: "read-only",
    networkAccessEnabled: false,
    approvalPolicy: "never",
    webSearchMode: "disabled",
  });
  const turn = await thread.run(prompt, { outputSchema });
  childThreadId = thread.id;

  if (!turn.finalResponse) {
    throw new Error("Child completed without a final response.");
  }

  childResult = JSON.parse(turn.finalResponse) as ChildResult;
  failures.push(...childResult.failures);
} catch (error) {
  childThreadId = thread?.id ?? null;
  failures.push(
    error instanceof Error ? error.stack ?? error.message : String(error),
  );
}

const statusAfter = await gitStatus();
const projectChangedByChild = statusAfter !== statusBefore;
if (projectChangedByChild) {
  failures.push("Git status changed while the child thread was running.");
}

const result = {
  startedAt: startedAt.toISOString(),
  finishedAt: new Date().toISOString(),
  repositoryRoot,
  snapshotDirectory,
  sandboxMode: "read-only",
  networkAccessEnabled: false,
  childThreadCreated: childThreadId !== null,
  childThreadId,
  snapshotAccessible: childResult?.snapshotAccessible ?? false,
  snapshotPageCount: childResult?.snapshotPageCount ?? 0,
  jobSearchContextRetrieved: Boolean(childResult?.jobSearchContext.trim()),
  jobSearchContext: childResult?.jobSearchContext ?? "",
  childResult,
  projectChangedByChild,
  failures,
};

await mkdir(runsDirectory, { recursive: true });
const timestamp = startedAt.toISOString().replaceAll(":", "-");
const outputPath = resolve(
  runsDirectory,
  `orchestrator-snapshot-smoke-${timestamp}.json`,
);
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputPath, ...result }, null, 2));

if (
  !result.childThreadCreated ||
  !result.snapshotAccessible ||
  !result.jobSearchContextRetrieved ||
  result.projectChangedByChild
) {
  process.exitCode = 1;
}
