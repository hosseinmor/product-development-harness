# راهنمای شروع برای PM

از این راهنما برای شروع یا ادامه یک Product Task با Job Vision Product Development Harness استفاده کنید.

## قبل از شروع

1. در صورت نیاز برای دسترسی به منابع داخلی، دستگاه‌تان را به VPN شرکت متصل کنید.
2. Harness canonical در ریپازیتوری داخلی GitLab شرکت با نام `product-development-harness` قرار دارد.
3. منبع canonical Product Knowledge جاب‌ویژن:

https://docs-jv.jvoffice.ir/

4. PRD canonical هر Product Change در GitLab Wiki نگهداری می‌شود. اگر task ادامه‌ی کار قبلی است، current PRD را از Wiki بگیرید و chat history یا فایل قدیمی را جای آن قرار ندهید.

## Prompt شروع

```text
برای این Product Task از Job Vision Product Development Harness استفاده کن.

Harness:
ریپازیتوری داخلی GitLab شرکت با نام `product-development-harness`

از AGENTS.md شروع کن و فقط contextهایی را بخوان که برای این task route یا materially لازم می‌شوند.

Product Knowledge:
https://docs-jv.jvoffice.ir/

Product Knowledge منبع اصلی context مستند محصول است. اگر برای journey یا flow مرتبط Product Walkthrough در دسترس است، از آن هم استفاده کن.

اگر محیطت به یک منبع داخلی دسترسی مستقیم ندارد، این محدودیت را صریح بگو و فقط context مرتبطی را که در اختیارت می‌گذارم استفاده کن. Current Product Context را حدس نزن.

Intent من:
[مسئله، ایده یا تغییر محصول را با زبان خودت توضیح بده]
```

اگر task ادامه‌ی یک PRD موجود است، این بخش را هم اضافه کنید:

```text
Current PRD:
[لینک Wiki page یا نسخه current PRD را attach کن]

این PRD را به‌عنوان durable artifact فعلی ادامه بده؛ از صفر PRD موازی نساز.
```

اگر همراه task فایل، research، note، screenshot یا context دیگری می‌دهید، Agent باید فقط در صورت ارتباط از آن استفاده کند. لازم نیست workflow یا قواعد Harness را دوباره در prompt توضیح دهید؛ `AGENTS.md` Agent را به workflow و artifact contract مناسب هدایت می‌کند.

در Pilot فعلی MCP شرط استفاده از Harness نیست. اگر محیط AI دسترسی مستقیم به GitLab ندارد، فایل‌های route‌شده را دستی در اختیار Agent بگذارید؛ از `AGENTS.md` شروع کنید و کل repository را بدون نیاز وارد context نکنید.

## PRD را کجا نگه می‌داریم؟

PRD canonical در GitLab Wiki تعیین‌شده برای Product PRDها نگهداری می‌شود. برای هر Product Change یک Wiki page داریم و همان page نسخه current PRD است. تاریخچه و diff تغییرات را GitLab Wiki حفظ می‌کند؛ لازم نیست برای هر تغییر page جدیدی با نام `v1`، `v2` یا `final` بسازید.

در Pilot فعلی PM خروجی مورد تأیید را در همان Wiki page ثبت یا به‌روزرسانی می‌کند. Designer، Engineering و سایر نقش‌ها PRD را از Wiki می‌گیرند و اگر Product change یا اصلاحی دارند، روی همان page comment می‌گذارند. Comment پیشنهاد است، نه Product decision. PM تصمیم را می‌گیرد و در صورت پذیرش، PRD canonical را به‌روزرسانی می‌کند.

فایل دانلودشده، exportشده یا کپی‌شده برای کار با AI فقط working copy است و جای PRD canonical را نمی‌گیرد.

قبل از rollout تیمی، محل دقیق Wiki و permissionهای edit/comment باید توسط owner داخلی GitLab تأیید و به تیم اعلام شود. Harness نباید URL یا permissionی را که verify نشده حدس بزند.

## اگر Product Knowledge در دسترس نیست

اگر Current Product Context معتبر دیگری در اختیار دارید، مثل PRD قبلی، مستندات، screenshot، Figma یا implementation context، همچنان می‌توانید از Harness استفاده کنید و Agent باید محدودیت context را صریح نگه دارد.

اگر Product Knowledge و Current Product Context قابل‌اعتمادی در دسترس نیست، برای ساخت یک PRD اولیه می‌توانید از [Standalone PRD Kit](standalone-prd/README.md) استفاده کنید. این مسیر جایگزین هم‌ارز Harness نیست؛ فقط برای drafting ساختاریافته با context محدود است.

## در حین کار ممکن است چه چیزهایی ببینید؟

- **`Problem Aligned`** — یعنی PRD برای شروع Design Exploration به‌اندازه کافی روشن است و Designer مجبور نیست یک Product Decision مهم را خودش حدس بزند. این به معنی حل شدن همه سؤال‌های باز نیست.
- **سؤال Clarification** — Agent ممکن است درباره یک Product Decision مهم که قابل retrieval یا derivation نیست از شما سؤال کند. کافی است تصمیم‌تان را طبیعی و روشن بگویید؛ Agent باید آن را در PRD ثبت و reconcile کند.
- **عدم دسترسی به Product Knowledge** — اگر Agent نتواند منبع داخلی را بخواند، باید این محدودیت را اعلام کند و ممکن است فایل، screenshot یا context مشخصی از شما بخواهد. نباید Current Product Context را حدس بزند.
- **باقی ماندن Open Decision** — اگر یک تصمیم باز مانده ولی مانع Design Exploration معنادار نیست، PRD همچنان می‌تواند `Problem Aligned` باشد.
- **برگشت Product gap از Design** — ممکن است Design یک Product Decision جاافتاده را آشکار کند. در این حالت تصمیم به PM برمی‌گردد و PRD باید قبل از ادامه کار downstream به‌روزرسانی شود.
