import { Codex } from "@openai/codex-sdk";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const productKnowledgeUrl =
  "http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/";

const childOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    harnessAccessible: { type: "boolean" },
    harnessFilesRead: {
      type: "array",
      items: { type: "string" },
    },
    productKnowledgeAccessible: { type: "boolean" },
    productKnowledgeUrlsRetrieved: {
      type: "array",
      items: { type: "string" },
    },
    jobSearchContext: { type: "string" },
    failures: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          area: {
            type: "string",
            enum: ["harness", "productKnowledge"],
          },
          reason: { type: "string" },
        },
        required: ["area", "reason"],
      },
    },
  },
  required: [
    "harnessAccessible",
    "harnessFilesRead",
    "productKnowledgeAccessible",
    "productKnowledgeUrlsRetrieved",
    "jobSearchContext",
    "failures",
  ],
} as const;

const prompt = `
You are the read-only child agent for a small Harness connectivity smoke test.

Do not create, edit, rename, or delete any file. Do not run commands that mutate the repository or external systems.

Perform these checks yourself and report only facts you actually retrieved:

1. From your current working directory, read all of:
   - AGENTS.md
   - shared-harness-contract.md
   - workflows/prd-draft-clarification.md
2. Open ${productKnowledgeUrl} using curl with read-only GET requests. Do not use Browser Use or web search. Follow only links needed to locate Job Vision Job Search context.
3. Return a short summary of the Job Search context you actually retrieved. Do not fill gaps from general knowledge.
4. If a local file or internal page cannot be accessed, preserve that uncertainty and put the exact observed error in failures.

Set harnessAccessible=true only if all three requested local files were successfully read.
Set productKnowledgeAccessible=true only if internal Product Knowledge content was successfully retrieved (not merely DNS-resolved or redirected to an unreadable login/error page).
List the concrete Product Knowledge URL(s) whose content supports the summary.
`;

type ChildResult = {
  harnessAccessible: boolean;
  harnessFilesRead: string[];
  productKnowledgeAccessible: boolean;
  productKnowledgeUrlsRetrieved: string[];
  jobSearchContext: string;
  failures: Array<{
    area: "harness" | "productKnowledge";
    reason: string;
  }>;
};

type SmokeResult = {
  startedAt: string;
  finishedAt: string;
  repositoryRoot: string;
  childThreadCreated: boolean;
  childThreadId: string | null;
  harnessAccessible: boolean;
  productKnowledgeAccessible: boolean;
  jobSearchContext: string;
  childResult: ChildResult | null;
  failures: Array<{ area: string; reason: string }>;
};

const startedAt = new Date();
const temporaryCodexHome = await mkdtemp(join(tmpdir(), "harness-eval-codex-"));
const originalCodexHome =
  process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
const childConfig = `
default_permissions = "harness_eval_read_network"

[features.network_proxy]
enabled = true
allow_local_binding = true

[permissions.harness_eval_read_network]
description = "Read-only Harness smoke test with internal Product Knowledge access."
extends = ":read-only"

[permissions.harness_eval_read_network.network]
enabled = true
allow_local_binding = true

[permissions.harness_eval_read_network.network.domains]
"platform-eng.pages.git.jvoffice.ir" = "allow"
`;

await writeFile(resolve(temporaryCodexHome, "config.toml"), childConfig, "utf8");
await symlink(
  resolve(originalCodexHome, "auth.json"),
  resolve(temporaryCodexHome, "auth.json"),
);

const childEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => entry[1] !== undefined,
  ),
);
childEnvironment.CODEX_HOME = temporaryCodexHome;

const codex = new Codex({ env: childEnvironment });
let childThreadCreated = false;
let childThreadId: string | null = null;
let childResult: ChildResult | null = null;
const failures: Array<{ area: string; reason: string }> = [];
let thread: ReturnType<Codex["startThread"]> | null = null;

try {
  thread = codex.startThread({
    workingDirectory: repositoryRoot,
    approvalPolicy: "never",
    webSearchMode: "disabled",
  });

  const turn = await thread.run(prompt, {
    outputSchema: childOutputSchema,
  });
  childThreadId = thread.id;
  childThreadCreated = childThreadId !== null;

  if (!turn.finalResponse) {
    throw new Error("Child completed without a final response.");
  }

  childResult = JSON.parse(turn.finalResponse) as ChildResult;
  failures.push(...childResult.failures);
} catch (error) {
  childThreadId = thread?.id ?? null;
  childThreadCreated = childThreadId !== null;
  failures.push({
    area: "childThread",
    reason: error instanceof Error ? error.stack ?? error.message : String(error),
  });
} finally {
  await rm(temporaryCodexHome, { recursive: true, force: true });
}

const smokeResult: SmokeResult = {
  startedAt: startedAt.toISOString(),
  finishedAt: new Date().toISOString(),
  repositoryRoot,
  childThreadCreated,
  childThreadId,
  harnessAccessible: childResult?.harnessAccessible ?? false,
  productKnowledgeAccessible:
    childResult?.productKnowledgeAccessible ?? false,
  jobSearchContext: childResult?.jobSearchContext ?? "",
  childResult,
  failures,
};

await mkdir(runsDirectory, { recursive: true });
const timestamp = startedAt.toISOString().replaceAll(":", "-");
const outputPath = resolve(runsDirectory, `orchestrator-smoke-${timestamp}.json`);
await writeFile(outputPath, `${JSON.stringify(smokeResult, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ outputPath, ...smokeResult }, null, 2));

if (
  !smokeResult.childThreadCreated ||
  !smokeResult.harnessAccessible ||
  !smokeResult.productKnowledgeAccessible
) {
  process.exitCode = 1;
}
