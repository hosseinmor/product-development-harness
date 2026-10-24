---
id: jobvision.candidate.recommended-jobs
kind: product-area
group: jobvision
product: candidate
title: شغل‌های پیشنهادی و ترجیحات
summary: شغل‌های پیشنهادی شخصی‌سازی‌شده، خلاصه ترجیحات، ویرایش ترجیحات و تنظیمات اعلان مرتبط را توضیح می‌دهد.
status: draft
owner: تیم محصول کارجو
last_reviewed:
related:
  - jobvision.candidate.overview
  - shared.job-post
  - jobvision.candidate.job-search
  - jobvision.candidate.job-post-experience
topics:
  - recommended-jobs
  - personalization
  - preferences
  - notifications
  - save-job
  - apply
  - candidate
---

# شغل‌های پیشنهادی و ترجیحات

## نمای کلی

این Product Area تجربه سمت کارجو برای فهرست‌های شغلی شخصی‌سازی‌شده، ترجیحات شغلی کارجو و اعلان‌های مرتبط با recommendation را پوشش می‌دهد.

این نسخه بر اساس evidence پذیرفته‌شده walkthroughها برای prototype فعلی نوشته شده و تا تأیید منطق recommendation و معنای ترجیحات در وضعیت `draft` می‌ماند.

## چرا این Area وجود دارد

- نمایش Job Postهایی که ممکن است با علاقه یا احتمال موفقیت کارجو هماهنگ باشند
- کمک به کارجو برای فهمیدن و ویرایش ورودی‌هایی که روی recommendation اثر می‌گذارند
- فراهم کردن actionهای سریع مثل ذخیره یا apply از کارت‌های recommendation
- اتصال notificationهای recommendation به تنظیمات کارجو

## کاربران و نقش‌ها

- کارجوی واردشده که recommendation شخصی‌سازی‌شده دریافت می‌کند
- کارجویی که ترجیحات شغلی را مرور یا ویرایش می‌کند
- کارجویی که ترجیحات notification را مدیریت می‌کند

رفتار کاربر واردنشده و حساب تازه هنوز نیاز به بررسی دارد.

## خروجی‌های کاربر

- مرور Job Postهای پیشنهادی
- جابه‌جایی یا فهم modeهای recommendation در صورت وجود
- ذخیره یا apply روی آگهی پیشنهادی
- مرتب‌سازی یا صفحه‌بندی فهرست‌های recommendation
- مرور خلاصه ترجیحات فعلی
- ویرایش ترجیحات و تنظیمات notification مرتبط

## نقاط ورود

نقاط ورود مشاهده‌شده یا محتمل:

- بخش‌های recommendation در homepage کارجو
- مقصد recommended jobs
- خلاصه ترجیحات یا action ویرایش
- onboarding contextual یا جریان ویرایش preference
- prompt notification
- تنظیمات notification

مجموعه کامل deep linkها، campaign linkها و empty stateها هنوز مستند نشده است.

## مفاهیم اصلی

### شغل پیشنهادی

Job Postی که محصول برای کارجو انتخاب و نمایش می‌دهد. دلیل recommendation و منطق ranking هنوز مستند نشده است.

### Mode پیشنهاد

گروه‌بندی یا حالت مشاهده‌شده برای opportunityهای پیشنهادی. Evidence نشان‌دهنده recommendation بر اساس علاقه و recommendation با شانس استخدام بالاتر بود.

### ترجیحات شغلی کارجو

ورودی‌های مستقیم یا inferred که برای شخصی‌سازی discovery استفاده می‌شوند. گروه‌های مشاهده‌شده در خلاصه ترجیحات شامل استان‌ها، حوزه‌های شغلی، نوع همکاری و ترجیح دورکاری بود.

### اعلان recommendation

کنترل notification متصل به شغل‌های پیشنهادی یا alertهای مبتنی بر ترجیحات. معنای دقیق delivery نیاز به review دارد.

## جریان‌های اصلی

### مرور recommendationها

1. کارجو نقطه ورود recommendation را باز می‌کند.
2. محصول یک یا چند فهرست یا mode پیشنهادی را نشان می‌دهد.
3. هر کارت Job Post اطلاعات خلاصه و actionهای مرتبط را ارائه می‌کند.
4. کارجو می‌تواند ذخیره کند، apply کند، جزئیات را باز کند، sort کند یا صفحه‌بندی کند.

رفتار save برای یک Job Post منفرد متعلق به Job Details & Evaluation است. submission و tracking application متعلق به Application Management است.

### مرور و ویرایش ترجیحات

