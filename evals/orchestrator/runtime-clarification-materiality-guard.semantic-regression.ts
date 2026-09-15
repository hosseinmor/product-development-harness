import assert from "node:assert/strict";
import {
  ClarificationMaterialityGuard,
  runtimeGuardrailConfig,
  type ClarificationMaterialityInput,
  type GuardrailProductQuestion,
} from "../../runtime/prd/runtime-guardrails.js";
import { codexPrdSemanticAuditor } from "../../runtime/adapters/codex/codex-prd-semantic-auditor.js";

const questions: GuardrailProductQuestion[] = [
  {
    question:
      "Must the supplemental verification action be completed before the user can submit the core request?",
    whyMaterial: "It determines whether the core flow may complete.",
  },
  {
    question:
      "Which exact labels and values belong in the already-established predefined option catalog?",
    whyMaterial: "Product owns the eventual catalog content.",
  },
  {
    question: "Should the option catalog be presented in a modal or a popover?",
    whyMaterial: "The exact interaction remains unresolved.",
  },
  {
    question:
      "Does activating the state irreversibly remove access, or can the user reverse it later?",
    whyMaterial: "The lifecycle materially changes user access and recovery.",
  },
];

const guard = new ClarificationMaterialityGuard(codexPrdSemanticAuditor);
const result = await guard.audit({
  pmIntent:
    "Add supplemental structured feedback to an existing core action while keeping the flow usable.",
  currentProductContext: [
    {
      url: "pk://current-core-action",
      title: "Current core action",
      context:
        "The current action exists. Current context does not establish intended completion, presentation, or lifecycle rules for the new feedback capability.",
    },
  ],
  prdMarkdown: `# Supplemental structured feedback

## Scope

- The semantic input model is a predefined option catalog.

## Assumptions & Open Decisions

- Exact catalog labels and values remain unresolved.
- Exact presentation remains open for Design.`,
  humanDecisions: [
    {
      question: "What semantic input model is supported?",
      answer: "Use a predefined option catalog; exact values are not yet established.",
    },
  ],
  questions,
});

const classifications = result.audit.results.map(({ classification }) => classification);
assert.deepEqual(classifications, [
  "BLOCKING_PRODUCT_DECISION",
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
  "DESIGN_OWNED",
  "BLOCKING_PRODUCT_DECISION",
]);
assert.equal(result.audit.passed, false);
assert.equal(result.isolation.passed, true);
assert.equal(result.isolation.networkAccessEnabled, false);
assert.equal(guard.metrics.semanticAuditCallCount, 1);
assert.equal(guard.metrics.blockingQuestions, 2);
assert.equal(guard.metrics.nonBlockingProductQuestions, 1);
assert.equal(guard.metrics.designOwnedQuestions, 1);

