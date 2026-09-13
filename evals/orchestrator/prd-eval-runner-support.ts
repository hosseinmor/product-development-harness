import { Codex, type Usage } from "@openai/codex-sdk";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { semanticFixtureRouterConfig } from "./semantic-fixture-router.js";

const execFileAsync = promisify(execFile);

export type FixtureRoute<TFixtureId extends string> = {
  status: "matched" | "ambiguous" | "no_match";
  fixtureIds: TFixtureId[];
  multipleDecisions: boolean;
  rationale: string;
};

export type RouterResult<TFixtureId extends string> = {
  threadId: string;
  routes: Array<FixtureRoute<TFixtureId>>;
  usage: Usage | null;
  isolation: {
    workingDirectoryWasEmpty: boolean;
    workingDirectoryUnchanged: boolean;
    networkAccessEnabled: false;
    passed: boolean;
  };
};

function routerOutputSchema(fixtureIds: string[]) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      routes: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            questionIndex: { type: "integer" },
            status: {
              type: "string",
              enum: ["matched", "ambiguous", "no_match"],
            },
            fixtureIds: {
              type: "array",
              items: { type: "string", enum: fixtureIds },
            },
            multipleDecisions: { type: "boolean" },
            rationale: { type: "string" },
          },
          required: [
            "questionIndex",
            "status",
            "fixtureIds",
            "multipleDecisions",
            "rationale",
          ],
        },
      },
    },
    required: ["routes"],
  } as const;
}

function routerPrompt(
  questions: string[],
  fixtures: ReadonlyArray<{ id: string; routingDescription: string }>,
): string {
  const descriptions = fixtures
    .map(({ id, routingDescription }) => `${id}: ${routingDescription}`)
    .join("\n");
  const indexedQuestions = questions
    .map((question, questionIndex) => `${questionIndex}: ${question}`)
    .join("\n");
  return `You are a Semantic Fixture Router, separate from the Product agent.

Your only task is to map each Product question to the decision fixture whose routing description directly answers the decision being requested.

Routing descriptions:
${descriptions}

Product questions:
${indexedQuestions}

Rules:
- Evaluate the requested Product decision semantically, not by keyword overlap.
- Identify the decision variable requested by the question and the decision variable resolved by each routing description. A match requires those decision variables to be semantically coextensive: the fixture answer would directly and fully resolve the question, rather than resolve only a related, broader, narrower, parent, or child decision.
- Semantic adjacency, a shared feature area, and shared terminology are not sufficient for a match.
- A question about the contents, configuration, parameters, or members of something must not match a fixture that only establishes the existence, type, or model of that thing, and vice versa.
- Before returning matched, ask: after applying the fixture answer, would the question be resolved without another Product decision? If not, return no_match unless more than one routing description is genuinely coextensive with the requested decision, in which case return ambiguous.
- A concept used only as background, example, proposal, consequence, or explicit exclusion must not trigger its fixture.
- Prefer ambiguous or no_match over revealing an extra fixture.
- Use matched only when the routing description directly and completely corresponds to the decision requested.
- An atomic question normally maps to exactly one fixture.
- Return multiple fixtureIds only when the question genuinely requests multiple independent Product decisions; set multipleDecisions=true.
- For ambiguous or no_match, return an empty fixtureIds array.
- Return one route for every questionIndex in the same order.
- Do not use tools, inspect files, or seek context. Fixture answers are intentionally unavailable.`;
}