1. کارجو خلاصه ترجیحات را باز می‌کند.
2. محصول گروه‌های ترجیح فعلی را نشان می‌دهد.
3. کارجو ویرایش ترجیحات را انتخاب می‌کند.
4. محصول ممکن است کارجو را وارد onboarding contextual یا flow ویرایش preference کند.
5. ترجیحات به‌روزشده روی recommendationهای آینده اثر می‌گذارند.

در اولین ویرایش مشاهده‌شده، کارجو وارد جریانی شبیه onboarding contextual شد. همیشگی بودن این رفتار نیاز به بررسی دارد.

### مدیریت notificationهای recommendation

1. محصول prompt یا تنظیمات notification مربوط به recommendation/preference را نشان می‌دهد.
2. کارجو notification را فعال، غیرفعال یا ویرایش می‌کند.
3. وضعیت notification در prompt یا settings مربوطه منعکس می‌شود.

کانال ارسال، cadence و رابطه با Saved Searches هنوز نامشخص است.

## قواعد

- کارت‌های Recommended Job روی Job Postهای تعریف‌شده در `shared.job-post` عمل می‌کنند.
- recommendation رفتار Candidate-specific است و نباید قواعد shared Job Post را تعریف کند.
- modeهای مشاهده‌شده شامل پیشنهاد بر اساس علاقه و پیشنهاد با شانس استخدام بالاتر است.
- خلاصه ترجیحات می‌تواند شامل استان‌ها، حوزه‌های شغلی، نوع همکاری و ترجیح دورکاری باشد.
- ذخیره یک Job Post پیشنهادی از رفتار save سمت کارجو در Job Details & Evaluation پیروی می‌کند.
- apply از recommendation به رفتار application سمت کارجو وصل می‌شود.

این قواعد evidence مربوط به prototype هستند و نیاز به review مالک محصول دارند.

## دسترسی‌ها

تفاوت‌های محتمل یا مشاهده‌شده:

- recommendationها به context کارجوی واردشده نیاز دارند.
- ویرایش preference ممکن است به پروفایل کارجو وابسته باشد.
- تنظیمات notification ممکن است به کانال تماس verified نیاز داشته باشد.
- بعضی modeهای recommendation ممکن است به کفایت داده، eligibility یا release state وابسته باشند.

## وضعیت‌ها و گذارها

وضعیت‌های مشاهده‌شده recommendation:

```text
recommendation در دسترس است
-> کارجو sort یا pagination انجام می‌دهد
-> فهرست recommendation به‌روزشده
```

وضعیت‌های مشاهده‌شده preference:

```text
خلاصه preference در دسترس است
-> ویرایش preference
-> جریان ویرایش یا onboarding preference
-> preference به‌روزشده
```

Loading، empty، stale و failure stateها هنوز مستند نشده‌اند.

## اعتبارسنجی‌ها

اعتبارسنجی‌های محتمل:

- استان‌ها و حوزه‌های شغلی پشتیبانی‌شده
- option set نوع همکاری و دورکاری
- ترجیحات الزامی برای eligibility recommendation
- دسترسی به کانال notification
- انتخاب‌های duplicate یا متناقض

## حالت‌های مرزی

- نبود recommendation
- ناکافی بودن داده پروفایل یا preference
- بسته، منقضی یا قبلاً applied بودن Job Post پیشنهادی
- تغییر preference هنگام مشاهده recommendation
- تعارض prompt notification با تنظیمات کلی
- بدون نتیجه شدن sort یا pagination
- نبود یا نامشخص بودن دلیل recommendation

## Product Areaهای مرتبط

- Job Search
- Job Details & Evaluation
- Application Management
- Resume Management

## Variationهای شناخته‌شده

- modeهای recommendation ممکن است بر اساس داده کارجو و release فرق کنند.
- entry ویرایش preference ممکن است بین homepage، settings و onboarding متفاوت باشد.
- کنترل‌های notification ممکن است در prompt یا settings ظاهر شوند.
- نمایش desktop و mobile ممکن است متفاوت باشد.

## Unknownها و رفتارهای تست‌نشده

- منطق ranking recommendation
- معنای دقیق recommendation با شانس استخدام بالا
- AI بودن، rule-based بودن یا hybrid بودن recommendation
- داده‌های لازم کارجو برای هر mode
- رفتار empty state و cold start
- persistence ترجیحات و رفتار cross-device
- کانال‌ها، cadence و قواعد opt-out برای notification
- رابطه recommendation با Saved Searches و job alertها
- accessibility و رفتار keyboard

## منابع

- `product-walkthrough/walkthroughs/products/jobvision/candidate/WT-2026-004/evidence.md` (برای reconciliation prototype به‌عنوان accepted در نظر گرفته شده است)