const unresolvedDurableSemantics = await guard.audit({
  pmIntent: "Let a user dismiss an item from a recurring personalized collection.",
  currentProductContext: [],
  prdMarkdown: `# Dismissal

## Assumptions & Open Decisions

- Whether dismissal durably suppresses the item from future eligible collections remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "After dismissal, must the same item remain ineligible for future collections, or may it become eligible again?",
      whyMaterial: "The answer establishes durable suppression and lifecycle semantics.",
    },
  ],
});
assert.equal(
  unresolvedDurableSemantics.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const immediateUiReflection = await guard.audit({
  pmIntent: "Let a user dismiss an item from a recurring personalized collection.",
  currentProductContext: [],
  prdMarkdown: `# Dismissal

## Required Product Behavior

- A dismissed item is durably ineligible for future collections until the user reverses the dismissal.

## Assumptions & Open Decisions

- The immediate transition in the current view remains open for Design.`,
  humanDecisions: [
    {
      question: "What durable effect does dismissal have on the same item?",
      answer:
        "The item remains ineligible for future collections until the user reverses the dismissal.",
    },
  ],
  questions: [
    {
      question:
        "Should the dismissed item disappear from the current view immediately, or remain visible until refresh or navigation?",
      whyMaterial:
        "The durable state is established; only its immediate reflection in the current UI remains open.",
    },
  ],
});
assert.equal(
  immediateUiReflection.audit.results[0]?.classification,
  "DESIGN_OWNED",
);

const presentationThatChangesBehavior = await guard.audit({
  pmIntent: "Let a user dismiss an item from a recurring personalized collection.",
  currentProductContext: [],
  prdMarkdown: `# Dismissal

## Assumptions & Open Decisions

- The durable access consequence of dismissal remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Should the dismissal presentation only collapse the item until refresh, or permanently remove the user's ability to access that item?",
      whyMaterial:
        "Although phrased as presentation, the alternatives change durable access capability and state.",
    },
  ],
});
assert.equal(
  presentationThatChangesBehavior.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const hypotheticalAdditionalEffect = await guard.audit({
  pmIntent:
    "Capture structured feedback alongside an existing completed action so the feedback is available for later product learning.",
  currentProductContext: [],
  prdMarkdown: `# Structured feedback

## Required Product Behavior

- The user can record structured feedback alongside the existing action.
- The captured feedback is available for later product learning.

## Assumptions & Open Decisions

- Possible future automated effects of the feedback remain outside the established behavior.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Should recording the feedback additionally change the eligibility of other items in the user's collection?",
      whyMaterial:
        "Adding the effect would change behavior, but feedback capture does not require it.",
    },
  ],
});
assert.equal(
  hypotheticalAdditionalEffect.audit.results[0]?.classification,
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
);

const requiredEffectWithUnresolvedSemantics = await guard.audit({
  pmIntent:
    "Use the captured feedback to make related items ineligible for future inclusion in the user's collection.",
  currentProductContext: [],
  prdMarkdown: `# Feedback-driven eligibility

## Required Product Behavior

- Captured feedback changes future eligibility of related items.

## Assumptions & Open Decisions

- Which relationship makes an item ineligible remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Which related items must become ineligible after feedback is recorded: only items sharing the same source, or all items in the same category?",
      whyMaterial:
        "The required eligibility effect cannot be implemented without defining its semantic boundary.",
    },
  ],
});
assert.equal(
  requiredEffectWithUnresolvedSemantics.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const unresolvedCoreBehavior = await guard.audit({
  pmIntent:
    "Add a required validation step to the core request flow before the request is completed.",
  currentProductContext: [],
  prdMarkdown: `# Core request validation

## Assumptions & Open Decisions

- Completion behavior when validation fails remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "When validation fails, does the core request still complete, or must completion be blocked until validation succeeds?",
      whyMaterial:
        "The authorized core flow cannot be specified without choosing its completion behavior.",
    },
  ],
});
assert.equal(
  unresolvedCoreBehavior.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const unchangedBehaviorStorageAssociation = await guard.audit({
  pmIntent:
    "Capture one structured value with a completed operation so it has the same established Product meaning and effect regardless of internal record association.",
  currentProductContext: [],
  prdMarkdown: `# Structured capture

## Scope

- One structured value is captured with the completed operation.

## Required Product Behavior

- The captured value has the same meaning, availability, and Product effect regardless of its internal record association.

## Acceptance Criteria

- Completing the operation preserves the selected value with the same observable behavior.

## Open Decisions

- Whether persistence associates the value with the subject record or the operation record remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Should persistence associate the captured value with the subject record or the operation record?",
      whyMaterial:
        "Multiple durable record models are possible, but required observable Product behavior is unchanged.",
    },
  ],
});
assert.equal(
  unchangedBehaviorStorageAssociation.audit.results[0]?.classification,
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
);

