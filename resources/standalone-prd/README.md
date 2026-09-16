# Standalone PRD Kit

این Kit برای زمانی است که می‌خواهید یک PRD ساختاریافته بسازید اما نمی‌خواهید یا نمی‌توانید Product Development Harness را اجرا کنید؛ برای مثال وقتی Product Knowledge و Current Product Context کافی در دسترس نیست.

> این مسیر جایگزین هم‌ارز Harness نیست. خروجی ممکن است از نظر current-product grounding ضعیف‌تر باشد و نباید بدون verification به‌عنوان Current Product Truth در نظر گرفته شود.

## فایل‌ها

- [`prd-template.md`](prd-template.md) — تمپلیت خالی PRD
- [`authoring-guide.md`](authoring-guide.md) — راهنمای semantic هر بخش و مثال‌های کوتاه
- [`SKILL.md`](SKILL.md) — wrapper برای Agentهایی که از Skill-based instructions پشتیبانی می‌کنند

## استفاده بدون Skill

`prd-template.md` و `authoring-guide.md` را همراه context موجود به AI بدهید و بگویید بر اساس آن‌ها PRD را بسازد.

Prompt پیشنهادی:

```text
با استفاده از prd-template.md و authoring-guide.md برای این Product Intent یک PRD بساز.

اطلاعات و context موجود:
[فایل‌ها، noteها، research یا توضیحات موجود]

Intent:
[تغییر یا مسئله موردنظر]

اگر Current Product Context را نمی‌دانی، آن را اختراع نکن. فقط سؤال‌هایی را مطرح کن که برای ساخت PRD materially لازم‌اند و uncertainty باقی‌مانده را صریح نگه دار.
```

## استفاده با Skill

اگر محیط AI شما از Skill پشتیبانی می‌کند، کل پوشه `standalone-prd` را به‌عنوان Skill/Resource در اختیار آن قرار دهید. `SKILL.md` Agent را به template و authoring guide هدایت می‌کند.

Semantic guidance این Kit عمداً مستقل و محدود است. برای اجرای کامل Harness باید از `AGENTS.md` در root repository شروع کنید.
