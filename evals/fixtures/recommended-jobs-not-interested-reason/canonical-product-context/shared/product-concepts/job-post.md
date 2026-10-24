---
id: shared.job-post
kind: shared-product-concept
title: آگهی شغلی
summary: مفهوم shared Job Post را برای Jobvision Employer و Candidate تعریف می‌کند و رفتارهای product-specific را در Product Areaهای جدا نگه می‌دارد.
status: draft
owner: تیم‌های محصول Jobvision
last_reviewed:
related:
  - jobvision.overview
  - jobvision.employer.job-post-management
  - jobvision.candidate.job-search
  - jobvision.candidate.job-post-experience
  - jobvision.candidate.recommended-jobs
  - shared.application
  - shared.resume
  - shared.company
topics:
  - job-post
  - job-opportunity
  - employer
  - candidate
  - application
---

# آگهی شغلی

## تعریف

Job Post نمایش shared یک فرصت شغلی است که Employer منتشر می‌کند و Candidate آن را کشف، ارزیابی و ممکن است برای آن apply کند.

این سند فقط مالک معنایی است که واقعاً بین محصولات Jobvision shared است. flowها، permissionها، presentation و actionهای product-specific در Product Areaهای مربوط به خودشان می‌مانند.

## چرا مهم است

Job Post دو سمت گروه محصول Jobvision را به هم وصل می‌کند:

```text
Employer یک Job Post می‌سازد و مدیریت می‌کند
-> Candidate آن را کشف و ارزیابی می‌کند
-> Candidate ممکن است apply کند
-> Employer application حاصل را دریافت و مدیریت می‌کند
```

تعریف shared باعث کاهش duplication می‌شود و جلوی توصیف ناسازگار یک مفهوم کسب‌وکاری واحد در مستندات Candidate و Employer را می‌گیرد.

## داده‌ها و attributeهای shared

repo فعلاً فقط تأیید می‌کند که Job Post یک فرصت شغلی است و توسط محصولات Employer و Candidate استفاده می‌شود.

field set canonical هنوز مستند نشده است. فیلدهای محتمل مثل title، company، location، requirements، employment type و publication information نباید تا قبل از review در برابر رفتار محصول و source documentها confirmed فرض شوند.

## Lifecycle مشترک

repo مشخص می‌کند Employerها Job Post منتشر می‌کنند و Candidateها آن را کشف می‌کنند، اما lifecycle کامل shared یا نام دقیق stateها هنوز established نشده است.

مرحله‌های احتمالی مثل draft، published، paused، closed یا expired قبل از مستند شدن به‌عنوان rule فعلی نیاز به owner review دارند.

## قواعد shared

در سطح فعلی تأیید شده است:

- Employer مالک سمت ساخت و مدیریت Job Post است.
- Candidate مالک سمت discovery، understanding و application experience است.
- actionها و permissionهای product-specific نباید در این سند centralized شوند.
- Applicationها action کارجو را به recruiting activity سمت Employer وصل می‌کنند.

قواعد visibility، publication eligibility، ویرایش بعد از publication، closure، expiration و application availability هنوز unknown هستند.

## استفاده در محصولات و Areaها

### Jobvision Employer

`jobvision.employer.job-post-management` مالک ساخت، مدیریت، publication و رفتار status سمت Employer است.

### Jobvision Candidate

`jobvision.candidate.job-post-experience` مالک این است که کارجو چگونه یک Job Post را می‌فهمد و ارزیابی می‌کند و به actionهایی مثل save، share، report یا شروع application دسترسی پیدا می‌کند.

`jobvision.candidate.job-search` مالک جستجو، فیلتر، مرتب‌سازی، saved search و recent search سمت کارجو برای result setهای Job Post است.

`jobvision.candidate.recommended-jobs` مالک فهرست recommendationهای شخصی‌سازی‌شده و سطح‌های preference سمت کارجو است که Job Postها را نمایش می‌دهند.

## مفاهیم shared مرتبط

- `shared.company` مالک هویت shared Company مرتبط با Job Post است.
- `shared.application` مالک record cross-product ایجادشده هنگام apply کارجو روی Job Post است.
- `shared.resume` مالک معنای shared Resume و رابطه آن با Application در صورت کاربرد است.

cardinality دقیق، رفتار historical، snapshotها و synchronization بین این مفاهیم هنوز unknown است.

## Variationهای product-specific

یک Job Post واحد ممکن است در محصولات مختلف متفاوت نمایش داده شود، چون محصولات از کاربران و outcomeهای متفاوت پشتیبانی می‌کنند:

- Employer به کنترل‌های مدیریت، status عملیاتی و context recruiting نیاز دارد.
- Candidate به اطلاعات قابل فهم فرصت و actionهایی مثل save یا apply نیاز دارد.

تفاوت‌های دقیق نیاز به review Product Area دارد.

## Unknownها

- fieldهای canonical shared
- lifecycle shared و نام دقیق stateها
- قواعد visibility و eligibility
- رابطه با Company
- رابطه با Application
- قواعد editing و publication
- رفتار closure، expiration و reopening
- تفاوت فرصت‌های public، private، draft یا restricted

## منابع

- `products/jobvision/overview.md`
- `products/jobvision/employer/overview.md`
- `products/jobvision/candidate/overview.md`
- برای review کامل، evidenceهای Jira، Figma، production، analytics و walkthrough بیشتری لازم است.
