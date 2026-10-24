# قرارداد پیشنهادی ثبت و نام‌گذاری PRD در GitLab Wiki

> **وضعیت:** پیشنهادی برای بازبینی PM؛ هنوز قرارداد مصوب Harness یا جایگزین مدل فعلی persistence نیست.
>
> این راهنما فقط زمانی کاربرد دارد که برای یک Product Change، GitLab Wiki به‌عنوان محل نگهداری رسمی انتخاب شده باشد. در Pilot فعلی، استفاده از GitLab Wiki در Harness اجباری نیست و مهاجرت Harness به GitLab متوقف است. قواعد عمومی هویت PRD در `artifacts/prd.md` و `shared-harness-contract.md` اولویت دارند.

## ۱. تفکیک هویت، عنوان و مسیر

برای یک PRD سه مفهوم مستقل نگه داشته شود:

| مفهوم | کارکرد | نمونهٔ فرضی |
| --- | --- | --- |
| **Official ID** | هویت یکتا و دائمی PRD | `JV-PRD-00042` |
| **Wiki title** | عنوان قابل فهم برای انسان | `JV-PRD-00042 — غربالگری متقاضیان` |
| **Wiki path** | جایگاه فعلی در سلسله‌مراتب Wiki | `employer/applicant-management/JV-PRD-00042` |

- فرمت ID برای JobVision برابر `JV-PRD-NNNNN` و برای Cando برابر `CND-PRD-NNNNN` است. `NNNNN` پنج رقم است.
- عنوان نمایشی: `<ID> — <عنوان کوتاه و معنادار تغییر محصول>`. عنوان فارسی به‌صورت پیش‌فرض مجاز و مناسب است؛ اصطلاحات canonical محصول حفظ شوند.
- **بخش پایانی Path فقط Official ID باشد**؛ عنوان فارسی/انگلیسی، شمارهٔ نسخه، تاریخ، owner یا نام Feature به آن اضافه نشود.
- در ویرایشگر Wiki، `Title` و `Path` را مستقل تنظیم کنید؛ در صورت فعال‌بودن «Generate page path from title» آن را برای PRD خاموش کنید.
- متن PRD در یک صفحهٔ canonical ذخیره می‌شود. `id` در YAML frontmatter همان Official ID است و H1 متن می‌تواند عنوان انسانی تغییر باشد.
- تغییر عنوان یا انتقال بین شاخه‌ها به‌هیچ‌وجه موجب ایجاد ID جدید نمی‌شود.

## ۲. جایگاه در Wiki

سلسله‌مراتب ناوبری موردنظر:

```text
Product project
└── Area
    └── [Capability / Epic — فقط در صورت نیاز]
        └── <Official ID>  ← یک PRD canonical
```

- Wikiهای **JobVision** و **Cando** در پروژه‌های مجزا نگهداری می‌شوند.
- صفحه‌های Area و Capability/Epic صرفاً برای Navigation و توضیح دامنه‌اند؛ آن‌ها PRD نیستند.
- Capability/Epic یا پوشهٔ خالی فقط به‌خاطر کامل‌کردن سلسله‌مراتب ساخته نشود؛ PRD در نزدیک‌ترین شاخهٔ معنادار قرار می‌گیرد.
- برای یک PRD مرتبط با چند Area، تنها یک صفحهٔ canonical در Area مالک اصلی نگه دارید و از Areaهای دیگر به آن لینک بدهید؛ نسخهٔ دوم نسازید.
- اگر Area مالک یا جایگاه PRD عوض شد، Path و لینک‌های ناوبری را اصلاح کنید، اما ID را حفظ کنید. GitLab از نسخهٔ 17.1 به بعد برای تغییر مسیر Wiki ریدایرکت دارد؛ پیش از اتکا به آن، نسخه و رفتار نمونهٔ داخلی `git.jvoffice.ir` را بررسی کنید. پیوندهای مهم را حتی با وجود ریدایرکت به‌روزرسانی کنید.

مثال فرضی برای JobVision بدون Capability مستقل:

```text
Wiki title:  JV-PRD-00042 — غربالگری متقاضیان
Wiki path:   employer/applicant-management/JV-PRD-00042
YAML id:     JV-PRD-00042
```

## ۳. ثبت شناسه با GitLab Issue

**پیشنهاد اجرای دستی قرارداد قبلاً توافق‌شده:** هر PRD یک Issue ثبت شناسه در پروژهٔ همان محصول دارد. خود GitLab، Project Issue IID را تخصیص می‌دهد؛ Issue، رجیستری هویت است و محتوای canonical PRD در Wiki می‌ماند.

