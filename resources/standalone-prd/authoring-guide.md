# راهنمای نوشتن PRD مستقل

این راهنما برای استفاده همراه `prd-template.md` است و یک workflow کامل Harness نیست.

## قواعد اصلی

- اول یک draft best-effort بسازید؛ PRD را به questionnaire تبدیل نکنید.
- اطلاعاتی را که ندارید اختراع نکنید، مخصوصاً Current Product Behavior، Outcomes، Business Rules، eligibility، permissions و lifecycle.
- جمله روشن PM که یک Product choice را تعیین می‌کند، تصمیم Product است. مثال، سؤال، پیشنهاد موقت، hypothesis یا UI preference را خودکار به requirement تبدیل نکنید.
- Product Intent تصمیم‌گرفته‌شده را از hypothesis، recommendation، assumption و Open Decision جدا نگه دارید.
- PRD را به Design Spec یا Technical Plan تبدیل نکنید.
- هر Product rule یک محل اصلی داشته باشد؛ برای کامل به‌نظر رسیدن آن را در چند section تکرار نکنید.
- بخش‌های optional را اگر محتوای معناداری ندارند حذف کنید.
- اگر context کافی نیست، فقط سؤال‌های materially لازم را بپرسید و uncertainty باقی‌مانده را صریح نگه دارید.

## Problem

مسئله یا فرصت اصلی را توضیح دهید؛ نه صرفاً نبود feature.

اگر Intent فقط solution را بیان می‌کند و Problem از context قابل استنتاج معتبر نیست، Problem را اختراع نکنید. می‌توانید یک framing پیشنهادی ارائه کنید، اما باید مشخص باشد که هنوز Product Intent قطعی نیست.

مثال:

- ضعیف: «کارجو امکان Search with Profile ندارد.»
- بهتر، وقتی context آن را پشتیبانی می‌کند: «کارجو اطلاعات مرتبط با سابقه و ترجیحات شغلی را در پروفایل دارد، اما برای شروع جست‌وجو باید intent را دوباره از صفر بسازد.»

## Affected Users

فقط actorهایی را بیاورید که از Intent یا context به‌طور معنادار مشخص‌اند. این بخش persona یا journey نیست.

## Current Behavior

فقط current baseline لازم برای فهم تغییر را بنویسید.

اگر current behavior را نمی‌دانید:
- رفتار محتمل را حدس نزنید.
- اگر برای فهم PRD materially لازم است، بنویسید که نیازمند verification است.
- اگر برای این draft لازم نیست، از اضافه کردن boilerplate صرفاً برای پر کردن section خودداری کنید.

## Outcomes

### User Outcome

بگویید چه چیزی برای کاربر بهتر یا ممکن می‌شود؛ feature mechanics را به outcome تبدیل نکنید.

اگر User Outcome از Intent یا context مشخص نیست، benefit محتمل اختراع نکنید. در صورت material بودن، آن را به‌عنوان تصمیم نیازمند clarification نگه دارید.

### Business Outcome

بگویید تغییر چرا برای Product یا Business اهمیت دارد.

اگر Business Outcome مشخص نشده، صریحاً آن را «تعیین‌نشده» نگه دارید یا اگر برای تصمیم فعلی ضروری نیست، از ساختن rationale مصنوعی خودداری کنید. نبود Business Outcome به‌تنهایی نباید به یک Product Decision جدید تبدیل شود مگر اینکه downstream واقعاً به آن وابسته باشد.

### Success Metrics

اختیاری است. فقط وقتی metric یا KPI معناداری مشخص شده است. صرفاً برای کامل کردن template عدد نسازید.

## Scope

مرز تغییر را مشخص کنید: چه capability، actor، scenario یا product area داخل یا خارج این تغییر است.

Detailed behavior را به این بخش منتقل نکنید و از Intent بیش از چیزی که واقعاً establish شده scope نسازید.

## Key Product Scenarios

اختیاری است. فقط زمانی استفاده کنید که یک journey، handoff یا sequence مهم برای فهم Product لازم باشد.

سناریو باید بگوید **چه اتفاقی در Product می‌افتد**، نه اینکه UI دقیقاً چگونه طراحی می‌شود.

## Required Product Behavior

رفتارهای Product را بنویسید: Product چه چیزی را permit، require، prevent، preserve یا cause می‌کند.

می‌تواند شامل eligibility، permissions، Business Rules، state transitions و lifecycle باشد؛ فقط وقتی از Intent/context establish شده‌اند یا نتیجه منطقی ضروری یک تصمیم established هستند.

مثال:

- Product behavior: «Search with Profile فقط برای پروفایلی قابل اجراست که اطلاعات کافی برای ساخت جست‌وجوی معنادار داشته باشد.»
- Design decision: «CTA بالای صفحه و به‌صورت primary button نمایش داده شود.» — این مورد معمولاً در PRD نیست.

## Dependencies

اختیاری است. فقط dependencyهای مشخص و materially relevant را بیاورید. اگر reference قابل‌اعتمادی ندارید، dependency اختراع نکنید.

## Acceptance Criteria

شرایط observable یا verifiableای را بنویسید که برای درست محقق شدن Product change باید برقرار باشند.

Acceptance Criteria:
- باید از Product Intent تصمیم‌گرفته‌شده یا consequence منطقی ضروری آن بیاید.
- نباید assumption یا Product Decision حل‌نشده را به requirement تبدیل کند.
- تست‌کیس یا implementation detail نیست.

## Assumptions & Open Decisions

فقط uncertaintyهای materially مهم را نگه دارید:

- assumption قابل برگشت برای ادامه کار
- Product Decision حل‌نشده
- current-product uncertainty مهمی که با context موجود verify نشده

هر unknown را به این بخش نریزید. مسئله technical، fact قابل retrieval یا detail کم‌اثر الزاماً Open Decision نیست.

وقتی موردی resolve شد، آن را به section مالک خودش منتقل و از این بخش حذف کنید.

## خارج از PRD

به‌طور پیش‌فرض PRD مالک این موارد نیست:

- layout و visual hierarchy
- component selection و screen structure
- interaction pattern و Design User Flow
- implementation architecture
- API / database design
- test cases
