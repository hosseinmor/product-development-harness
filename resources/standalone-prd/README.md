# Standalone PRD Kit

این Kit برای ساخت یک PRD ساختاریافته **بدون اجرای Product Development Harness** است؛ مثلاً وقتی Product Knowledge یا Current Product Context کافی در دسترس نیست، یا فقط یک PRD draft مستقل می‌خواهید.

> این مسیر جایگزین هم‌ارز Harness نیست. کیفیت grounding خروجی به contextی که در اختیار AI می‌گذارید وابسته است و خروجی نباید بدون verification به‌عنوان Current Product Truth در نظر گرفته شود.

## فایل‌ها

- [`prd-template.md`](prd-template.md) — تمپلیت خالی و AI-friendly
- [`authoring-guide.md`](authoring-guide.md) — قواعد semantic و مثال‌های کوتاه
- [`SKILL.md`](SKILL.md) — wrapper سبک برای Agentهایی که از Skill-based instructions پشتیبانی می‌کنند

## استفاده بدون Skill

`prd-template.md` و `authoring-guide.md` را همراه context موجود به AI بدهید.

```text
با استفاده از prd-template.md و authoring-guide.md برای این Product Intent یک PRD بساز.

Context موجود:
[فایل‌ها، noteها، research، screenshotها یا توضیحات موجود]

Intent:
[تغییر یا مسئله موردنظر]

اول یک draft best-effort بساز. اطلاعاتی را که نداریم اختراع نکن و فقط اگر یک Product Decision مهم برای ادامه لازم است سؤال بپرس.
```

## استفاده با Skill

اگر محیط AI شما از Skill-based instructions پشتیبانی می‌کند، پوشه `standalone-prd` را در اختیار Agent قرار دهید. `SKILL.md` فقط Agent را به template و authoring guide هدایت می‌کند و source of truth جداگانه‌ای ایجاد نمی‌کند.

## محدودیت این مسیر

Standalone PRD Kit:

- Current Product Context را خودش تضمین نمی‌کند.
- readiness stateهای Harness مثل `Problem Aligned` را ارزیابی نمی‌کند.
- Design Exploration یا PRD ↔ Design Stress Test را اجرا نمی‌کند.
- جای Product Knowledge یا Product Judgment انسانی را نمی‌گیرد.

برای اجرای کامل Harness از `AGENTS.md` در root repository شروع کنید.
