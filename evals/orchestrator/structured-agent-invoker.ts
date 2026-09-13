export type StructuredAgentUsage = {
  input_tokens: number;
  cached_input_tokens: number;
  cache_write_input_tokens: number;
  output_tokens: number;
  reasoning_output_tokens: number;
};

export type StructuredAgentIsolation = {
  workingDirectoryWasEmpty: boolean;
  workingDirectoryUnchanged: boolean;
  networkAccessEnabled: false;
  passed: boolean;
};

export type StructuredAgentInvocation = {
  prompt: string;
  outputSchema: unknown;
};

export type StructuredAgentInvocationResult = {
  sessionId: string | null;
  finalResponse: string | null;
  usage: StructuredAgentUsage | null;
  isolation: StructuredAgentIsolation;
};

export interface StructuredAgentInvoker {
  invokeStructured(
    invocation: StructuredAgentInvocation,
  ): Promise<StructuredAgentInvocationResult>;
}
