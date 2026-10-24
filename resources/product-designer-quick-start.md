# راهنمای شروع برای Product Designer

از این راهنما برای شروع Design Exploration با Job Vision Product Development Harness استفاده کنید.

## قبل از شروع

1. Harness فعلی در GitHub است: `https://github.com/hosseinmor/product-development-harness`. مهاجرت GitLab فعلاً تا حل مشکلات دسترسی متوقف است.
2. current durable PRD را از محل تعیین‌شده توسط PM بگیرید و به Agent بدهید. PRD durable را به chat history یا working copy قدیمی ترجیح دهید.
3. قبل از retrieval مشخص کنید Design Task مربوط به JobVision، Cando یا یک flow بین هر دو است.
4. وضعیت فعلی Product Knowledge:

- **JobVision:** منبع canonical در `https://docs-jv.jvoffice.ir/` است. در Pilot فعلی ChatGPT Desktop / Work، مسیر تأییدشده برای دسترسی **Chrome محلی روی همان دستگاه متصل به VPN شرکت، از طریق Computer Use + Chrome extension** است. Built-in Browser، Cloud Browser و Web Search مسیر جایگزین این منبع داخلی نیستند.
- **Cando:** منبع canonical در `https://docs-cd.jvoffice.ir/` است. فقط از execution pathی استفاده کنید که دسترسی آن به این source داخلی verify شده باشد؛ در صورت عدم دسترسی، evidence جای canonical source را نمی‌گیرد.
- **Cross-product / integration:** current behavior را بر اساس product partition کنید؛ JobVision Product Knowledge رفتار داخلی Cando را establish نمی‌کند و Cando Product Knowledge نیز رفتار داخلی JobVision را establish نمی‌کند.

## Prompt شروع

```text
برای این Design Task از Job Vision Product Development Harness استفاده کن.

Harness:
https://github.com/hosseinmor/product-development-harness

از AGENTS.md شروع کن و فقط contextهایی را بخوان که برای این task route یا materially لازم می‌شوند.

ابتدا product scope را مشخص کن و authority هر current-product claim را فقط از source معتبر همان product بگیر.

برای JobVision:
Canonical Product Knowledge در https://docs-jv.jvoffice.ir/ است. در ChatGPT Desktop / Work از Chrome محلی روی همان دستگاه متصل به VPN شرکت، از طریق Computer Use + Chrome extension، استفاده کن. Built-in Browser، Cloud Browser یا Web Search را جای این مسیر قرار نده. اگر این مسیر در دسترس نیست، محدودیت دسترسی را صریح بگو و source دیگری را جایگزین canonical Product Knowledge نکن.

برای Cando:
Canonical Product Knowledge در https://docs-cd.jvoffice.ir/ است. فقط از execution pathی استفاده کن که دسترسی آن به این source داخلی verify شده باشد. `docs-jv` را به رفتار داخلی Cando تعمیم نده. اگر `docs-cd` در دسترس نیست یا برای یک claim کافی نیست، evidence مرتبط را با authority واقعی خودش استفاده کن و uncertainty را صریح نگه دار.

برای current journey، flow یا feature walkthrough مرتبط، اگر Product Walkthrough در دسترس است از reviewed evidence آن برای بازسازی تجربه استفاده کن. Walkthrough evidence جای canonical Product Knowledge را نمی‌گیرد و در صورت تعارض باید اختلاف را صریح نگه داری.

برای Design Language، Design System و Product Content فقط context مرتبط را از `https://github.com/hosseinmor/design-language` retrieve کن؛ برای routing از `AGENTS.md` و `ai/router.md` و برای Content از `foundations/content/README.md` شروع کن. این repository Product Knowledge رفتار JobVision یا Cando نیست.

اگر به source لازم دسترسی نداری، این محدودیت را صریح بگو. Current Experience را حدس نزن و از repositoryهای دیگر به‌عنوان fallback Product Knowledge استفاده نکن.

PRD:
[لینک یا فایل current PRD را attach کن]
```

اگر همراه task لینک Figma، screenshot، prototype، research یا context دیگری می‌دهید، Agent باید فقط در صورت ارتباط از آن استفاده کند. لازم نیست workflow طراحی را دوباره در prompt توضیح دهید؛ `AGENTS.md` Agent را به workflow و artifact contract مناسب هدایت می‌کند.

در Pilot فعلی MCP شرط استفاده از Harness نیست. اگر محیط AI به GitHub دسترسی مستقیم ندارد، فایل‌های route‌شده را دستی در اختیار Agent بگذارید؛ از `AGENTS.md` شروع کنید و کل repository را بدون نیاز وارد context نکنید.

اگر در حین Design Exploration یک Product change یا اصلاح در PRD لازم شد، آن را به‌عنوان پیشنهاد نسبت به current durable PRD مطرح کنید؛ Designer نباید مستقیماً Product decision را در PRD establish کند. PM تصمیم می‌گیرد و در صورت پذیرش، current PRD را به‌روزرسانی می‌کند.

محل نگهداری PRD و permissionهای آن فعلاً deployment concern هستند. Harness نباید storage، edit/comment capability یا permissionی را که verify نشده فرض کند.

## در حین کار ممکن است چه چیزهایی ببینید؟

- **`Problem Aligned`** — یعنی PRD برای شروع Design Exploration به‌اندازه کافی روشن است و Designer مجبور نیست یک Product Decision مهم را خودش اختراع کند.
- **عدم دسترسی به Product Knowledge canonical** — برای JobVision source canonical `docs-jv` و برای Cando source canonical `docs-cd` است. Agent باید access limitation هرکدام را صریح نگه دارد و source محصول دیگر را جایگزین نکند.
- **`Product Decision needed`** — یعنی Design رفتاری را آشکار کرده که PRD هنوز مشخص نکرده است. Designer می‌تواند پیشنهاد بدهد، اما تصمیم باید به PM و PRD برگردد.
- **`Selected` Design** — یعنی Designer جهت فعلی Design را انتخاب کرده و می‌توان آن را به‌عنوان Design Artifact durable نگه داشت. این به معنی pixel-perfect، immutable یا implementation-ready بودن نیست.
- **`Product & Design Aligned`** — یعنی PRD و Design انتخاب‌شده به‌اندازه کافی با هم سازگار و روشن‌اند که Engineering بتواند Technical Planning را شروع کند بدون اینکه مجبور شود Product یا Design Decision مهمی را خودش اختراع کند.
- **یافته PRD ↔ Design** — Stress Test ممکن است یک Product issue یا Design issue پیدا کند. اصلاح باید به artifact مالک همان تصمیم برگردد، نه اینکه فقط در chat باقی بماند.
