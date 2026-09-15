import { Codex, type Usage } from "@openai/codex-sdk";
import { mkdtemp, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const semanticFixtureRouterConfig = {
  model: "gpt-5.6-sol",
  reasoningEffort: "high",
  networkAccessEnabled: false,
  approvalPolicy: "never",
  webSearchMode: "disabled",
  structuredOutput: true,
  permissionProfile: "semantic_fixture_router",
} as const;

export const fixtureIds = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
export type FixtureId = (typeof fixtureIds)[number];

export type SemanticFixtureRoute = {
  status: "matched" | "ambiguous" | "no_match";
  fixtureIds: FixtureId[];
  multipleDecisions: boolean;
  rationale: string;
};

export type SemanticFixtureRouterResult = {
  threadId: string;
  routes: SemanticFixtureRoute[];
  usage: Usage | null;
  isolation: {
    workingDirectoryWasEmpty: boolean;
    workingDirectoryUnchanged: boolean;
    networkAccessEnabled: false;
    passed: boolean;
  };
};

const routingDescriptions: ReadonlyArray<{
  id: FixtureId;
  description: string;
}> = [
  {
    id: "A",
    description:
      "Answers the Product decision that defines when two encounters count as the same Job Search identity, including which search-defining inputs distinguish or preserve that identity.",
  },
  {
    id: "B",
    description:
      "Answers the Product decision that defines the semantic rule for when a job posting counts as new for a particular Search and user history. Mentions of lifecycle events are incidental unless the question asks what counts as new.",
  },
  {
    id: "C",
    description:
      "Answers the Product decision that defines the baseline or last-visit reference lifecycle: which user experience event creates or advances the comparison reference and when that update occurs.",
  },
  {
    id: "D",
    description:
      "Answers the Product decision about user eligibility and persistence scope for Search visit history, such as guest versus authenticated users and whether state lives at session, browser/device, or account level.",
  },
  {
    id: "E",
    description:
      "Answers only the Product release-scope decision selecting which product touchpoints or surfaces are included in or excluded from the initial version, such as whether Search Results, Recent Search, or Saved Search are in v0. When a surface is already selected or merely provides context and the question asks what behavior or capability is required within that surface—including distinguishability, a New signal, count, presence indicator, or other presentation behavior—this fixture does not match.",
  },
  {
    id: "F",
    description:
      "Answers the Product release-scope decision about whether reactivated job postings receive a distinct surfaced treatment in the initial version. Reactivation mentioned only as a candidate in the definition of new does not match this fixture.",
  },
  {
    id: "G",
    description:
      "Answers the Product decision about whether a Business Outcome, business target, or business success measure is established and required for this work.",
  },
  {
    id: "H",
    description:
      "Answers only the Product decision for a Search with no prior baseline: on the first eligible visit, whether the currently eligible results count as New and what that first visit establishes for subsequent visits. Do not use for the general definition of New after a baseline exists, or for the event or timing that advances an existing baseline.",
  },
];

const routerOutputSchema = {
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

type RawRouterRoute = SemanticFixtureRoute & { questionIndex: number };
type RawRouterResponse = { routes: RawRouterRoute[] };

function routerPrompt(questions: string[]): string {
  const descriptions = routingDescriptions
    .map(({ id, description }) => `${id}: ${description}`)
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
- A concept used only as background, an example, a proposed option, or a consequence must not trigger its fixture.
- Prefer ambiguous or no_match over revealing an extra fixture.
- Use matched only when the routing description directly and completely corresponds to the decision the question asks Product to make.
- An atomic question normally maps to exactly one fixture.
- Return multiple fixtureIds only when the question itself genuinely requests multiple independent Product decisions; set multipleDecisions=true in that case.
- For ambiguous or no_match, return an empty fixtureIds array.
- Return one route for every questionIndex, in the same order.
- Do not use tools, inspect files, or seek any other context. The fixture answers are intentionally unavailable.`;
}

async function filesUnder(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile()) files.push(entry.name);
  }
  return files.sort();
}

function validateRouterResponse(
  response: RawRouterResponse,
  questionCount: number,
): SemanticFixtureRoute[] {
  if (!Array.isArray(response.routes) || response.routes.length !== questionCount) {
    throw new Error(
      `Semantic Fixture Router returned ${response.routes?.length ?? 0} routes for ${questionCount} questions.`,
    );
  }

  return response.routes.map((route, expectedIndex) => {
    if (route.questionIndex !== expectedIndex) {
      throw new Error(
        `Semantic Fixture Router returned questionIndex ${route.questionIndex} at position ${expectedIndex}.`,
      );
    }

    const uniqueFixtureIds = [...new Set(route.fixtureIds)];
    if (!uniqueFixtureIds.every((id) => fixtureIds.includes(id))) {
      throw new Error(`Semantic Fixture Router returned an unknown fixture id.`);
    }

    if (route.status !== "matched") {
      return {
        status: route.status,
        fixtureIds: [],
        multipleDecisions: false,
        rationale: route.rationale,
      };
    }

    if (uniqueFixtureIds.length === 0) {
      return {
        status: "ambiguous",
        fixtureIds: [],
        multipleDecisions: false,
        rationale: "Router returned matched without a fixture id.",
      };
    }

    if (uniqueFixtureIds.length > 1 && !route.multipleDecisions) {
      return {
        status: "ambiguous",
        fixtureIds: [],
        multipleDecisions: false,
        rationale:
          "Router returned multiple fixtures without explicitly identifying multiple independent Product decisions.",
      };
    }

    return {
      status: "matched",
      fixtureIds: uniqueFixtureIds.sort(
        (left, right) => fixtureIds.indexOf(left) - fixtureIds.indexOf(right),
      ),
      multipleDecisions: route.multipleDecisions,
      rationale: route.rationale,
    };
  });
}

export async function routeProductQuestions(
  questions: string[],
): Promise<SemanticFixtureRouterResult> {
  if (questions.length === 0) {
    throw new Error("Semantic Fixture Router requires at least one question.");
  }

  const routerWorkingDirectory = await mkdtemp(
    join(tmpdir(), "harness-semantic-fixture-router-workspace-"),
  );
  const routerCodexHome = await mkdtemp(
    join(tmpdir(), "harness-semantic-fixture-router-codex-"),
  );
  const originalCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
  const filesBefore = await filesUnder(routerWorkingDirectory);
  let threadId = "";
  let usage: Usage | null = null;
  let routes: SemanticFixtureRoute[] = [];

  try {
    const routerConfig = `
default_permissions = "semantic_fixture_router"

[permissions.semantic_fixture_router]
description = "Semantic fixture routing from question text and answer-independent descriptions only."

[permissions.semantic_fixture_router.filesystem]
":minimal" = "read"
${JSON.stringify(routerWorkingDirectory)} = "read"

[permissions.semantic_fixture_router.network]
enabled = false
`;
    await writeFile(resolve(routerCodexHome, "config.toml"), routerConfig, "utf8");
    await symlink(
      resolve(originalCodexHome, "auth.json"),
      resolve(routerCodexHome, "auth.json"),
    );

    const routerEnvironment = Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
    routerEnvironment.CODEX_HOME = routerCodexHome;

    const codex = new Codex({ env: routerEnvironment });
    const thread = codex.startThread({
      model: semanticFixtureRouterConfig.model,
      modelReasoningEffort: semanticFixtureRouterConfig.reasoningEffort,
      workingDirectory: routerWorkingDirectory,
      skipGitRepoCheck: true,
      networkAccessEnabled: semanticFixtureRouterConfig.networkAccessEnabled,
      approvalPolicy: semanticFixtureRouterConfig.approvalPolicy,
      webSearchMode: semanticFixtureRouterConfig.webSearchMode,
    });
    const turn = await thread.run(routerPrompt(questions), {
      outputSchema: routerOutputSchema,
    });
    if (!thread.id) {
      throw new Error("Semantic Fixture Router completed without a thread id.");
    }
    threadId = thread.id;
    usage = turn.usage;
    if (!turn.finalResponse) {
      throw new Error("Semantic Fixture Router completed without a final response.");
    }
    routes = validateRouterResponse(
      JSON.parse(turn.finalResponse) as RawRouterResponse,
      questions.length,
    );

    const filesAfter = await filesUnder(routerWorkingDirectory);
    const workingDirectoryWasEmpty = filesBefore.length === 0;
    const workingDirectoryUnchanged =
      JSON.stringify(filesBefore) === JSON.stringify(filesAfter);
    return {
      threadId,
      routes,
      usage,
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
      rm(routerWorkingDirectory, { recursive: true, force: true }),
    ]);
  }
}
