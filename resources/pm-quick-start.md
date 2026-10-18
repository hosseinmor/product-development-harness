# راهنمای شروع برای PM

از این راهنما برای شروع یا ادامه یک Product Task با Job Vision Product Development Harness استفاده کنید.

## قبل از شروع

1. Harness فعلی در GitHub است: `https://github.com/hosseinmor/product-development-harness`. مهاجرت GitLab فعلاً تا حل مشکلات دسترسی متوقف است.
2. قبل از retrieval مشخص کنید task مربوط به کدام product است؛ Product Knowledge authority به product scope وابسته است.
3. وضعیت فعلی Product Knowledge:

- **JobVision:** منبع canonical در `https://docs-jv.jvoffice.ir/` است. در Pilot فعلی ChatGPT Desktop / Work، مسیر تأییدشده برای دسترسی **Chrome محلی روی همان دستگاه متصل به VPN شرکت، از طریق Computer Use + Chrome extension** است. Built-in Browser، Cloud Browser و Web Search مسیر جایگزین این منبع داخلی نیستند.
- **Cando:** منبع canonical در `https://docs-cd.jvoffice.ir/` است. در هر execution environment فقط از مسیری استفاده کنید که دسترسی آن به این source داخلی verify شده باشد؛ در صورت عدم دسترسی، source دیگری را جای canonical Cando Product Knowledge قرار ندهید.
- **Taskهای integration:** ادعاها را بر اساس product تفکیک کنید؛ `docs-jv` فقط authority سمت JobVision و `docs-cd` فقط authority سمت Cando را دارد، مگر اینکه یک integration-boundary fact صریحاً در source مربوط مستند شده باشد.

4. محل نهایی hosting برای PRD فعلاً در Harness تثبیت نشده است. برای هر Product Change یک current durable PRD مشخص کنید و در ادامه‌ی کار همان را به Agent بدهید؛ chat history یا فایل قدیمی جای آن نیست.

## Prompt شروع

```text
برای این Product Task از Job Vision Product Development Harness استفاده کن.

Harness:
https://github.com/hosseinmor/product-development-harness

از AGENTS.md شروع کن و فقط contextهایی را بخوان که برای این task route یا materially لازم می‌شوند.

ابتدا product scope را مشخص کن و Product Knowledge را فقط از source canonical همان product بگیر.

برای JobVision:
https://docs-jv.jvoffice.ir/
این سایت مرجع canonical رفتار و مفاهیم فعلی JobVision است. در ChatGPT Desktop / Work از Chrome محلی روی همان دستگاه متصل به VPN شرکت، از طریق Computer Use + Chrome extension، استفاده کن. Built-in Browser، Cloud Browser یا Web Search را جای این مسیر قرار نده. اگر این مسیر در دسترس نیست، محدودیت دسترسی را صریح بگو و source دیگری را جایگزین canonical Product Knowledge نکن.

برای Cando:
Canonical Product Knowledge در https://docs-cd.jvoffice.ir/ است. فقط از execution pathی استفاده کن که دسترسی آن به این source داخلی verify شده باشد. `docs-jv` را به رفتار داخلی Cando تعمیم نده و اگر `docs-cd` در دسترس نیست، این محدودیت را صریح نگه دار. اگر canonical source برای یک claim کافی نیست یا با evidence تعارض دارد، evidence مرتبط را با authority واقعی خودش استفاده کن و uncertainty را طبق Harness حفظ کن.

اگر برای journey یا flow مرتبط Product Walkthrough در دسترس است، از reviewed evidence آن برای بازسازی flow استفاده کن، اما آن را جای Product Knowledge canonical قرار نده.

اگر به source لازم دسترسی نداری، این محدودیت را صریح بگو. Current Product Context را حدس نزن و از repositoryهای دیگر به‌عنوان fallback Product Knowledge استفاده نکن.

Intent من:
[مسئله، ایده یا تغییر محصول را با زبان خودت توضیح بده]
```

اگر task ادامه‌ی یک PRD موجود است، این بخش را هم اضافه کنید:

```text
Current PRD:
[لینک یا فایل current PRD را attach کن]

این PRD را به‌عنوان durable artifact فعلی ادامه بده؛ از صفر PRD موازی نساز.
```

اگر همراه task فایل، research، note، screenshot یا context دیگری می‌دهید، Agent باید فقط در صورت ارتباط از آن استفاده کند. لازم نیست workflow یا قواعد Harness را دوباره در prompt توضیح دهید؛ `AGENTS.md` Agent را به workflow و artifact contract مناسب هدایت می‌کند.

در Pilot فعلی MCP شرط استفاده از Harness نیست. اگر محیط AI به GitHub دسترسی مستقیم ندارد، فایل‌های route‌شده را دستی در اختیار Agent بگذارید؛ از `AGENTS.md` شروع کنید و کل repository را بدون نیاز وارد context نکنید.

