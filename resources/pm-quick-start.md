# راهنمای شروع برای PM

از این راهنما برای شروع یک Product Task با Job Vision Product Development Harness استفاده کنید.

## قبل از شروع

1. دستگاه‌تان را به VPN شرکت متصل کنید، اگر برای دسترسی به منابع داخلی لازم است.
2. از محیط AIای استفاده کنید که بتوانید فایل‌های Harness و Product Knowledge را در اختیارش بگذارید.
3. ریپازیتوری canonical داخلی GitLab برای Harness، محل Product Knowledge و Product Intent خودتان را در اختیار Agent بگذارید.

منبع فعلی Product Knowledge:

http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

این وضعیت موقتی است. وقتی Agentها به repository مربوط به Product Knowledge دسترسی مستقیم داشته باشند، repository را به‌عنوان منبع Product Knowledge می‌دهیم و وابستگی به browser + VPN حذف می‌شود.

## Prompt شروع

```text
برای این Product Task از Job Vision Product Development Harness استفاده کن.

Harness:
ریپازیتوری داخلی GitLab شرکت با نام `product-development-harness`

در Pilot فعلی اگر محیط AI دسترسی مستقیم به GitLab ندارد، فایل‌های لازم را دستی در اختیار Agent بگذارید. از `AGENTS.md` شروع کنید و فقط فایل‌هایی را بدهید که آن فایل route می‌کند. MCP برای استفاده از Harness لازم نیست.

Product Knowledge:
http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

Product Knowledge فعلاً فقط از شبکه داخلی قابل دسترسی است.
برای خواندن آن از browser محلی‌ای استفاده کن که از طریق VPN شرکت به این شبکه دسترسی دارد.

از AGENTS.md شروع کن.

Intent من:
[مسئله، ایده یا تغییر محصول را با زبان خودت توضیح بده]
```

اگر همراه task فایل، research، note، screenshot یا context دیگری می‌دهید، Agent باید در صورت ارتباط از آن استفاده کند. لازم نیست workflow یا قواعد Harness را دوباره در prompt توضیح دهید؛ `AGENTS.md` Agent را به workflow و artifact contract مناسب هدایت می‌کند.

### PRD را کجا نگه می‌داریم؟

PRD canonical در GitLab Wiki نگهداری می‌شود. برای هر Product Change یک Wiki page داریم و همان page نسخه current PRD است. تاریخچه تغییرات را Wiki/Git حفظ می‌کند؛ لازم نیست برای هر تغییر page جدیدی با نام version بسازید.

در Pilot فعلی PM خروجی نهایی AI را در Wiki می‌نویسد. Designer، Engineering و سایر نقش‌ها PRD را از Wiki می‌گیرند و اگر Product change یا اصلاحی دارند، روی همان page comment می‌گذارند. Comment پیشنهاد است، نه Product decision. PM تصمیم را می‌گیرد و در صورت پذیرش، PRD canonical را به‌روزرسانی می‌کند.

فایل دانلودشده یا کپی‌شده برای کار با AI فقط working copy است و جای PRD canonical را نمی‌گیرد.

## اگر Product Knowledge در دسترس نیست

اگر Current Product Context معتبر دیگری در اختیار دارید، مثل PRD قبلی، مستندات، screenshot، Figma یا implementation context، همچنان می‌توانید از Harness استفاده کنید و Agent باید محدودیت context را صریح نگه دارد.

اگر Product Knowledge و Current Product Context قابل‌اعتمادی در دسترس نیست، برای ساخت یک PRD اولیه می‌توانید از [Standalone PRD Kit](standalone-prd/README.md) استفاده کنید. این مسیر جایگزین هم‌ارز Harness نیست؛ فقط برای drafting ساختاریافته با context محدود است.

## در حین کار ممکن است چه چیزهایی ببینید؟

- **`Problem Aligned`** — یعنی PRD برای شروع Design Exploration به‌اندازه کافی روشن است و Designer مجبور نیست یک Product Decision مهم را خودش حدس بزند. این به معنی حل شدن همه سؤال‌های باز نیست.
- **سؤال Clarification** — Agent ممکن است درباره یک Product Decision مهم که قابل retrieval یا derivation نیست از شما سؤال کند. کافی است تصمیم‌تان را طبیعی و روشن بگویید؛ Agent باید آن را در PRD ثبت و reconcile کند.
- **عدم دسترسی به Product Knowledge** — اگر Agent نتواند مستندات داخلی را باز کند، باید این محدودیت را اعلام کند و ممکن است فایل، screenshot یا context مشخصی از شما بخواهد. نباید Current Product Context را حدس بزند.
- **باقی ماندن Open Decision** — اگر یک تصمیم باز مانده ولی مانع Design Exploration معنادار نیست، PRD همچنان می‌تواند `Problem Aligned` باشد.
- **برگشت Product gap از Design** — ممکن است Design یک Product Decision جاافتاده را آشکار کند. در این حالت تصمیم به PM برمی‌گردد و PRD باید قبل از ادامه کار downstream به‌روزرسانی شود.
