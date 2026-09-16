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

## نصب Skill

پوشه `standalone-prd` را به‌صورت ZIP بسته‌بندی کنید؛ `SKILL.md` و فایل‌های همراه آن باید داخل همان پوشه باقی بمانند.

### ChatGPT

در ChatGPT:

`Plugins → Skills → Create → Upload from your computer`

فایل ZIP را upload و Skill را install کنید. بعد از نصب، ChatGPT می‌تواند در taskهای مرتبط آن را خودکار استفاده کند یا می‌توانید Skill را صریحاً انتخاب کنید.

> دسترسی به Skills به plan و تنظیمات workspace بستگی دارد.

### Claude

در Claude ابتدا مطمئن شوید **Code execution and file creation** فعال است، سپس:

`Customize → Skills → + → Create skill → Upload a skill`

فایل ZIP را upload و Skill را فعال کنید. Claude پس از آن می‌تواند در taskهای مرتبط Skill را خودکار استفاده کند.

> در Team و Enterprise ممکن است دسترسی یا انتشار Skill توسط تنظیمات organization کنترل شود.

## محدودیت این مسیر

Standalone PRD Kit:

- Current Product Context را خودش تضمین نمی‌کند.
- readiness stateهای Harness مثل `Problem Aligned` را ارزیابی نمی‌کند.
- Design Exploration یا PRD ↔ Design Stress Test را اجرا نمی‌کند.
- جای Product Knowledge یا Product Judgment انسانی را نمی‌گیرد.

برای اجرای کامل Harness از `AGENTS.md` در root repository شروع کنید.


## نگهداری

این Kit در زمان اجرا به Harness وابسته نیست، اما semantics آن باید با PRD Artifact Contract هم‌راستا بماند. اگر `artifacts/prd.md` materially تغییر کرد، maintainers باید `authoring-guide.md`، `prd-template.md` و در صورت نیاز `SKILL.md` را بازبینی کنند.

`artifacts/prd.md` source of truth اصلی semantics PRD در repository است؛ Standalone Kit یک نسخه سبک برای استفاده خارج از Harness است.
