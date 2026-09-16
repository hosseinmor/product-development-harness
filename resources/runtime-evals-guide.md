# راهنمای Runtime Guards، Evals و Proofs

این سند برای کسانی است که می‌خواهند بفهمند لایه‌های کنترل کیفیت Harness چه هستند، چرا ساخته شده‌اند، چه زمانی باید سراغشان رفت و چه چیزی را تغییر می‌دهند.

این فایل **بخشی از اجرای روزمره Harness نیست** و Agent لازم نیست در هر Product Task آن را بخواند. هدف آن حفظ دانش عملی دربارهٔ زیرساخت کیفیت Harness برای انسان‌هاست.

---

## تصویر کلی

برای فهم ساختار، چهار چیز را از هم جدا نگه دارید:

```text
Harness
= قواعد و قراردادهایی که AI باید هنگام کار Product/Design رعایت کند

Runtime Guards
= لایهٔ اختیاری برای enforce کردن چند قانون مهم هنگام اجرای PRD

Evals
= تست‌هایی برای بررسی اینکه Harness و Runtime هنوز رفتار درست را حفظ کرده‌اند

Proofs
= اجرای end-to-end برای بررسی اینکه چند لایهٔ سیستم در کنار هم روی یک سناریوی واقعی کار می‌کنند
```

هر کدام هدف متفاوتی دارند. Runtime خروجی یک اجرای واقعی را کنترل می‌کند؛ Eval خود سیستم را آزمایش می‌کند؛ Proof تعامل چند بخش را در یک اجرای واقعی یا نزدیک به واقعی بررسی می‌کند.

---

# 1. Runtime Guards چیست؟

## مسئله‌ای که حل می‌کند

خواندن قواعد Harness توسط مدل تضمین نمی‌کند که مدل همیشه آن‌ها را درست اجرا کند.

مثلاً Harness می‌گوید:

- AI نباید یک assumption را به Product requirement تبدیل کند.
- فقط clarificationهایی که واقعاً برای Problem Alignment blocking هستند باید به PM برسند.
- یک clarification نباید چند Product Decision مستقل را با هم بپرسد.
- AI نباید زودتر از موعد `Problem Aligned` اعلام کند.

ممکن است مدل این قواعد را بخواند و باز هم در یک اجرا اشتباه کند.

Runtime Guards برای چند failure mode مشخص، یک لایهٔ کنترل اضافه می‌کنند.

```text
PM Intent
   ↓
مدل اصلی PRD را می‌سازد
   ↓
Runtime Guards خروجی را بررسی می‌کنند
   ↓
اگر لازم بود → repair
   ↓
خروجی معتبرتر
```

Runtime Guard جای Harness را نمی‌گیرد. قواعد همچنان در shared contract، workflow و artifact contract تعریف می‌شوند. Runtime فقط بعضی از آن قواعد را enforce می‌کند.

## Guardهای فعلی PRD

### Authority Guard

می‌پرسد:

> آیا claimهایی که به‌عنوان Product behavior قطعی وارد PRD شده‌اند واقعاً authority دارند؟

به‌طور خاص، claimهای بخش‌های authoritative مثل `Scope`، `Required Product Behavior` و `Acceptance Criteria` بررسی می‌شوند.

مثال failure:

```text
PM:
پاسخ همه سؤال‌ها الزامی است.

AI:
پاسخ قبلی کارجو باید بین همهٔ کارفرماها reuse شود.
```

اگر تصمیم دوم از Intent یا پاسخ PM نیامده باشد و necessary implication هم نباشد، Authority Guard باید آن را unsupported تشخیص دهد.

### Clarification Materiality Guard

می‌پرسد:

> آیا واقعاً لازم است PM همین حالا این سؤال را جواب دهد؟

هر Product-owned uncertainty لزوماً blocking نیست.

Guard سؤال‌ها را به سه دسته تقسیم می‌کند:

- `BLOCKING_PRODUCT_DECISION`
- `NON_BLOCKING_PRODUCT_UNCERTAINTY`
- `DESIGN_OWNED`

هدف این است که PM فقط برای تصمیم‌هایی interrupt شود که بدون آن‌ها Design مجبور می‌شود Product behavior مهمی را خودش اختراع کند.

