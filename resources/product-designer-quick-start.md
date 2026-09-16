# راهنمای شروع برای Product Designer

از این راهنما برای شروع Design Exploration با Job Vision Product Development Harness استفاده کنید.

## قبل از شروع

1. دستگاه‌تان را به VPN شرکت متصل کنید.
2. از محیط AIای استفاده کنید که به browser محلی روی همان دستگاه دسترسی داشته باشد.
3. PRD فعلی را در اختیار Agent بگذارید. PRD durable را به chat history ترجیح دهید.

منبع فعلی Product Knowledge:

http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

این وضعیت موقتی است. وقتی Agentها به repository مربوط به Product Knowledge دسترسی مستقیم داشته باشند، repository را به‌عنوان منبع Product Knowledge می‌دهیم و وابستگی به browser + VPN حذف می‌شود.

## Prompt شروع

```text
برای این Design Task از Job Vision Product Development Harness استفاده کن.

Harness:
https://github.com/hosseinmor/product-development-harness

Product Knowledge:
http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/

Product Knowledge فعلاً فقط از شبکه داخلی قابل دسترسی است.
برای خواندن آن از browser محلی‌ای استفاده کن که از طریق VPN شرکت به این شبکه دسترسی دارد.

از AGENTS.md شروع کن.

PRD:
[فایل PRD را attach کن یا لینک durable آن را بده]
```

اگر همراه task لینک Figma، screenshot، prototype، research یا context دیگری می‌دهید، Agent باید در صورت ارتباط از آن استفاده کند. لازم نیست workflow طراحی را دوباره در prompt توضیح دهید؛ `AGENTS.md` Agent را به workflow و artifact contract مناسب هدایت می‌کند.

## در حین کار ممکن است چه چیزهایی ببینید؟

- **`Problem Aligned`** — یعنی PRD برای شروع Design Exploration به‌اندازه کافی روشن است و Designer مجبور نیست یک Product Decision مهم را خودش اختراع کند.
- **عدم دسترسی به Product Knowledge** — اگر Agent نتواند مستندات داخلی را باز کند، باید این محدودیت را اعلام کند و ممکن است screenshot، flow فعلی، فایل یا context مشخصی از شما بخواهد. نباید Current Experience را حدس بزند.
- **`Product Decision needed`** — یعنی Design رفتاری را آشکار کرده که PRD هنوز مشخص نکرده است. Designer می‌تواند پیشنهاد بدهد، اما تصمیم باید به PM و PRD برگردد.
- **`Selected` Design** — یعنی Designer جهت فعلی Design را انتخاب کرده و می‌توان آن را به‌عنوان Design Artifact durable نگه داشت. این به معنی pixel-perfect، immutable یا implementation-ready بودن نیست.
- **`Product & Design Aligned`** — یعنی PRD و Design انتخاب‌شده به‌اندازه کافی با هم سازگار و روشن‌اند که Engineering بتواند Technical Planning را شروع کند بدون اینکه مجبور شود Product یا Design Decision مهمی را خودش اختراع کند.
- **یافته PRD ↔ Design** — Stress Test ممکن است یک Product issue یا Design issue پیدا کند. اصلاح باید به artifact مالک همان تصمیم برگردد، نه اینکه فقط در chat باقی بماند.
