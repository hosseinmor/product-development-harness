# راهنمای نوشتن PRD مستقل

این راهنما برای استفاده همراه `prd-template.md` است و یک workflow کامل Harness نیست.

## قواعد اصلی

- برای PRD جدید، ID اولیه را از تاریخ شمسی + ساعت ۲۴ساعتهٔ ایران تا دقیقه بسازید: `JV-PRD-YYMMDDHHmm` یا `CND-PRD-YYMMDDHHmm`، با ارقام لاتین. مثال فرضی: `CND-PRD-0604081437` برای ۱۴۰۶/۰۴/۰۸ ساعت ۱۴:۳۷. اگر ساعت یا تاریخ دقیق در دسترس نیست، `id: unresolved` و زمان را از PM بخواهید؛ هرگز زمان را حدس نزنید. نیازی به registry یا شماره GitLab Issue نیست. بعد از ثبت، ID را تغییر ندهید مگر با identity migration صریح؛ برخورد احتمالی را پیش از انتشار حل کنید.
- برای انتشار در GitLab Wiki، یک `wiki_path` با مسیر کامل `parent/<ID>-<short-english-kebab-title>` در همان Frontmatter ذخیره کنید؛ حوزه مالک را از Knowledge تعیین کنید، اما **Parent انتشار را با همان حروف کوچک و بزرگ مسیر موجود GitLab Wiki** به دست آورید؛ `ats` و `ATS` قابل جابه‌جایی نیستند. اگر والد موجود تأیید نشده، `wiki_path: unresolved` تا تأیید مسیر دقیق یا اجازه صریح برای شاخه جدید؛ مسیر مشابه و حدسی نسازید. هنگام تحویل PRD **فقط** `GitLab Wiki Path` (مسیر کامل و بدون `.md`) را خارج از متن PRD نمایش دهید؛ عنوان صفحه از Heading سند گرفته می‌شود. `Generate page path from title` در GitLab خاموش شود.
- اول یک draft best-effort بسازید؛ PRD را به questionnaire تبدیل نکنید.
- اطلاعاتی را که ندارید اختراع نکنید، مخصوصاً Current Product Behavior، Outcomes، Business Rules، eligibility، permissions و lifecycle.
- جمله روشن PM که یک Product choice را تعیین می‌کند، تصمیم Product است. مثال، سؤال، پیشنهاد موقت، hypothesis یا UI preference را خودکار به requirement تبدیل نکنید.
- Product Intent تصمیم‌گرفته‌شده را از hypothesis، recommendation، assumption و Open Decision جدا نگه دارید.
- PRD را به Design Spec یا Technical Plan تبدیل نکنید.
- هر Product rule یک محل اصلی داشته باشد؛ برای کامل به‌نظر رسیدن آن را در چند section تکرار نکنید.
- بخش‌های optional را اگر محتوای معناداری ندارند حذف کنید.
- اگر canonical Product Knowledge صفحهٔ materially relevant مشخصی برای grounding یا retrieval بعدی دارید، آن را فقط در frontmatter `references` با `source + page` ثبت کنید. فیلد `page` فقط نام/Slug واقعی همان صفحه است (مثلاً `entity-candidate` اگر واقعاً نام آن صفحه باشد)، نه URL، لینک Markdown، مسیر مرورگر یا Breadcrumb. نام/ID اختراع نکنید.
- اگر context کافی نیست، فقط سؤال‌های materially لازم را بپرسید و uncertainty باقی‌مانده را صریح نگه دارید.

## شیوه نوشتن

- متن بدنه PRDهای Job Vision را به‌صورت پیش‌فرض فارسی بنویسید، مگر اینکه کاربر زبان دیگری بخواهد. **همه عنوان‌های سکشن و زیرسکشن Markdown (`##` تا `######`) باید انگلیسی باشند** و عنوان‌های استاندارد Template مثل `Problem`، `Current Behavior` و `Required Product Behavior` عیناً حفظ شوند. عنوان اصلی سند (`#`) می‌تواند فارسی باشد؛ زیرعنوان‌های جدید سناریوها و رفتارها نیز باید انگلیسی باشند.
- از terminology موجود در context استفاده کنید و برای یک مفهوم نام‌های جایگزین نسازید.
- لحن مستقیم، خنثی و Product-oriented باشد.
- reasoning داخلی AI، روایت approval یا گفت‌وگوی تولید سند را داخل PRD نیاورید.

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

اگر Business Outcome مشخص نشده، business value را اختراع نکنید. اگر از Intent، مسئله، evidence یا context مبنای معقولی وجود دارد، چند candidate غیرقطعی پیشنهاد دهید، در صورت امکان یکی را کوتاه recommend کنید و از مسئول Product بخواهید آن را تأیید، اصلاح یا رد کند. یک PRD نهایی که برای downstream handoff استفاده می‌شود نباید Business Outcome تعیین‌نشده، assumed یا صرفاً AI-recommended داشته باشد. این قاعده در standalone به معنی ادعای readiness stateهای Harness مثل `Problem Aligned` نیست.

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

## Product Knowledge references

این بخش در body PRD وجود ندارد. اگر یک صفحهٔ canonical Product Knowledge واقعاً برای grounding یا retrieval بعدی materially useful است، فقط در YAML frontmatter ثبتش کنید:

```yaml
references:
  - source: jobvision_product_knowledge
    page: entity-candidate
```

`source` باید کلید source معتبر باشد و `page` فقط نام واقعی و بدون قالب‌بندیِ صفحه در همان Source باشد. مثال `entity-candidate` فقط قالب نام‌گذاری را نشان می‌دهد؛ در PRD واقعی تنها پس از تأیید وجود همان صفحه استفاده شود. از URL، Markdown link، Breadcrumb، bibliography همهٔ صفحات خوانده‌شده یا dependency توضیحی داخل body استفاده نکنید. رابطه‌ها و consequenceهای Product را در Scope، Key Product Scenarios یا Required Product Behavior بنویسید.

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