### Clarification Atomicity Guard

می‌پرسد:

> آیا هر clarification فقط یک تصمیم مستقل Product را حل می‌کند؟

مثلاً این سؤال non-atomic است:

> آیا سؤال‌ها optional باشند، پاسخ قبلی prefill شود و جواب خاص باعث auto-reject شود؟

چون چند تصمیم مستقل را با هم ترکیب کرده است.

### Alignment Guard

می‌پرسد:

> وقتی مدل می‌گوید `Problem Aligned`، آیا هنوز Product boundary مهم و blockingی باز مانده است؟

هدف جلوگیری از اعلام زودهنگام Problem Alignment است.

## Authority Ledger چیست؟

Runtime برای بررسی authority نیاز دارد بداند چه چیزی واقعاً از طرف PM established شده است.

برای این کار یک Authority Ledger نگه می‌دارد.

```text
PM-001 → بخشی از PM Intent
PM-002 → بخشی دیگر از PM Intent
HD-001 → پاسخ PM به یک clarification
HD-002 → تصمیم بعدی PM
```

به این ترتیب Guard لازم نیست هر بار از کل conversation حدس بزند که یک claim قبلاً تصمیم گرفته شده یا نه.

## Runtime الان کجا قرار دارد؟

```text
runtime/
├── prd/
└── adapters/
    └── codex/
```

`runtime/prd/` منطق provider-agnostic Guardها و interfaceهای آن‌ها را نگه می‌دارد.

`runtime/adapters/codex/` implementation فعلی برای اجرای semantic review با Codex SDK است.

بنابراین اصل معماری Guard به Codex وابسته نیست، اما adapter اجرایی فعلی Codex-specific است.

## آیا PRD حتماً باید در Codex ساخته شود؟

خیر.

مدل اصلی تولیدکنندهٔ PRD می‌تواند Claude، ChatGPT، Codex یا provider دیگری باشد.

Codex در Runtime فعلی فقط implementation موجود برای اجرای semantic reviewer است.

از نظر معماری حتی این ترکیب ممکن است:

```text
Claude → PRD
        ↓
Runtime Guards
        ↓
Codex reviewer
```

در حال حاضر workflow عمومی و روزمره‌ای که این runtime را وسط هر Chat قرار دهد نداریم.

## Runtime الان برای چه استفاده می‌شود؟

در وضعیت فعلی، Runtime بیشتر برای این موارد استفاده شده است:

1. اجرای high-assurance آزمایشی روی PRDهای واقعی یا نزدیک به واقعی.
2. بررسی incidentهای مهم و فهم اینکه آیا Guard می‌توانست جلوی failure را بگیرد.
3. تست و hardening خود Harness.
4. ساخت regression test برای failureهای مهم.

Runtime هنوز بخشی از workflow روزمره همهٔ PMها نیست.

## Runtime چه کاری نمی‌کند؟

Runtime فعلی یک quality improver عمومی نیست.

مثلاً تضمین نمی‌کند:

- Problem framing عالی باشد.
- research کامل باشد.
- copywriting خوب باشد.
- همه edge caseها پیدا شوند.
- PRD concise یا خوش‌خوان باشد.
- Product Knowledge کامل باشد.

Guardها فقط failure modeهای مشخصی را بررسی می‌کنند.

---

# 2. Eval چیست؟

`Eval` مخفف Evaluation است.

Eval یک تست کنترل‌شده است که بررسی می‌کند:

> آیا Harness یا Runtime هنوز رفتار مورد انتظار را دارد؟

Eval خودش Product Task واقعی را پیش نمی‌برد و چیزی را repair نمی‌کند.

```text
Harness / Runtime فعلی
        ↓
      Eval
        ↓
PASS / FAIL
+ findings
```

اگر Eval fail شود، خودش هیچ فایل Harness را تغییر نمی‌دهد. انسان یا AI باید علت را بررسی کند و در صورت نیاز Harness، Runtime یا خود Eval را اصلاح کند.

## Regression یعنی چه؟

Regression یعنی رفتاری که قبلاً درست شده بود، بعد از یک تغییر دوباره خراب شود.

مثال:

