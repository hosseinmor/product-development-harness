# PM Quick Start

برای ساخت یا ادامهٔ PRD، این متن را در ChatGPT، Claude یا یک Agent دیگر استفاده کنید:

```text
برای درخواست زیر با Job Vision Product Development Harness یک PRD تهیه کن.

https://github.com/hosseinmor/product-development-harness/blob/main/AGENTS.md

Intent:
[مسئله یا تغییر موردنظر]
```

برای **ادامهٔ PRD موجود**، این دو خط را به انتها اضافه کنید:

```text
Current PRD:
[لینک یا فایل PRD فعلی]
```

Agent ابتدا دسترسی به Harness را بررسی می‌کند، سپس محصول پیشنهادی را برای تأیید شما مطرح می‌کند. **لازم نیست نام محصول، لینک Knowledge، روش دسترسی به مرورگر یا دستورهای Workflow را در Prompt بنویسید.** اگر نمی‌تواند فایل‌های ضروری Harness را بخواند، باید اجرا را متوقف کند. روش خواندن مستقیم GitHub یا Clone، وابسته به امکانات محیط است.

خروجی پیش‌فرض یک فایل `.md` به‌روز است که در محیط‌های پشتیبانی‌کننده با **Preview خوانا و فقط‌خواندنی** نمایش داده می‌شود؛ در هر Clarification همان فایل تغییر می‌کند. PM برای بازبینی نیازی به ویرایش Markdown ندارد. هنگام تحویل نهایی، Agent **هم لینک همان فایل و هم کل Markdown خام یکسان با آن را در یک بلوک کد** ارائه می‌کند و صریح می‌گوید: «برای دیدن PRD روی لینک فایل کلیک کن؛ برای کپی Markdown از دکمهٔ کپی بلوک کد استفاده کن»؛ اگر دکمه وجود نداشت، متن بلوک را انتخاب و کپی کنید. بلوک باید Frontmatter، Headingها، جدول‌ها و `Harness Pilot Evaluation > Clarification Record` را هم داشته باشد تا مستقیماً در **ویرایشگر Markdown/Source گیت‌لب** Paste شود. **GitLab Wiki Path** جداست. اگر محیط Preview یا لینک فایل ندارد، Agent باید محدودیت را بگوید و قابلیت‌های موجود را دقیق معرفی کند. Agent برای ساخت PRD جدید سراغ PRDهای قدیمی GitLab نمی‌رود و مسیر انتشار را از مسیر حوزهٔ مالک در Product Knowledge می‌سازد. انتشار در GitLab همچنان دستی و مستقل است.

[راهنمای ثبت PRD در GitLab Wiki](prd-gitlab-wiki-registration.md) · [Standalone PRD Kit (مسیر مستقل و اختیاری)](standalone-prd/README.md)
