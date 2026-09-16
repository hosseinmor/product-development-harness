# راهنمای شروع برای PM

از این راهنما برای شروع یک Product Task با Job Vision Product Development Harness استفاده کنید.

## قبل از شروع

1. دستگاه‌تان را به VPN شرکت متصل کنید.
2. از محیط AIای استفاده کنید که به browser محلی روی همان دستگاه دسترسی داشته باشد.
3. آدرس Harness، محل Product Knowledge و Product Intent خودتان را در اختیار Agent بگذارید.

منبع فعلی Product Knowledge:

http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

این وضعیت موقتی است. وقتی Agentها به repository مربوط به Product Knowledge دسترسی مستقیم داشته باشند، repository را به‌عنوان منبع Product Knowledge می‌دهیم و وابستگی به browser + VPN حذف می‌شود.

## Prompt شروع

```text
برای این Product Task از Job Vision Product Development Harness استفاده کن.

Harness:
https://github.com/hosseinmor/product-development-harness

Product Knowledge:
http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

Product Knowledge فعلاً فقط از شبکه داخلی قابل دسترسی است.
برای خواندن آن از browser محلی‌ای استفاده کن که از طریق VPN شرکت به این شبکه دسترسی دارد.

از AGENTS.md شروع کن.

Intent من:
[مسئله، ایده یا تغییر محصول را با زبان خودت توضیح بده]
```

اگر همراه task فایل، research، note، screenshot یا context دیگری می‌دهید، Agent باید در صورت ارتباط از آن استفاده کند. لازم نیست workflow یا قواعد Harness را دوباره در prompt توضیح دهید؛ `AGENTS.md` Agent را به workflow و artifact contract مناسب هدایت می‌کند.

## اگر Product Knowledge در دسترس نیست

اگر Current Product Context معتبر دیگری در اختیار دارید، مثل PRD قبلی، مستندات، screenshot، Figma یا implementation context، همچنان می‌توانید از Harness استفاده کنید و Agent باید محدودیت context را صریح نگه دارد.

اگر Product Knowledge و Current Product Context قابل‌اعتمادی در دسترس نیست، برای ساخت یک PRD اولیه می‌توانید از [Standalone PRD Kit](standalone-prd/README.md) استفاده کنید. این مسیر جایگزین هم‌ارز Harness نیست؛ فقط برای drafting ساختاریافته با context محدود است.

## در حین کار ممکن است چه چیزهایی ببینید؟

- **`Problem Aligned`** — یعنی PRD برای شروع Design Exploration به‌اندازه کافی روشن است و Designer مجبور نیست یک Product Decision مهم را خودش حدس بزند. این به معنی حل شدن همه سؤال‌های باز نیست.
- **سؤال Clarification** — Agent ممکن است درباره یک Product Decision مهم که قابل retrieval یا derivation نیست از شما سؤال کند. کافی است تصمیم‌تان را طبیعی و روشن بگویید؛ Agent باید آن را در PRD ثبت و reconcile کند.
- **عدم دسترسی به Product Knowledge** — اگر Agent نتواند مستندات داخلی را باز کند، باید این محدودیت را اعلام کند و ممکن است فایل، screenshot یا context مشخصی از شما بخواهد. نباید Current Product Context را حدس بزند.
- **باقی ماندن Open Decision** — اگر یک تصمیم باز مانده ولی مانع Design Exploration معنادار نیست، PRD همچنان می‌تواند `Problem Aligned` باشد.
- **برگشت Product gap از Design** — ممکن است Design یک Product Decision جاافتاده را آشکار کند. در این حالت تصمیم به PM برمی‌گردد و PRD باید قبل از ادامه کار downstream به‌روزرسانی شود.