1. AI بعد از اینکه PM یک تصمیم را گرفته، چند turn بعد همان تصمیم را دوباره Unresolved می‌کند.
2. Harness اصلاح می‌شود و رفتار درست می‌شود.
3. یک تغییر جدید در workflow یا Guard می‌دهیم و ناخواسته همان failure قدیمی برمی‌گردد.

برگشت failure قدیمی یک **regression** است.

برای جلوگیری از آن، failure واقعی را تبدیل به Regression Eval می‌کنیم:

```text
Observed failure
      ↓
Fix
      ↓
Regression case
      ↓
تغییرات آینده
      ↓
آیا failure قدیمی برگشته؟
```

Regression Eval بیشتر از اینکه بپرسد «مدل چقدر خوب است؟» می‌پرسد:

> آیا چیزی که قبلاً درست کرده‌ایم هنوز درست مانده است؟

## Evals کجا هستند؟

```text
evals/
├── README.md
├── cases/
└── orchestrator/
```

### `evals/cases/`

سناریوهای durable تست را نگه می‌دارد.

هر case معمولاً مشخص می‌کند:

- Purpose
- Scenario / Inputs
- Expected invariants
- Explicit failure conditions
- Recommended grading

Case باید semantic behavior را تعریف کند، نه wording دقیق مدل را.

### `evals/orchestrator/`

ابزارهای اجرایی برای run کردن و validate کردن evalها را نگه می‌دارد، شامل behavioral tests، semantic/model-backed regressions، smoke tests، snapshot tooling و runtime-guard validation.

## Eval چه چیزی را تغییر می‌دهد؟

هیچ‌چیز را به‌صورت خودکار.

نتیجه معمولاً یکی از این‌هاست:

```text
PASS
```

یا:

```text
FAIL
+ findings
```

بعد باید root cause بررسی شود.

ممکن است مشکل یکی از این‌ها باشد:

- Harness rule
- Runtime Guard
- model behavior
- parser/runner
- Product Knowledge
- خود Eval یا expected invariant

Eval فقط failure را آشکار می‌کند؛ fix را خودش اعمال نمی‌کند.

## آیا Evalها خودکار اجرا می‌شوند؟

فعلاً خیر.

این repository در حال حاضر default CI pipeline ندارد که با هر تغییر همهٔ evalها را اجرا کند.

Evalها on-demand اجرا می‌شوند. یعنی وقتی تغییر مرتبطی می‌دهیم یا incident مهمی بررسی می‌کنیم، eval مناسب را دستی فراخوانی می‌کنیم.

## چه زمانی باید Eval اجرا شود؟

Cadence ثابت لازم نیست. Trigger-based اجرا کنید.

موارد اصلی:

- تغییر semantic در `shared-harness-contract.md`
- تغییر workflow PRD
- تغییر artifact contractی که روی behavior اثر دارد
- تغییر Guard logic یا Guard prompt
- مشاهده failure واقعی و تلاش برای fix آن
- تغییر مهم model/provider
- قبل از تثبیت یک تغییر مهم Harness

برای typo، wording جزئی یا documentation غیرسمانتیک معمولاً اجرای suite کامل لازم نیست.

## چه زمانی Regression Case جدید بسازیم؟

هر incident را تبدیل به Eval نکنید.

```text
Failure واقعی است؟
  ↓
Material است؟
  ↓
احتمال تکرار دارد؟
  ↓
می‌توان invariant عمومی از آن استخراج کرد؟
  ↓
Regression case
```

مثلاً یک جملهٔ ضعیف در PRD معمولاً Regression Case نمی‌خواهد.

اما این موارد معمولاً ارزش regression دارند:

- تصمیم PM دوباره Unresolved شود.
- assumption به requirement تبدیل شود.
- سؤال Design-owned مرتب به PM برسد.
- Product-owned ولی non-blocking uncertainty مرتب clarification شود.
- `Problem Aligned` در حالی اعلام شود که core Product boundary باز است.

---

# 3. Proof چیست؟

Proof با Eval نزدیک است، ولی هدف متفاوتی دارد.

Eval معمولاً یک invariant مشخص را تست می‌کند.

Proof می‌پرسد:

