# Product Designer Quick Start

Use this guide to start Design Exploration with the Job Vision Product Development Harness.

## Before you start

1. Connect your device to the Job Vision VPN.
2. Use an AI environment that can access a browser running on that VPN-connected device (for example, a desktop app with local browser/browser-extension access).
3. Provide the current PRD. Prefer the durable PRD artifact over chat history.

The current Product Knowledge source is internal documentation:

http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

This is temporary. Once agents have direct access to the Product Knowledge repository, use that repository as the Product Knowledge source instead and remove the browser + VPN dependency.

## Start prompt

```text
For this Design task, use the Job Vision Product Development Harness.

Harness:
https://github.com/hosseinmor/product-development-harness

Product Knowledge:
http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

Product Knowledge is currently available only on the internal network.
Use a browser that has access through the Job Vision VPN.

Start from AGENTS.md.

PRD:
[Attach the PRD or provide its durable link]
```

If you attach Figma links, screenshots, prototypes, research, or other relevant context, the agent should use them when useful. You do not need to restate the Design workflow in the prompt; `AGENTS.md` routes the agent to the right workflow and artifact contract.

## What you may see

- **`Problem Aligned`** — the PRD is sufficiently clear to begin meaningful Design Exploration without inventing a material Product decision.
- **Product Knowledge unavailable** — if the internal documentation cannot be opened, the agent should say so and may ask for the specific current-flow screenshot, file, or context it needs. It should not invent the current experience.
- **`Product Decision needed`** — Design has exposed behavior that the PRD does not establish. You may recommend a solution, but the Product decision should return to the PM and PRD.
- **`Selected` Design** — the Designer has established the current Design direction as the durable Design Artifact. It does not mean pixel-perfect, immutable, or implementation-ready.
- **`Product & Design Aligned`** — PRD and selected Design are consistent enough for Technical Planning to proceed without Engineering inventing a material Product or Design decision.
- **PRD ↔ Design finding** — the stress test may expose a Product issue or a Design issue. Update the artifact that owns that decision rather than leaving the resolution only in chat.