const observableIdentityBoundary = await guard.audit({
  pmIntent:
    "Preserve a reusable preference so a returning person can use it in later sessions.",
  currentProductContext: [],
  prdMarkdown: `# Reusable preference

## Open Decisions

- Whether the preference belongs to an account or a device remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Is the reusable preference identified by account or by device?",
      whyMaterial:
        "The answer changes cross-device availability, ownership, and persistence lifecycle.",
    },
  ],
});
assert.equal(
  observableIdentityBoundary.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const authorityRejectedUnnecessaryDetail = await guard.audit({
  pmIntent:
    "Capture a structured value with a completed operation and make that value available with the completed record.",
  currentProductContext: [],
  prdMarkdown: `# Structured value

## Scope

- The structured value is captured with the completed operation.

## Required Product Behavior

- The captured value is available with the completed record.

## Acceptance Criteria

- A completed record exposes its captured value.

## Open Decisions

- Draft Authority removed an unsupported claim requiring a separate durable interaction-record identity; whether to add that unnecessary identity remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Must the capability additionally create a separate durable interaction-record identity?",
      whyMaterial:
        "The detail was removed for lacking authority, but the authorized capability can be specified without it.",
    },
  ],
});
assert.equal(
  authorityRejectedUnnecessaryDetail.audit.results[0]?.classification,
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
);