> آیا ترکیب کامل چند بخش معماری در یک اجرای واقعی یا نزدیک به واقعی کار می‌کند؟

مثلاً:

```text
PM Intent
→ Product Worker
→ PRD Draft
→ Runtime Guards
→ PM Clarification
→ Reconciliation
→ Alignment Guard
→ Final PRD
```

نمونهٔ فعلی در `proofs/guarded-prd-real-world/` قرار دارد.

Proof ممکن است failure جدیدی پیدا کند. اگر آن failure material و قابل تعمیم باشد، بعداً می‌تواند تبدیل به Regression Eval شود.

```text
Real usage / Proof
        ↓
Failure
        ↓
Root cause
        ↓
Minimal fix
        ↓
Regression Eval
```

---

# 4. تفاوت Runtime، Eval و Proof در یک نگاه

| مورد | Runtime Guard | Eval | Proof |
|---|---|---|---|
| هدف | جلوگیری/اصلاح failure در execution | تست behavior سیستم | تست تعامل end-to-end چند لایه |
| روی Product Task واقعی اثر می‌گذارد؟ | بله، اگر در مسیر اجرا باشد | خیر | معمولاً برای validation است |
| خروجی | pass/fail + audit + گاهی repair | pass/fail + findings | artifact/trace/metrics/result |
| چیزی را خودش تغییر می‌دهد؟ | ممکن است از طریق repair loop خروجی Worker را اصلاح کند | خیر | بسته به runner، برای validation اجرا می‌شود |
| هزینه | متوسط تا بالا | از بسیار کم تا بالا | معمولاً بالا |
| استفاده فعلی | محدود / high-assurance / diagnostic | on-demand | hardening و validation |

---

# 5. وضعیت فعلی Harness از نظر استفاده

Harness در مرحلهٔ Pilot است.

Pilot در اینجا یعنی:

- برای کار واقعی آماده و قابل استفاده است.
- هنوز در حال یادگیری از usage واقعی هستیم.
- core workflow باید تا حد ممکن با featureهای واقعی سنجیده شود.
- نباید برای هر failure یک لایهٔ جدید معماری بسازیم.
- Runtime هنوز لازم نیست در workflow روزمره همهٔ PMها productionized شود.

در این دوره ارزش اصلی از استفادهٔ واقعی PMها و Designerها می‌آید، نه از ساخت infrastructure بیشتر.

---

# 6. اگر PM یا Designer یک failure دید چه کنیم؟

از کاربر Harness نخواهید root cause را تشخیص دهد. فقط incident را بگیرید.

حداقل اطلاعات مفید:

1. Feature / Task
2. Tool or model
3. PM Intent یا ورودی اصلی
4. بخش مشکل‌دار از conversation یا artifact
5. Expected behavior از نظر انسان
6. در صورت امکان لینک یا فایل artifact/conversation

بعد دو مسیر را از هم جدا کنید:

```text
Incident
  ├── Product recovery
  │      → کار واقعی را unblock کن
  │
  └── Harness investigation
         → reproduce
         → classify root cause
         → fix only if justified
```

PM نباید منتظر investigation Harness بماند تا feature خودش را ادامه دهد.

## دسته‌بندی Root Cause

یک incident معمولاً در یکی از این دسته‌ها می‌افتد:

### Execution / model failure
Harness rule درست است، ولی مدل در آن run رعایتش نکرده. اگر one-off باشد، لزوماً Harness change نمی‌خواهد.

### Product Knowledge gap
مدل current product را اشتباه فهمیده چون context ناقص، قدیمی یا غیرقابل دسترسی بوده است. Fix معمولاً باید در Product Knowledge یا retrieval باشد.

### Harness gap
قاعده وجود ندارد یا مبهم است و failure از خود contract/workflow می‌آید.

### Runtime/Guard gap
قاعده Harness درست است، Guard قرار است آن را enforce کند، ولی Guard failure را نگرفته است.

### Artifact/usability issue
Semantics درست است، ولی artifact برای downstream role قابل استفاده یا روشن نیست.

---

# 7. Runtime چگونه در Incident Investigation کمک می‌کند؟

Runtime لازم نیست روی هر execution فعال باشد تا مفید باشد.

