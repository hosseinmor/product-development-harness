import { Codex } from "@openai/codex-sdk";
import { mkdtemp, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type {
  StructuredAgentInvocation,
  StructuredAgentInvocationResult,
  StructuredAgentInvoker,
} from "../../prd/structured-agent-invoker.js";

export const codexRuntimeGuardExecutionConfig = {
  model: "gpt-5.6-sol",
  reasoningEffort: "high",
  networkAccessEnabled: false,
  approvalPolicy: "never",
  webSearchMode: "disabled",
  structuredOutput: true,
} as const;

async function immediateFiles(directory: string): Promise<string[]> {
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

export class CodexRuntimeGuardInvoker implements StructuredAgentInvoker {
  async invokeStructured(
    invocation: StructuredAgentInvocation,
  ): Promise<StructuredAgentInvocationResult> {
    const workingDirectory = await mkdtemp(
      join(tmpdir(), "harness-runtime-guard-workspace-"),
    );
    const guardCodexHome = await mkdtemp(
      join(tmpdir(), "harness-runtime-guard-codex-"),
    );
    const sourceCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
    const filesBefore = await immediateFiles(workingDirectory);
    try {
      const config = `
default_permissions = "runtime_guard"

[permissions.runtime_guard]
description = "Independent semantic runtime validation with no project or network access."

[permissions.runtime_guard.filesystem]
":minimal" = "read"
${JSON.stringify(workingDirectory)} = "read"

[permissions.runtime_guard.network]
enabled = false
`;
      await writeFile(resolve(guardCodexHome, "config.toml"), config, "utf8");
      await symlink(
        resolve(sourceCodexHome, "auth.json"),
        resolve(guardCodexHome, "auth.json"),
      );
      const environment = Object.fromEntries(
        Object.entries(process.env).filter(
          (entry): entry is [string, string] => entry[1] !== undefined,
        ),
      );
      environment.CODEX_HOME = guardCodexHome;
      const codex = new Codex({ env: environment });
      const thread = codex.startThread({
        model: codexRuntimeGuardExecutionConfig.model,
        modelReasoningEffort: codexRuntimeGuardExecutionConfig.reasoningEffort,
        workingDirectory,
        skipGitRepoCheck: true,
        networkAccessEnabled:
          codexRuntimeGuardExecutionConfig.networkAccessEnabled,
        approvalPolicy: codexRuntimeGuardExecutionConfig.approvalPolicy,
        webSearchMode: codexRuntimeGuardExecutionConfig.webSearchMode,
      });
      const turn = await thread.run(invocation.prompt, {
        outputSchema: invocation.outputSchema,
      });
      const filesAfter = await immediateFiles(workingDirectory);
      const workingDirectoryWasEmpty = filesBefore.length === 0;
      const workingDirectoryUnchanged =
        JSON.stringify(filesBefore) === JSON.stringify(filesAfter);
      return {
        sessionId: thread.id,
        finalResponse: turn.finalResponse,
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
        rm(guardCodexHome, { recursive: true, force: true }),
        rm(workingDirectory, { recursive: true, force: true }),
      ]);
    }
  }
}

export const codexRuntimeGuardInvoker: StructuredAgentInvoker =
  new CodexRuntimeGuardInvoker();
