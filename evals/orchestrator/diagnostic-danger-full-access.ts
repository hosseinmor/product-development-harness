import { Codex } from "@openai/codex-sdk";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const productKnowledgeUrl =
  "http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/";

const childOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    internalUrlAccessible: { type: "boolean" },
    entryHttpResult: { type: "string" },
    retrievedUrls: {
      type: "array",
      items: { type: "string" },
    },
    jobSearchContext: { type: "string" },
    failures: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "internalUrlAccessible",
    "entryHttpResult",
    "retrievedUrls",
    "jobSearchContext",
    "failures",
  ],
} as const;

const prompt = `
This is a narrowly scoped network diagnostic. Although your sandbox mode is danger-full-access, behave read-only.

Do not read, create, edit, rename, or delete any local file. Do not run git. Do not mutate any external system.

Use curl with read-only GET requests to fetch only this entry URL:
${productKnowledgeUrl}

Report the actual HTTP/result. If the entry page succeeds, inspect its returned content and follow at most the same-host links needed to find one page clearly related to Job Search. Read that page and return its title or a short context grounded only in what you retrieved.

Do not use Browser Use or web search. Do not access any unrelated host. If anything fails, return the exact observed error. An empty or generic response is not successful retrieval.
`;

type ChildResult = {
  internalUrlAccessible: boolean;
  entryHttpResult: string;
  retrievedUrls: string[];
  jobSearchContext: string;
  failures: string[];
};

type DiagnosticResult = {
  startedAt: string;
  finishedAt: string;
  repositoryRoot: string;
  sandboxMode: "danger-full-access";
  networkAccessEnabled: true;
  childThreadCreated: boolean;
  childThreadId: string | null;
  internalUrlAccessible: boolean;
  entryHttpResult: string;
  jobSearchContextRetrieved: boolean;
  jobSearchContext: string;
  childResult: ChildResult | null;
  projectChangedByChild: boolean;
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
    sandboxMode: "danger-full-access",
    networkAccessEnabled: true,
    approvalPolicy: "never",
    webSearchMode: "disabled",
  });

  const turn = await thread.run(prompt, {
    outputSchema: childOutputSchema,
  });
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

const result: DiagnosticResult = {
  startedAt: startedAt.toISOString(),
  finishedAt: new Date().toISOString(),
  repositoryRoot,
  sandboxMode: "danger-full-access",
  networkAccessEnabled: true,
  childThreadCreated: childThreadId !== null,
  childThreadId,
  internalUrlAccessible: childResult?.internalUrlAccessible ?? false,
  entryHttpResult: childResult?.entryHttpResult ?? "",
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
  `orchestrator-diagnostic-danger-full-access-${timestamp}.json`,
);
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ outputPath, ...result }, null, 2));

if (
  !result.childThreadCreated ||
  !result.internalUrlAccessible ||
  !result.jobSearchContextRetrieved ||
  result.projectChangedByChild
) {
  process.exitCode = 1;
}
