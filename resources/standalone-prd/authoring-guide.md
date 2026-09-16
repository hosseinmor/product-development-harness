# راهنمای نوشتن PRD مستقل

این راهنما برای استفاده همراه `prd-template.md` است و یک workflow کامل Harness نیست.

## قواعد اصلی

- اطلاعاتی را که ندارید اختراع نکنید، مخصوصاً Current Product Behavior، Business Rules، eligibility، permissions و lifecycle.
- Product Intent تصمیم‌گرفته‌شده را از hypothesis، recommendation و assumption جدا نگه دارید.
- PRD را به Design Spec یا Technical Plan تبدیل نکنید.
- هر Product rule یک محل اصلی داشته باشد؛ برای کامل به‌نظر رسیدن آن را در چند section تکرار نکنید.
- بخش‌های optional را اگر محتوای معناداری ندارند حذف کنید.
- اگر context کافی نیست، سؤال‌های کم و materially مهم بپرسید و uncertainty باقی‌مانده را صریح نگه دارید.

## Problem

مسئله یا فرصت اصلی را توضیح دهید؛ نه صرفاً نبود feature.

مثال:

- ضعیف: «کارجو امکان Search with Profile ندارد.»
- بهتر: «کارجو اطلاعات مرتبط با سابقه و ترجیحات شغلی را در پروفایل دارد، اما برای شروع جست‌وجو باید intent را دوباره از صفر بسازد.»

## Affected Users

فقط actorهایی را بیاورید که به‌طور معنادار تحت تأثیر تغییر قرار می‌گیرند. این بخش persona یا journey نیست.

## Current Behavior

فقط current baseline لازم برای فهم تغییر را بنویسید.

اگر current behavior را نمی‌دانید، رفتار محتمل را حدس نزنید. آن را از context موجود verify کنید یا uncertainty را صریح نگه دارید.

## Outcomes

### User Outcome

بگویید چه چیزی برای کاربر بهتر یا ممکن می‌شود؛ feature mechanics را تکرار نکنید.

### Business Outcome

بگویید تغییر چرا برای Product یا Business اهمیت دارد. اگر این outcome مشخص نشده، آن را اختراع نکنید.

### Success Metrics

فقط وقتی metric یا KPI معناداری مشخص شده است. صرفاً برای کامل کردن template عدد نسازید.

## Scope

مرز تغییر را مشخص کنید: چه capability، actor، scenario یا product area داخل یا خارج این تغییر است.

Detailed behavior را به این بخش منتقل نکنید.

## Key Product Scenarios

اختیاری است. فقط زمانی استفاده کنید که یک journey، handoff یا sequence مهم برای فهم Product لازم باشد.

سناریو باید بگوید **چه اتفاقی در Product می‌افتد**، نه اینکه UI دقیقاً چگونه طراحی می‌شود.

## Required Product Behavior

رفتارهای Product را بنویسید: Product چه چیزی را permit، require، prevent، preserve یا cause می‌کند.

می‌تواند شامل eligibility، permissions، Business Rules، state transitions و lifecycle باشد.

مثال:

- Product behavior: «Search with Profile فقط برای پروفایلی قابل اجراست که اطلاعات کافی برای ساخت جست‌وجوی معنادار داشته باشد.»
- Design decision: «CTA بالای صفحه و به‌صورت primary button نمایش داده شود.» — این مورد معمولاً در PRD نیست.

## Dependencies

اختیاری است. فقط dependencyهای مشخص و materially relevant را بیاورید. اگر reference قابل‌اعتمادی ندارید، dependency اختراع نکنید.

## Acceptance Criteria

شرایط observable یا verifiableای را بنویسید که برای درست محقق شدن Product change باید برقرار باشند.

Acceptance Criteria تست‌کیس یا implementation detail نیست.

## Assumptions & Open Decisions

فقط uncertaintyهای materially مهم را نگه دارید:

- assumption قابل برگشت برای ادامه کار
- Product Decision حل‌نشده
- current-product uncertainty مهمی که با context موجود verify نشده

وقتی موردی resolve شد، آن را به section مالک خودش منتقل و از این بخش حذف کنید.

## خارج از PRD

به‌طور پیش‌فرض PRD مالک این موارد نیست:

- layout و visual hierarchy
- component selection و screen structure
- interaction pattern و Design User Flow
- implementation architecture
- API / database design
- test cases
