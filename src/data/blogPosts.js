/**
 * blogPosts.js
 * ─────────────────────────────────────────────────────────────────
 * Curated high-level technical research dispatches, AI studies,
 * and system engineering analyses authored by Dipanjana Ghosh.
 * ─────────────────────────────────────────────────────────────────
 */

export const BLOG_POSTS = [
  {
    id: "multimodal-latency-frontier",
    title: "The Multimodal Latency Frontier: Real-Time Vision Ingestion & GPT-4V Frame Sampling",
    subtitle: "A practical pipeline for turning camera frames into responsive recommendations without sending an entire video stream.",
    category: "Multimodal & Vision AI",
    date: "OCT 2026",
    readTime: "6 min read",
    flagship: true,
    telemetry: {
      pipeline: "Capture → Compress → Infer → Recommend",
      processing: "Selective frame sampling",
      stack: "React + Vision API + TMDB"
    },
    tags: ["GPT-4V", "Computer Vision", "Latency Benchmarks", "Edge Ingestion", "Webcam Stream"],
    summary: "A build-focused look at EmotiStream AI: selecting useful frames, reducing image payloads, handling uncertain predictions, and keeping recommendations responsive.",
    content: `
### Start with the experience, not the model

EmotiStream AI explores a simple interaction: a person shares a frame, the app estimates a broad mood, and a recommendation service returns films to explore. The interesting engineering problem is not just calling a vision API. It is controlling what leaves the browser, explaining uncertainty, and keeping the rest of the interface useful while a network request is in flight.

The browser should request camera access only after a clear user action. A user should also be able to skip the camera and choose a mood manually. That alternative makes the feature more accessible and gives the recommendation flow a useful path when camera access is unavailable.

### A small, deliberate image pipeline

\`\`\`flow
User opts in → Capture one frame → Resize and compress → Send one image → Receive mood with confidence → Fetch matching films
\`\`\`

Sampling a still image is simpler to reason about than continuously uploading video. Before sending a frame, resize it on a canvas and use a suitable image format and quality. The right dimensions and compression depend on the model, network, and visual details the feature needs; measure the actual payload instead of assuming a fixed saving.

Keep the capture and recommendation stages separate. The vision response should produce a small, validated result, such as a mood label and confidence value. The recommendation stage can then map that result to a TMDB query. This makes each step easier to test and prevents model output from being treated as an unrestricted API instruction.

### Design for uncertainty and failure

A vision model can be unsure, unavailable, or return an unexpected response. Validate the response shape, set a request timeout, and show a useful retry or manual-selection option. A low-confidence result should invite the user to choose a mood rather than pretending the prediction is certain.

Treat camera frames as sensitive data. Explain the purpose before asking for access, transmit only what is needed, avoid logging image data, and stop the camera tracks when the user leaves the feature.

### What to measure

Measure frame size, request duration, timeout rate, and the time from selection to visible recommendations on representative devices and networks. Report those measurements only after testing; image quality and latency change with device, network, model, and API configuration.

The useful lesson is a calm pipeline: ask permission, process the smallest useful input, validate the response, and preserve a manual path from start to finish.
    `
  },
  {
    id: "test-time-compute-mcts-reasoning",
    title: "Let Models Search: A Practical Guide to Test-Time Reasoning",
    subtitle: "A practical introduction to generating candidate steps, scoring them, and verifying a final answer.",
    category: "LLM Reasoning & MCTS",
    date: "NOV 2026",
    readTime: "8 min read",
    flagship: false,
    telemetry: {
      paradigm: "Inference-Time Scaling",
      algorithm: "MCTS + Process Reward Models",
      principle: "Spend compute where verification helps",
      pattern: "Search + score + verify"
    },
    tags: ["Test-Time Compute", "MCTS", "Chain-of-Thought", "Process Reward Models", "Reasoning Models"],
    summary: "Instead of accepting the first generated answer, test-time search explores alternatives and checks intermediate steps. Here is where MCTS and process reward models fit—and where their extra cost may not be worthwhile.",
    content: `
### Why let a model think longer?

A standard language-model call generates one continuation from the prompt. For tasks with several plausible steps, an early mistake can shape everything that follows. Test-time compute changes the inference strategy: generate a limited set of alternatives, evaluate promising partial solutions, and spend additional work only where it may improve the result.

This is not a guarantee of better answers. Search consumes tokens and time, and a weak evaluator can confidently prefer a bad branch. A direct answer remains a good choice for simple, low-risk requests.

### The search-and-check loop

\`\`\`flow
Question → Generate candidate next steps → Score promising states → Expand selected branches → Verify the completed answer
Checks fail → Revise a candidate → Run verification again
\`\`\`

Monte Carlo Tree Search (MCTS) is one way to explore a tree of possible actions. Selection chooses a branch worth exploring, expansion adds candidate next steps, evaluation estimates their promise, and backpropagation updates the value of earlier choices. In language-model systems, the states are partial reasoning traces or actions rather than positions in a board game.

### Outcome checks versus step checks

An outcome reward model scores a completed answer. A process reward model scores intermediate steps as well. Outcome-only feedback is simpler, but gives little information about where a long solution went wrong. Step-level feedback can help locate weak reasoning, although it requires a reliable evaluator and can add its own biases.

For software tasks, deterministic checks are especially valuable: compile the code, run focused tests, validate a schema, or compare an output against explicit constraints. These checks do not prove every answer correct, but they provide evidence independent of the model's confidence.

### When the added search is worth it

Use a bounded search when a task has meaningful alternatives and a way to evaluate them. Set a limit on candidate branches, retries, and total time. Keep a direct path for easy tasks, expose uncertainty when checks disagree, and log evaluation outcomes without storing sensitive prompt data.

The design principle is simple: generate alternatives only when useful, check work with the strongest available verifier, and stop when the expected benefit no longer justifies the cost.
    `
  },
  {
    id: "non-intrusive-smtp-probing",
    title: "Reliable Email Sign-Up: Validate Inputs, Then Confirm Consent",
    subtitle: "A safer onboarding flow that distinguishes formatting checks from actual inbox ownership.",
    category: "Network & System Architecture",
    date: "SEP 2026",
    readTime: "6 min read",
    flagship: false,
    telemetry: {
      design: "Consent-first",
      stages: "Input → Confirmation → Subscription",
      principle: "Verify ownership with opt-in"
    },
    tags: ["Email UX", "Double Opt-In", "Validation", "Privacy", "Deliverability"],
    summary: "Syntax and domain checks can catch typos, but only a user-confirmed message demonstrates inbox access. Build signup around clear consent, safe retries, and respectful handling of delivery failures.",
    content: `
### Two different questions

Email signup often mixes up two checks:

- “Does this look like an email address?” is a formatting question.
- “Can this person receive mail here and do they want to sign up?” is an ownership-and-consent question.

Parsing and DNS can catch some input mistakes, but neither proves that a mailbox exists or belongs to the person entering it. Mail servers may intentionally conceal recipient status, apply filtering, or defer a decision. Treating a network response as a definitive identity check creates false confidence and can expose people to unwanted probing.

### A clear confirmation flow

\`\`\`flow
User enters address → Normalize and check format → Explain signup and request consent → Send confirmation link → User confirms → Activate subscription
Format is unclear → Ask the user to correct the address
Confirmation expired → Let the user request a fresh link
\`\`\`

Keep the first step friendly: trim accidental spaces, normalize the domain carefully, and show a useful message when the format is incomplete. Avoid rejecting unfamiliar but valid address formats with an overly strict regular expression.

After submission, send a single-purpose confirmation link with a short expiry. Store a pending subscription rather than treating the address as verified. Activate it only after the user follows the link. Make the confirmation page say what will happen next and how to unsubscribe.

### Delivery failures and privacy

Use your approved email provider for delivery rather than attempting to infer mailbox existence through direct recipient probes. Apply rate limits to signup and resend actions, make the response similar whether an address is pending or already subscribed, and avoid revealing account membership.

Keep tokens random, single-use, time-limited, and stored safely. Do not put addresses or confirmation tokens in analytics events or application logs. Provide a clear correction path for typos and a measured resend action for expired links. Monitor aggregate bounce and complaint trends using your provider's reporting, then fix list quality and message practices rather than escalating checks against recipients.

The reliable result is not a guessed mailbox verdict. It is an explicit confirmation from the person who chose to sign up.
    `
  },
  {
    id: "agentic-workflows-vs-monolithic-prompts",
    title: "From Prompt to Workflow: Building Agents You Can Inspect",
    subtitle: "A practical pattern for planning, tool use, validation, and safe recovery.",
    category: "Autonomous Agents",
    date: "AUG 2026",
    readTime: "7 min read",
    flagship: false,
    telemetry: {
      architecture: "Explicit workflow states",
      control: "Bounded tools and retries",
      verification: "Independent checks"
    },
    tags: ["Agentic AI", "State Machines", "Tool Calling", "Autonomous Systems", "Self-Correction"],
    summary: "A long prompt cannot guarantee that an agent uses tools in the right order or detects its own mistakes. Explicit states, narrow tool permissions, and independent validation make a workflow easier to understand and recover.",
    content: `
### Why a prompt is not a workflow

A language model can suggest what to do next, but a paragraph of instructions does not enforce prerequisites, tool permissions, retry limits, or success criteria. When planning, execution, and verification are mixed together, it becomes difficult to tell whether a tool ran, whether its result was checked, and what should happen after an error.

Treat the model as one component in a controlled system. The application owns the workflow, validates every transition, and decides which tools are available in each state.

### Make each step observable

\`\`\`flow
Request → Gather allowed context → Produce a small plan → Run one permitted action → Validate its result
Validation fails → Return a bounded correction request → Validate the revised result
Validation passes → Return the observed outcome
\`\`\`

Start by defining the task boundary and the information the agent is allowed to use. Ask for a compact plan, then validate the plan before execution. Give each action only the inputs it needs, apply permission checks in application code, and record a structured result such as success, retryable failure, or final failure.

### Recovery should be bounded

Retries are useful for transient failures, but unbounded loops can waste time or repeat side effects. Set explicit attempt and time limits. Use idempotency keys for actions that may be repeated, and require confirmation before irreversible actions such as publishing, deleting, or sending.

If validation fails, return the specific failure to the planner and allow only a bounded correction attempt. If the task still fails, stop and report what happened instead of inventing a successful result.

### Verify outside the model

Use deterministic checks wherever possible: run tests, validate a schema, check permissions, or compare the result with explicit requirements. Keep model-generated claims separate from observed tool output. This makes failures diagnosable and lets you test the workflow with expected results.

For each state, track the permitted action, its required inputs, the expected output shape, and the next valid state. A small state diagram and a few failure-path tests often provide more reliability than adding another page of prompt instructions.
    `
  }
];

export const CATEGORIES = [
  "All Dispatches",
  "Multimodal & Vision AI",
  "LLM Reasoning & MCTS",
  "Network & System Architecture",
  "Autonomous Agents"
];
