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

خروجی پیش‌فرض از اولین Draft قابل‌استفاده، **یک فایل Markdown (`.md`) قابل بازکردن در همان محیط (در صورت پشتیبانی ابزار)** است؛ Agent پس از هر پاسخ مهم در Clarification همان فایل را به‌روزرسانی می‌کند. تاریخچه سؤال و پاسخ‌ها در بخش جمع‌شونده `Harness Pilot Evaluation > Clarification Record` داخل **همان فایل** می‌ماند، نه به‌صورت یک گزارش جدا در چت. اگر محیط امکان ساخت یا بازکردن فایل را ندارد، محدودیت باید اعلام شود و Markdown کامل قابل کپی ارائه شود. انتشار در GitLab Wiki همچنان نیازمند اقدام مجزای PM است؛ این Quick Start منبع مستقل قواعد نیست.

[راهنمای ثبت PRD در GitLab Wiki](prd-gitlab-wiki-registration.md) · [Standalone PRD Kit (مسیر مستقل و اختیاری)](standalone-prd/README.md)