برای incident مهم می‌توان guarded replay انجام داد:

```text
Real failure
      ↓
reproduce without guards
      ↓
replay with guards
      ↓
compare
```

سه نتیجهٔ مهم ممکن است:

### Guard failure را می‌گیرد
یعنی Harness semantics احتمالاً درست است و Runtime می‌توانست execution mistake را بگیرد.

### Worker و Guard هر دو failure را قبول می‌کنند
ممکن است Guard gap، Harness gap یا shared semantic misunderstanding داشته باشیم.

### Failure reproduce نمی‌شود
ممکن است one-off model variance یا context difference بوده باشد. در این حالت نباید سریع Harness را تغییر داد.

---

# 8. چه زمانی دوباره سراغ Runtime productionization برویم؟

فعلاً Runtime Host عمومی نداریم و ساخت آن پیچیدگی قابل توجهی دارد.

زمان مناسب برای بازنگری وقتی است که usage واقعی نشان دهد:

- failureهای Authority / Materiality / Alignment مرتب تکرار می‌شوند؛
- manual review هزینهٔ قابل توجهی ایجاد می‌کند؛
- guarded replay نشان دهد Runtime درصد معناداری از incidentها را می‌گیرد؛
- چند ابزار مختلف به execution semantics یکسان نیاز دارند؛
- ارزش reliability بیشتر از هزینهٔ orchestration، latency و token usage شده است.

تا آن زمان Runtime می‌تواند ابزار high-assurance و diagnostic باقی بماند.

---

# 9. چه زمانی Harness از Pilot خارج می‌شود؟

خروج از Pilot با تاریخ ثابت تعریف نمی‌شود.

نشانه‌های اصلی:

- چندین feature واقعی و متنوع با Harness اجرا شده‌اند.
- failure patternها نسبتاً پایدار شده‌اند.
- core workflow دیگر مرتب بازطراحی نمی‌شود.
- PMها و Designerهای دیگر بدون کمک دائمی Harness Owner می‌توانند از آن استفاده کنند.
- downstream roles مجبور نیستند مرتب Product/Design decisionهای جاافتاده را حدس بزنند.
- نسبت quality gain به time/token/friction قابل قبول است.

به‌عنوان یک benchmark عملی، بعد از حدود ۱۰ تا ۲۰ feature واقعی و متنوع می‌توان یک maturity review انجام داد، اما عدد به‌تنهایی exit criterion نیست.

---

# 10. کار مناسب در دورهٔ Pilot

```text
Feature واقعی
    ↓
Harness را عادی اجرا کن
    ↓
اگر incident واقعی دیدی، ثبت کن
    ↓
Root cause را مشخص کن
    ↓
اگر material + recurring/generalizable بود
    ↓
Minimal fix
    ↓
Regression Eval
```

در Pilot بهتر است از ساخت proactive این موارد خودداری شود، مگر usage واقعی نیاز را نشان دهد:

- central orchestration platform
- Runtime Host عمومی
- Guard برای هر failure جزئی
- dashboard بزرگ
- broad speculative eval suite
- multi-agent supervisor architecture
- auto-CI گران برای همهٔ semantic evalها

---

# 11. Source of Truth

این سند فقط راهنمای انسانی است.

قواعد authoritative Harness همچنان در این فایل‌ها هستند:

- `shared-harness-contract.md`
- workflow مرتبط
- artifact contract مرتبط

Runtime Guards آن قواعد را validate/enforce می‌کنند، اما آن‌ها را تعریف نمی‌کنند.

Evals نیز فقط آن رفتار را تست می‌کنند و حق ندارند rule جدیدی به Harness اضافه کنند.

اگر این راهنما با contractهای اصلی ناسازگار شد، contractهای اصلی source of truth هستند و این فایل باید اصلاح شود.

---

## خلاصهٔ یک‌خطی

```text
Harness می‌گوید چه رفتاری درست است.
Runtime تلاش می‌کند چند قانون مهم را هنگام اجرا enforce کند.
Eval بررسی می‌کند این رفتارها بعداً خراب نشده‌اند.
Proof بررسی می‌کند ترکیب کامل سیستم در یک اجرای واقعی کار می‌کند.
```