const resumeSearchBusinessOutcomeInput = {
  pmIntent: `می‌خواهیم کارجو بتواند بر اساس اطلاعات رزومه‌اش، بدون وارد کردن دستی عبارت جست‌وجو یا تنظیم فیلترها، جست‌وجوی شغل انجام دهد و مستقیماً وارد صفحه نتایج متناسب شود.

سیستم باید بر اساس رزومه، مقادیر مناسب برای جست‌وجو مثل keyword، گروه شغلی و فیلترهای مرتبط را تعیین کند.`,
  currentProductContext: [
    {
      url: "http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/job-search/0_overview/",
      title: "نمای حوزه: جستجوی شغل",
      context:
        "Retrieved live from the internal Product Knowledge site on 2026-09-14. The page is explicitly marked Draft. It identifies search, filters, job alerts, and smart recommendations as the job-search domain, but its detailed search/filter/recommendation documents are not yet written. This absence does not establish that a behavior is absent from the product.",
    },
    {
      url: "http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/cv/0_overview/",
      title: "نمای حوزه: رزومه",
      context:
        "Retrieved live from the internal Product Knowledge site on 2026-09-14; status Confirmed. A Candidate has a one-to-one Resume record. The Resume is a structured input to matching, Candidate search, recommended resumes, job recommendations, and AI models. Candidate identity/base fields and Resume data are separate records. The Candidate owns resume creation and editing.",
    },
    {
      url: "http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/cv/entity-cv/",
      title: "موجودیت رزومه",
      context:
        "Retrieved live from the internal Product Knowledge site on 2026-09-14; status Confirmed. Relevant structured inputs include preferred job categories on the Candidate record; Candidate city; desired salary range; work-history entries with standardized job category, industry, seniority, and standardized job title; skills; and a calculated Resume-by-job-category record with years of experience and whether the category is preferred. Each Candidate has exactly one Resume record, with separate Persian and English completeness values.",
    },
    {
      url: "https://jobvision.ir/jobs",
      title: "Current JobVision job-results surface — direct UI observation",
      context:
        "Directly observed in the current logged-in session on 2026-09-14. The results surface visibly exposes manual title/company keyword, job category, city, publication time, remote work, cooperation type, internship, salary, work experience, seniority, benefits, industry, disability-employment, and military-service filters, plus result sorting. The unfiltered state showed a result list and an AI-recommended insertion based on user activity. This observation establishes only the visible controls and rendered state; it does not establish hidden matching rules, persistence, eligibility, URL/query semantics, or the proposed Resume-derived search behavior.",
    },
  ],
  prdMarkdown: `---
id: resume-derived-job-search
artifact: prd
owner: unresolved
references:
  - http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/job-search/0_overview/
  - http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/cv/0_overview/
  - http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/cv/entity-cv/
  - https://jobvision.ir/jobs
---

# جست‌وجوی شغل بر اساس رزومه

## Problem

کارجویی که می‌خواهد فرصت‌های متناسب با سابقه و ترجیحات ثبت‌شده در رزومه‌اش را پیدا کند، نباید برای شروع جست‌وجو مجبور باشد اطلاعات رزومه را شخصاً به عبارت جست‌وجو، گروه شغلی و مجموعه‌ای از فیلترها تبدیل کند. نیاز محصول، حذف این تنظیم دستی از مسیر آغاز جست‌وجوی رزومه‌محور و رساندن کارجو به نتایج متناسب است.

معنای کسب‌وکاری «تناسب» و اثر نهایی مورد انتظار برای Job Vision هنوز تصمیم‌گیری نشده است.

## Affected Users

- کارجویی که می‌خواهد بر پایهٔ اطلاعات رزومهٔ خود شغل پیدا کند.

## Current Behavior

هر Candidate یک رکورد Resume دارد و ایجاد و ویرایش رزومه در اختیار خود Candidate است. اطلاعات هویتی پایه و داده‌های Resume در رکوردهای جدا نگهداری می‌شوند. داده‌های ساختاریافتهٔ مرتبط شامل گروه‌های شغلی ترجیحی، شهر، بازهٔ حقوق درخواستی، سوابق کاری استانداردشده، مهارت‌ها و تجربهٔ محاسبه‌شده به تفکیک گروه شغلی است؛ رزومه همچنین ورودی matching، پیشنهاد شغل و مدل‌های هوش مصنوعی است.

در مشاهدهٔ مستقیم صفحهٔ فعلی نتایج، کنترل‌های دستی keyword عنوان/شرکت، گروه شغلی، شهر، زمان انتشار، دورکاری، نوع همکاری، کارآموزی، حقوق، سابقهٔ کار، ارشدیت، مزایا، صنعت، استخدام افراد دارای معلولیت و وضعیت خدمت سربازی، به‌همراه مرتب‌سازی نتایج، قابل مشاهده بودند. حالت بدون فیلتر نیز فهرست نتایج و یک مورد پیشنهادی هوش مصنوعی بر اساس فعالیت کاربر را نمایش می‌داد. این مشاهده دربارهٔ قواعد پنهان تطبیق، ماندگاری، eligibility یا معناشناسی query چیزی را اثبات نمی‌کند.

## Outcomes

### User Outcome

کارجو بتواند بدون تبدیل دستی اطلاعات رزومه به عبارت جست‌وجو و فیلترها، مستقیماً به فرصت‌های متناسب برسد.

### Business Outcome

Business Outcome هنوز توسط Product تعیین نشده است. گزینه‌های غیرقطعی برای تصمیم PM عبارت‌اند از:

1. افزایش اقدام کارجو روی فرصت‌های مرتبط و در نهایت افزایش درخواست‌های شغلی مرتبط از طریق کاهش اصطکاک شروع جست‌وجو — گزینهٔ پیشنهادی؛
2. افزایش استفاده و بازگشت کارجو به جست‌وجوی شغل؛
3. بهبود تناسب درخواست‌های دریافتی برای کارفرما.

گزینهٔ اول پیشنهاد می‌شود، زیرا کاهش اصطکاک تصریح‌شده در نیت PM را به یک اثر پایین‌دستی معنادار متصل می‌کند؛ بااین‌حال هیچ‌یک تا زمان تصمیم PM الزام محصول نیست.

## Scope

- در محدودهٔ این تغییر، کارجو می‌تواند جست‌وجوی شغل را بر پایهٔ اطلاعات رزومهٔ خود آغاز کند، بدون آنکه پیش از جست‌وجو عبارت جست‌وجو یا فیلترها را دستی وارد کند.
- این قابلیت کارجو را مستقیماً به صفحهٔ نتایج متناسب می‌رساند.
- تعیین مقادیر جست‌وجو از روی رزومه، از جمله مقادیری مانند keyword، گروه شغلی و فیلترهای مرتبط، در محدوده است.

## Key Product Scenario

1. کارجو جست‌وجوی مبتنی بر رزومه را آغاز می‌کند.
2. سیستم با استفاده از اطلاعات رزومهٔ او، مقادیر مناسب جست‌وجو را تعیین می‌کند.
3. جست‌وجو با این مقادیر اجرا می‌شود و کارجو بدون مرحلهٔ الزامی تنظیم دستی معیارها، مستقیماً وارد صفحهٔ نتایج متناسب می‌شود.

## Required Product Behavior

- محصول باید امکان آغاز جست‌وجوی رزومه‌محور را برای کارجو فراهم کند، بی‌آنکه ورود دستی عبارت جست‌وجو یا تنظیم دستی فیلترها پیش‌نیاز آغاز جست‌وجو باشد.
- سیستم باید با استفاده از اطلاعات رزومه، مقادیر مناسب جست‌وجو مانند keyword، گروه شغلی و فیلترهای مرتبط را تعیین کند.
- محصول باید جست‌وجو را با مقادیر تعیین‌شده اجرا کند و کارجو را بدون مرحلهٔ الزامی ورود دستی معیارها مستقیماً به صفحهٔ نتایج متناسب ببرد.

## Dependencies

- \`http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/job-search/0_overview/\`
- \`http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/cv/0_overview/\`
- \`http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/cv/entity-cv/\`

## Acceptance Criteria

- کارجو می‌تواند جست‌وجوی رزومه‌محور را بدون واردکردن دستی keyword یا تنظیم دستی فیلترها آغاز کند.
- در هر اجرای این قابلیت، مقادیر جست‌وجو بر اساس اطلاعات رزومهٔ کارجو تعیین می‌شوند.
- پس از آغاز قابلیت، جست‌وجو اجرا می‌شود و مقصد کارجو مستقیماً صفحهٔ نتایج متناسب است.

## Assumptions & Open Decisions

- **مسدودکننده — Business Outcome:** اثر کسب‌وکاری اصلی هنوز انتخاب نشده است. این تصمیم بر معنای «تناسب» و اولویت‌های ارزیابی قابلیت اثر می‌گذارد.
- **مسدودکننده — eligibility:** هنوز مشخص نیست وجود چه مقدار یا نوعی از اطلاعات رزومه برای استفاده از قابلیت کافی است. وجود رکورد Resume به‌تنهایی وجود سیگنال قابل‌استفاده را تضمین نمی‌کند.
- **وابسته به تصمیم Business Outcome:** سیاست تشخیص «مقادیر مناسب»، از جمله نحوهٔ برخورد با چند گروه شغلی، سیگنال‌های متعارض یا داده‌های ناقص، هنوز Product-authoritative نیست و پس از تعیین هدف اصلی باید دوباره ارزیابی شود.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Business Outcome اصلی این قابلیت کدام باشد؟ ۱) افزایش اقدام کارجو روی فرصت‌های مرتبط و در نهایت افزایش درخواست‌های شغلی مرتبط از طریق کاهش اصطکاک شروع جست‌وجو — پیشنهاد من؛ ۲) افزایش استفاده و بازگشت کارجو به جست‌وجوی شغل؛ ۳) بهبود تناسب درخواست‌های دریافتی برای کارفرما. لطفاً یکی را به‌عنوان هدف اصلی تأیید، اصلاح یا رد کنید.",
      whyMaterial:
        "این تصمیم یک متغیر واحد، یعنی اثر کسب‌وکاریِ اصلی، را مشخص می‌کند. انتخاب آن جهت تعریف «تناسب»، اولویت‌های انتخاب معیارهای جست‌وجو و Acceptance Criteria بعدی را تغییر می‌دهد. گزینهٔ اول توصیه می‌شود چون مستقیماً کاهش اصطکاک موردنظر PM را به یک اثر پایین‌دستی معنادار متصل می‌کند، بدون اینکه صرف اجرای جست‌وجو را موفقیت نهایی فرض کند.",
    },
  ],
} satisfies ClarificationMaterialityInput;

const resumeSearchBusinessOutcome = await guard.audit(
  resumeSearchBusinessOutcomeInput,
);
assert.equal(
  resumeSearchBusinessOutcome.audit.results[0]?.classification,
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
);

const outcomeThatDeterminesCurrentScope = await guard.audit({
  pmIntent:
    "Create one v0 flow for one primary audience. If the primary Business Outcome is first-time activation, v0 serves new users through onboarding; if it is retention, v0 serves returning users through re-engagement. Only one of those scopes belongs in this version.",
  currentProductContext: [],
  prdMarkdown: `# Single-audience v0

## Assumptions & Open Decisions

- The primary Business Outcome remains unresolved.
- The selected outcome determines whether the current scope is onboarding for new users or re-engagement for returning users.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Which primary Business Outcome defines this version: first-time activation or returning-user retention?",
      whyMaterial:
        "The authorized alternatives select different audiences, scope, and core flows for the current version.",
    },
  ],
});
assert.equal(
  outcomeThatDeterminesCurrentScope.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

console.log(
  JSON.stringify(
    {
      passed: true,
      featureAgnostic: true,
      config: runtimeGuardrailConfig,
      classifications,
      durableUiBoundaryClassifications: {
        unresolvedDurableSemantics:
          unresolvedDurableSemantics.audit.results[0]?.classification,
        immediateUiReflection:
          immediateUiReflection.audit.results[0]?.classification,
        presentationThatChangesBehavior:
          presentationThatChangesBehavior.audit.results[0]?.classification,
      },
      additionalEffectClassifications: {
        hypotheticalAdditionalEffect:
          hypotheticalAdditionalEffect.audit.results[0]?.classification,
        requiredEffectWithUnresolvedSemantics:
          requiredEffectWithUnresolvedSemantics.audit.results[0]?.classification,
        unresolvedCoreBehavior:
          unresolvedCoreBehavior.audit.results[0]?.classification,
      },
      observableConsequenceClassifications: {
        unchangedBehaviorStorageAssociation:
          unchangedBehaviorStorageAssociation.audit.results[0]?.classification,
        observableIdentityBoundary:
          observableIdentityBoundary.audit.results[0]?.classification,
        authorityRejectedUnnecessaryDetail:
          authorityRejectedUnnecessaryDetail.audit.results[0]?.classification,
      },
      outcomeBoundaryClassifications: {
        resumeSearchBusinessOutcome:
          resumeSearchBusinessOutcome.audit.results[0]?.classification,
        outcomeThatDeterminesCurrentScope:
          outcomeThatDeterminesCurrentScope.audit.results[0]?.classification,
      },
      hiddenFixtureDataAvailable: false,
      isolation: {
        baseline: result.isolation,
        unresolvedDurableSemantics: unresolvedDurableSemantics.isolation,
        immediateUiReflection: immediateUiReflection.isolation,
        presentationThatChangesBehavior: presentationThatChangesBehavior.isolation,
        hypotheticalAdditionalEffect: hypotheticalAdditionalEffect.isolation,
        requiredEffectWithUnresolvedSemantics:
          requiredEffectWithUnresolvedSemantics.isolation,
        unresolvedCoreBehavior: unresolvedCoreBehavior.isolation,
        unchangedBehaviorStorageAssociation:
          unchangedBehaviorStorageAssociation.isolation,
        observableIdentityBoundary: observableIdentityBoundary.isolation,
        authorityRejectedUnnecessaryDetail:
          authorityRejectedUnnecessaryDetail.isolation,
      },
      metrics: guard.metrics,
    },
    null,
    2,
  ),
);
