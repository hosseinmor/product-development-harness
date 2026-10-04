# راهنمای شروع برای Product Designer

از این راهنما برای شروع Design Exploration با Job Vision Product Development Harness استفاده کنید.

## قبل از شروع

1. دستگاه‌تان را برای دسترسی به Product Knowledge به VPN شرکت متصل کنید و از یک browser محلی روی همان دستگاه استفاده کنید.
2. Harness canonical در پروژه داخلی GitLab با مسیر `product/prd/agent-harness` قرار دارد.
3. PRD فعلی را از Wiki همان پروژه بگیرید یا در صورت نبود دسترسی مستقیم، نسخه current آن را به Agent بدهید. PRD durable را به chat history یا working copy قدیمی ترجیح دهید.
4. منبع canonical Product Knowledge جاب‌ویژن:

https://docs-jv.jvoffice.ir/

## Prompt شروع

```text
برای این Design Task از Job Vision Product Development Harness استفاده کن.

Harness:
پروژه داخلی GitLab با مسیر `product/prd/agent-harness`

از AGENTS.md شروع کن و فقط contextهایی را بخوان که برای این task route یا materially لازم می‌شوند.

Canonical Product Knowledge:
https://docs-jv.jvoffice.ir/

این سایت مرجع canonical رفتار و مفاهیم فعلی JobVision است. برای خواندن آن از browser محلی روی دستگاه متصل به VPN شرکت استفاده کن؛ Web Search یا Cloud Browser را جای این مسیر قرار نده.

برای current journey، flow یا feature walkthrough مرتبط، اگر Product Walkthrough در دسترس است از reviewed evidence آن برای بازسازی تجربه استفاده کن. Walkthrough evidence جای canonical Product Knowledge را نمی‌گیرد و در صورت تعارض باید اختلاف را صریح نگه داری.

اگر به browser محلی یا منبع داخلی دسترسی نداری، این محدودیت را صریح بگو و فقط context مرتبطی را که در اختیارت می‌گذارم استفاده کن. Current Experience را حدس نزن و از repositoryهای دیگر به‌عنوان fallback Product Knowledge استفاده نکن.

PRD:
[لینک Wiki page یا نسخه current PRD را attach کن]
```

اگر همراه task لینک Figma، screenshot، prototype، research یا context دیگری می‌دهید، Agent باید فقط در صورت ارتباط از آن استفاده کند. لازم نیست workflow طراحی را دوباره در prompt توضیح دهید؛ `AGENTS.md` Agent را به workflow و artifact contract مناسب هدایت می‌کند.

در Pilot فعلی MCP شرط استفاده از Harness نیست. اگر محیط AI دسترسی مستقیم به GitLab ندارد، فایل‌های route‌شده را دستی در اختیار Agent بگذارید؛ از `AGENTS.md` شروع کنید و کل repository را بدون نیاز وارد context نکنید.

اگر در حین Design Exploration یک Product change یا اصلاح در PRD لازم شد، آن را به‌عنوان پیشنهاد روی Wiki PRD مطرح کنید؛ Designer نباید مستقیماً Product decision را در PRD canonical establish کند. PM تصمیم می‌گیرد و در صورت پذیرش، current PRD را به‌روزرسانی می‌کند.

قبل از rollout تیمی، permissionهای edit/comment در پروژه GitLab باید یک بار با نقش‌های واقعی PM و Designer تست شوند. Harness نباید permissionی را که verify نشده فرض کند.

## در حین کار ممکن است چه چیزهایی ببینید؟

- **`Problem Aligned`** — یعنی PRD برای شروع Design Exploration به‌اندازه کافی روشن است و Designer مجبور نیست یک Product Decision مهم را خودش اختراع کند.
- **عدم دسترسی به canonical Product Knowledge** — Agent باید محدودیت دسترسی از مسیر browser محلی + VPN را اعلام کند و ممکن است screenshot، reviewed evidence، flow فعلی، فایل یا context مشخصی بخواهد. نباید Current Experience را حدس بزند یا repository دیگری را خودکار جایگزین Product Knowledge کند.
- **`Product Decision needed`** — یعنی Design رفتاری را آشکار کرده که PRD هنوز مشخص نکرده است. Designer می‌تواند پیشنهاد بدهد، اما تصمیم باید به PM و PRD برگردد.
- **`Selected` Design** — یعنی Designer جهت فعلی Design را انتخاب کرده و می‌توان آن را به‌عنوان Design Artifact durable نگه داشت. این به معنی pixel-perfect، immutable یا implementation-ready بودن نیست.
- **`Product & Design Aligned`** — یعنی PRD و Design انتخاب‌شده به‌اندازه کافی با هم سازگار و روشن‌اند که Engineering بتواند Technical Planning را شروع کند بدون اینکه مجبور شود Product یا Design Decision مهمی را خودش اختراع کند.
- **یافته PRD ↔ Design** — Stress Test ممکن است یک Product issue یا Design issue پیدا کند. اصلاح باید به artifact مالک همان تصمیم برگردد، نه اینکه فقط در chat باقی بماند.