function validateRouterResponse<TFixtureId extends string>(
  raw: unknown,
  questionCount: number,
  fixtureIds: TFixtureId[],
): Array<FixtureRoute<TFixtureId>> {
  const response = raw as {
    routes?: Array<FixtureRoute<TFixtureId> & { questionIndex: number }>;
  };
  if (!Array.isArray(response.routes) || response.routes.length !== questionCount) {
    throw new Error("Semantic Fixture Router returned the wrong number of routes.");
  }
  return response.routes.map((route, index) => {
    if (route.questionIndex !== index) {
      throw new Error(`Semantic Fixture Router changed question order at ${index}.`);
    }
    const ids = [...new Set(route.fixtureIds)];
    if (!ids.every((id) => fixtureIds.includes(id))) {
      throw new Error("Semantic Fixture Router returned an unknown fixture id.");
    }
    if (route.status !== "matched") {
      return {
        status: route.status,
        fixtureIds: [],
        multipleDecisions: false,
        rationale: route.rationale,
      };
    }
    if (ids.length === 0 || (ids.length > 1 && !route.multipleDecisions)) {
      return {
        status: "ambiguous",
        fixtureIds: [],
        multipleDecisions: false,
        rationale:
          ids.length === 0
            ? "Router returned matched without a fixture id."
            : "Router returned multiple fixtures without identifying multiple decisions.",
      };
    }
    return {
      status: "matched",
      fixtureIds: ids.sort(
        (left, right) => fixtureIds.indexOf(left) - fixtureIds.indexOf(right),
      ),
      multipleDecisions: route.multipleDecisions,
      rationale: route.rationale,
    };
  });
}

async function immediateFiles(directory: string): Promise<string[]> {
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

export async function routeQuestionsWithFixtureDescriptions<
  TFixtureId extends string,
>(input: {
  questions: string[];
  fixtures: ReadonlyArray<{
    id: TFixtureId;
    routingDescription: string;
  }>;
  temporaryDirectoryPrefix: string;
}): Promise<RouterResult<TFixtureId>> {
  const fixtureIds = input.fixtures.map(({ id }) => id);
  const workingDirectory = await mkdtemp(
    join(tmpdir(), `${input.temporaryDirectoryPrefix}-router-workspace-`),
  );
  const routerCodexHome = await mkdtemp(
    join(tmpdir(), `${input.temporaryDirectoryPrefix}-router-codex-`),
  );
  const originalCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
  const filesBefore = await immediateFiles(workingDirectory);
  try {
    const config = `
default_permissions = "semantic_fixture_router"

[permissions.semantic_fixture_router]
description = "Semantic fixture routing from question text and answer-independent descriptions only."

[permissions.semantic_fixture_router.filesystem]
":minimal" = "read"
${JSON.stringify(workingDirectory)} = "read"

[permissions.semantic_fixture_router.network]
enabled = false
`;
    await writeFile(resolve(routerCodexHome, "config.toml"), config, "utf8");
    await symlink(
      resolve(originalCodexHome, "auth.json"),
      resolve(routerCodexHome, "auth.json"),
    );
    const environment = Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
    environment.CODEX_HOME = routerCodexHome;
    const codex = new Codex({ env: environment });
    const thread = codex.startThread({
      model: semanticFixtureRouterConfig.model,
      modelReasoningEffort: semanticFixtureRouterConfig.reasoningEffort,
      workingDirectory,
      skipGitRepoCheck: true,
      networkAccessEnabled: false,
      approvalPolicy: "never",
      webSearchMode: "disabled",
    });
    const turn = await thread.run(routerPrompt(input.questions, input.fixtures), {
      outputSchema: routerOutputSchema(fixtureIds),
    });
    if (!thread.id || !turn.finalResponse) {
      throw new Error("Semantic Fixture Router completed without a result.");
    }
    const routes = validateRouterResponse(
      JSON.parse(turn.finalResponse) as unknown,
      input.questions.length,
      fixtureIds,
    );
    const filesAfter = await immediateFiles(workingDirectory);
    const workingDirectoryWasEmpty = filesBefore.length === 0;
    const workingDirectoryUnchanged =
      JSON.stringify(filesBefore) === JSON.stringify(filesAfter);
    return {
      threadId: thread.id,
      routes,
      usage: turn.usage,
      isolation: {
        workingDirectoryWasEmpty,
        workingDirectoryUnchanged,
        networkAccessEnabled: false,
        passed: workingDirectoryWasEmpty && workingDirectoryUnchanged,
      },
    };
  } finally {
    await Promise.all([
      rm(routerCodexHome, { recursive: true, force: true }),
      rm(workingDirectory, { recursive: true, force: true }),
    ]);
  }
}

export async function repositoryGitStatus(repositoryRoot: string): Promise<string> {
  const { stdout } = await execFileAsync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: repositoryRoot },
  );
  return stdout;
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function filesUnder(root: string): Promise<string[]> {
  const result: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) result.push(relative(root, path));
    }
  }
  await visit(root);
  return result.sort();
}