## PRD را کجا نگه می‌داریم؟

مهاجرت GitLab و استفاده از GitLab Wiki فعلاً به‌دلیل مشکلات دسترسی متوقف است. Harness در این Pilot یک سرویس hosting مشخص برای PRD تحمیل نمی‌کند.

برای هر Product Change، PM باید یک **current durable PRD** مشخص داشته باشد و همان artifact را در ادامه‌ی کار به AI، Designer و سایر نقش‌ها بدهد. نسخه‌های موازی مثل `v1`، `v2` یا `final` نسازید مگر اینکه واقعاً نیاز workflow وجود داشته باشد. محل نگهداری می‌تواند بعداً با تصمیم تیم عوض شود؛ AI نباید خودش storage یا permission model را فرض کند.

PRD جدید تا قبل از registration رسمی با `id: unresolved` شروع می‌شود. AI یا PM نباید شمارهٔ بعدی را از روی PRDهای موجود حدس بزند. ID رسمی باید از registry configured تخصیص داده شود و با فرمت `JV-PRD-NNNNN` برای JobVision یا `CND-PRD-NNNNN` برای Cando ثبت شود. اولین تخصیص registration است و بعد از آن ID باید ثابت بماند. `Problem Aligned` شدن به registration وابسته نیست، اما قبل از downstream handoff به‌عنوان current durable PRD باید ID رسمی تخصیص داده شده باشد.

وقتی PRD برای handoff آماده می‌شود، Agent باید یک خروجی واحد بدهد: ابتدا خود PRD و سپس بخش `Harness Pilot Evaluation` به‌صورت non-authoritative. اگر محل نگهداری از `<details>` پشتیبانی می‌کند، این بخش collapsed باشد؛ در غیر این صورت بلافاصله بعد از PRD با heading صریح non-authoritative نگهداری شود.

PM لازم نیست سؤال‌وجواب‌ها یا Evaluation Record را دستی بازنویسی کند. Agent باید آن را consolidate کند. اگر Harness Owner بعداً run را review کند، می‌تواند `Harness Owner Review` را اضافه کند؛ Agent نباید این review را از طرف Owner پر کند.

## اگر Product Knowledge در دسترس نیست

برای JobVision، اگر canonical Product Knowledge موقتاً در دسترس نیست اما Current Product Context معتبر دیگری مثل PRD قبلی، reviewed evidence، screenshot، Figma یا implementation context دارید، می‌توانید برای drafting یا investigation از Harness استفاده کنید ولی Agent باید محدودیت authority را صریح نگه دارد. این context جای canonical Product Knowledge را نمی‌گیرد.

برای Cando، اگر `https://docs-cd.jvoffice.ir/` موقتاً در دسترس نیست، Agent باید محدودیت access را صریح نگه دارد. explicit owner input، approved decisions و reviewed evidence می‌توانند برای drafting یا investigation استفاده شوند، اما جای canonical Cando Product Knowledge را نمی‌گیرند و `docs-jv` نیز fallback canonical برای Cando نیست.

اگر Product Knowledge و Current Product Context قابل‌اعتمادی در دسترس نیست، برای ساخت یک PRD اولیه می‌توانید از [Standalone PRD Kit](standalone-prd/README.md) استفاده کنید. این مسیر جایگزین هم‌ارز Harness نیست؛ فقط برای drafting ساختاریافته با context محدود است.

## در حین کار ممکن است چه چیزهایی ببینید؟

- **`Problem Aligned`** — یعنی PRD برای شروع Design Exploration به‌اندازه کافی روشن است و Designer مجبور نیست یک Product Decision مهم را خودش حدس بزند. این به معنی حل شدن همه سؤال‌های باز نیست.
- **سؤال Clarification** — Agent ممکن است درباره یک Product Decision مهم که قابل retrieval یا derivation نیست از شما سؤال کند. کافی است تصمیم‌تان را طبیعی و روشن بگویید؛ Agent باید آن را در PRD ثبت و reconcile کند. در Pilot، clarificationهای material و پاسخ شما برای Eval در بخش non-authoritative کنار همان current durable PRD حفظ می‌شوند.
- **عدم دسترسی به Product Knowledge canonical** — Agent باید محدودیت source را در product scope درست اعلام کند؛ برای JobVision source canonical `docs-jv` و برای Cando source canonical `docs-cd` است و نبود دسترسی به یکی اجازهٔ جایگزینی source محصول دیگر را نمی‌دهد.
- **باقی ماندن Open Decision** — اگر یک تصمیم باز مانده ولی مانع Design Exploration معنادار نیست، PRD همچنان می‌تواند `Problem Aligned` باشد.
- **برگشت Product gap از Design** — ممکن است Design یک Product Decision جاافتاده را آشکار کند. در این حالت تصمیم به PM برمی‌گردد و PRD باید قبل از ادامه کار downstream به‌روزرسانی شود.