| محصول | پروژهٔ ثبت شناسه | تبدیل شمارهٔ Issue |
| --- | --- | --- |
| JobVision | [product/prd/jobvision](https://git.jvoffice.ir/product/prd/jobvision) | Issue `#42` → `JV-PRD-00042` |
| Cando | [product/prd/cando](https://git.jvoffice.ir/product/prd/cando) | Issue `#17` → `CND-PRD-00017` |

اعداد بالا **نمونه‌اند و شناسهٔ تخصیص‌یافتهٔ واقعی نیستند**. `IID` شمارهٔ داخلی Issue در همان **Project** است، نه شناسهٔ سراسری Issue در GitLab.

فرایند دستی:

1. PM پیش از ثبت رسمی می‌تواند PRD را با `id: unresolved` تهیه و تا `Problem Aligned` پیش ببرد.
2. هنگام Registration، در پروژهٔ GitLab **همان محصول** یک Issue مستقل برای آن Product Change بسازد. از شمارهٔ PRD دیگر یا فهرست صفحات Wiki برای یافتن شمارهٔ بعدی استفاده نکند.
3. بعد از ساخته‌شدن Issue، IID واقعی را با صفرگذاری از چپ تا پنج رقم، به فرمت محصول تبدیل کند. قبل از تخصیص هیچ عنوان یا ID رسمی حدس زده نشود.
4. عنوان Issue را به `<Official ID> — <عنوان انسانی>` به‌روزرسانی کند. این Issue صرفاً سابقهٔ Registration و پیوند به PRD است، نه نسخهٔ دوم محتوای PRD و نه الزاماً تیکت تحویل محصول.
5. Wiki page را با Title و Path قراردادی بسازد یا PRD موجود را ثبت کند؛ `id: unresolved` را با Official ID واقعی جایگزین کند.
6. لینک صفحهٔ canonical Wiki را در Registration Issue درج کند و از صفحهٔ Area/Capability مرتبط به PRD لینک بدهد.
7. تا زمانی که صفحهٔ durable و Official ID معتبر وجود ندارد، آن را current durable PRD برای downstream handoff تلقی نکند.

قواعد پایداری:

- Issue ثبت شناسه بین پروژه‌های محصول جابه‌جا نشود؛ شمارهٔ محلی آن به هویت محصول وابسته است.
- Registration Issue پس از انصراف یا خاتمهٔ PRD حذف/بازیافت نشود؛ می‌توان آن را بست. شمارهٔ مصرف‌شده دوباره تخصیص داده نمی‌شود.
- وجود فاصله در شماره‌ها اشکال نیست؛ شمارهٔ Issue لزوماً شمارندهٔ متوالی PRDهای منتشرشده نیست.
- اگر PRD قدیمی شناسهٔ پایدار دارد، طبق قرارداد Harness آن را خودکار تغییر ندهید؛ migration هویت نیازمند تصمیم صریح و حفظ mapping است.
- اگر IID از پنج رقم فراتر رفت، به‌جای truncate کردن یا تغییر فرمت خودسرانه، قرارداد شناسه باید بازبینی شود.
- GitLab Issue، Wiki و Harness جایگاه‌های متمایزند: **Issue = Registration / Identity؛ Wiki = canonical content؛ Harness = drafting / reconciliation rules.**

## ۴. نمونهٔ صفحهٔ canonical

**Title:** `JV-PRD-00042 — غربالگری متقاضیان` (نمونه)

**Path:** `employer/applicant-management/JV-PRD-00042` (نمونه)

```markdown
---
id: JV-PRD-00042
artifact: prd
owner: unresolved
---

# غربالگری متقاضیان

## Problem
...
```

بخش‌های واقعی PRD و `Harness Pilot Evaluation` باید همچنان طبق قرارداد `artifacts/prd.md` نوشته شوند. متادیتای جدید صرفاً برای تکرار Path، Title، شمارهٔ Issue یا نسخه اضافه نکنید. برای یک Product Change نسخه‌های موازی `v1`/`v2`/`final` نسازید؛ تاریخچه در ذخیره‌ساز canonical بماند.

## ۵. پیش از عملیاتی‌شدن

- پشتیبانی نسخهٔ نصب‌شدهٔ GitLab از جداکردن Title و Path و ریدایرکت Wiki را با یک صفحهٔ آزمایشی بررسی کنید.
- دسترسی PMها برای ساخت Issue و ویرایش Wiki در هر دو پروژه را تأیید کنید.
- تصمیم بگیرید چه زمانی در فرایند دستی Registration انجام شود؛ حداقلِ لازم در Harness: **قبل از downstream handoff**.
- این راهنما را پس از تأیید PM و صحت‌سنجی در GitLab داخلی از حالت «پیشنهادی» خارج کنید.