export async function inputHashes(root: string): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {};
  for (const path of await filesUnder(root)) {
    if (path === "outputs" || path.startsWith("outputs/")) continue;
    hashes[path] = createHash("sha256")
      .update(await readFile(resolve(root, path)))
      .digest("hex");
  }
  return hashes;
}

export async function createIsolatedPrdWorkspace(input: {
  repositoryRoot: string;
  workspaceDirectory: string;
  productKnowledgeRoot: string;
  productKnowledgeReferences: ReadonlyArray<{
    id: string;
    repositoryRelativePath: string;
    sha256: string;
  }>;
}): Promise<void> {
  for (const path of [
    "AGENTS.md",
    "shared-harness-contract.md",
    "workflows/prd-draft-clarification.md",
    "artifacts/prd.md",
  ]) {
    const target = resolve(input.workspaceDirectory, path);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(resolve(input.repositoryRoot, path), target);
  }
  await mkdir(resolve(input.workspaceDirectory, "outputs"), { recursive: true });
  const snapshotRoot = resolve(
    input.workspaceDirectory,
    "context/product-knowledge",
  );
  for (const reference of input.productKnowledgeReferences) {
    const target = resolve(snapshotRoot, reference.repositoryRelativePath);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(
      resolve(input.productKnowledgeRoot, reference.repositoryRelativePath),
      target,
    );
  }
  await writeFile(
    resolve(snapshotRoot, "manifest.json"),
    `${JSON.stringify(
      {
        kind: "frozen-selected-product-knowledge",
        references: input.productKnowledgeReferences.map(
          ({ id, repositoryRelativePath, sha256 }) => ({
            id,
            path: repositoryRelativePath,
            sha256,
          }),
        ),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await execFileAsync("git", ["init", "--quiet"], {
    cwd: input.workspaceDirectory,
  });
}

async function jsonlFilesUnder(root: string): Promise<string[]> {
  const files: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith(".jsonl")) files.push(path);
    }
  }
  await visit(root);
  return files;
}

export async function observedSessionConfiguration(codexHome: string): Promise<{
  model: string | null;
  reasoningEffort: string | null;
  workingDirectory: string | null;
  approvalPolicy: string | null;
  networkAccessEnabled: boolean | null;
}> {
  const observed = {
    model: null as string | null,
    reasoningEffort: null as string | null,
    workingDirectory: null as string | null,
    approvalPolicy: null as string | null,
    networkAccessEnabled: null as boolean | null,
  };
  for (const path of await jsonlFilesUnder(codexHome)) {
    for (const line of (await readFile(path, "utf8")).split("\n")) {
      if (!line) continue;
      try {
        const event = JSON.parse(line) as Record<string, unknown>;
        if (event.type !== "turn_context") continue;
        const payload = event.payload as Record<string, unknown> | undefined;
        const sandbox = payload?.sandbox_policy as Record<string, unknown> | undefined;
        if (typeof payload?.model === "string") observed.model = payload.model;
        if (typeof payload?.reasoning_effort === "string") {
          observed.reasoningEffort = payload.reasoning_effort;
        }
        if (typeof payload?.cwd === "string") observed.workingDirectory = payload.cwd;
        if (typeof payload?.approval_policy === "string") {
          observed.approvalPolicy = payload.approval_policy;
        }
        if (typeof sandbox?.network_access === "boolean") {
          observed.networkAccessEnabled = sandbox.network_access;
        }
      } catch {
        continue;
      }
    }
  }
  return observed;
}
