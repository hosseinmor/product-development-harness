# PM Quick Start

Use this guide to start a Product task with the Job Vision Product Development Harness.

## Before you start

1. Connect your device to the Job Vision VPN.
2. Use an AI environment that can access a browser running on that VPN-connected device (for example, a desktop app with local browser/browser-extension access).
3. Give the agent the Harness repository, Product Knowledge location, and your Product intent.

The current Product Knowledge source is internal documentation:

http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

This is temporary. Once agents have direct access to the Product Knowledge repository, use that repository as the Product Knowledge source instead and remove the browser + VPN dependency.

## Start prompt

```text
For this Product task, use the Job Vision Product Development Harness.

Harness:
https://github.com/hosseinmor/product-development-harness

Product Knowledge:
http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

Product Knowledge is currently available only on the internal network.
Use a browser that has access through the Job Vision VPN.

Start from AGENTS.md.

My intent:
[Describe the problem, idea, or product change in your own words]
```

If you attach files, research, notes, screenshots, or other context with the task, the agent should use them when relevant. You do not need to restate the Harness workflow in the prompt; `AGENTS.md` routes the agent to the right workflow and artifact contract.

## What you may see

- **`Problem Aligned`** — the PRD is clear enough for meaningful Design Exploration without forcing the Designer to invent a material Product decision. It does not mean every open question is resolved.
- **A clarification question** — the agent may ask you for a material Product decision that cannot be retrieved or safely derived. Answer naturally; the agent should reconcile the decision into the PRD.
- **Product Knowledge unavailable** — if the internal documentation cannot be opened, the agent should say so and may ask you for the specific file, screenshot, or context needed. It should not invent current-product facts.
- **An Open Decision remains** — this is acceptable when it does not block useful Design Exploration.
- **A Product gap returns from Design** — Design may expose a missing Product decision. Decide it as PM; the PRD should then be updated before downstream work relies on it.
