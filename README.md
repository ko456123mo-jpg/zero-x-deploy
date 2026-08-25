# 🎯 ZERO-X: Intelligent Penetration Testing Platform

![ZERO-X Platform](https://img.shields.io/badge/Platform-ZERO--X-06b6d4?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Convex](https://img.shields.io/badge/Backend-Convex-purple?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> منصة اختبار اختراق ذكية تعتمد على وكلاء الذكاء الاصطناعي المتعددين لأتمتة دورة الهجوم الكاملة (Kill Chain) من الاستطلاع حتى التقرير.

## 🚀 الميزات الرئيسية

### 🤖 نظام الوكلاء المتعددين
- **Orchestrator**: المشرف الرئيسي - ينسق جميع الوكلاء
- **Planner**: يضع خطة الهجوم الشاملة
- **Recon**: يجمع المعلومات عبر أدوات المسح
- **Exploitation**: يستغل الثغرات المكتشفة
- **Post-Exploitation**: يستكشف النظام المخترق
- **Reporting**: يولد التقارير الاحترافية

### 🔒 بيئة الساندبوكس (E2B)
- عزل على مستوى الأجهزة باستخدام Firecracker microVMs
- تنفيذ آمن لجميع أدوات الاختبار
- دعم Nmap، SQLMap، Metasploit، وغيرها

### ⚡ استغلال Zero-Click
- وحدة adbHijacker للاستغلال Android
- CVE-2026-0073: ADB TLS Authentication Bypass
- ماسح شبكات لاكتشاف الأجهزة الضعيفة

### 📊 تقارير احترافية
- تصدير PDF مع تصميم احترافي
- تصدير HTML قابل للمشاركة
- ملخص تنفيذي للمديرين
- تفاصيل تقنية للمطورين

## 📋 المتطلبات

| المتطلب | الإصدار | الوصف |
|---------|---------|-------|
| Node.js | 18+ | بيئة التشغيل |
| npm | 9+ | مدير الحزم |
| Convex CLI | Latest | لقاعدة البيانات |
| E2B API Key | اختياري | للتنفيذ الحقيقي |
| OpenAI API Key | اختياري | للذكاء الاصطناعي |

## 🛠️ التثبيت

### 1. استنساخ المشروع

```bash
git clone https://github.com/your-org/zero-x.git
cd zero-x
```

### 2. تثبيت الحزم

```bash
npm install
```

### 3. إعداد متغيرات البيئة

```bash
# نسخ ملف البيئة
cp .env.example .env.local

# أو إنشاء ملف جديد
cat > .env.local << 'EOF'
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
E2B_API_KEY=your_e2b_api_key_here
OPENAI_API_KEY=sk-your_openai_api_key_here
EOF
```

### 4. تشغيل Convex محلياً

```bash
# في terminal منفصل
npx convex dev
```

### 5. تشغيل الخادم

```bash
npm run dev
```

### 6. فتح التطبيق

```
http://localhost:3000
```

## 🔑 إعداد مفاتيح API

### E2B Sandbox (للتنفيذ الحقيقي)

1. سجل في [E2B](https://e2b.dev/)
2. احصل على API Key من لوحة التحكم
3. أضفه في `.env.local`:

```env
E2B_API_KEY=your_e2b_api_key_here
```

**بدون هذا المفتاح**: يعمل النظام في وضع Demo مع استجابات محاكاة

### OpenAI (للذكاء الاصطناعي)

1. احصل على مفتاح من [OpenAI Platform](https://platform.openai.com/)
2. أضفه في `.env.local`:

```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

**بدون هذا المفتاح**: يستخدم النظام قوالب استجابات معرفة مسبقاً

### OAuth (اختياري)

#### Google OAuth
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد
3. فعّل Google+ API
4. أنشئ OAuth 2.0 Client ID
5. أضف في `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

#### GitHub OAuth
1. اذهب إلى [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/auth/callback/github`
5. أضف في `.env.local`:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

## 📁 هيكل المشروع

```
zero-x/
├── app/                          # صفحات Next.js
│   ├── (auth)/                  # صفحات المصادقة
│   │   ├── login/page.tsx      # تسجيل الدخول
│   │   └── register/page.tsx    # التسجيل
│   ├── dashboard/page.tsx       # لوحة التحكم
│   ├── project/[id]/page.tsx   # War Room
│   └── reports/page.tsx         # التقارير
├── convex/                       # Backend
│   ├── auth.ts                  # المصادقة
│   ├── schema.ts                # هيكل قاعدة البيانات
│   └── functions/               # Serverless functions
│       ├── projects.ts          # إدارة المشاريع
│       ├── sessions.ts          # إدارة الجلسات
│       └── exploits.ts          # تنفيذ الاستغلال
├── lib/
│   ├── agents/                  # وكلاء الذكاء الاصطناعي
│   │   ├── orchestrator.ts     # المشرف الرئيسي
│   │   └── simulator.ts        # المحاكاة والـ Prompts
│   ├── e2b/                    # E2B Sandbox
│   │   └── index.ts           # التكامل
│   └── exploits/                # أدوات الاستغلال
│       └── adbHijacker/       # CVE-2026-0073
│           ├── adb_tls_auth_bypass.py
│           └── scanner.py
├── .env.local                   # متغيرات البيئة
├── SPEC.md                      # المواصفات التقنية
└── README.md                    # هذا الملف
```

## 🎮 الاستخدام

### إنشاء مشروع جديد

1. سجل الدخول أو أنشئ حساب جديد
2. اذهب إلى Dashboard
3. اضغط "New Project"
4. أدخل الهدف (IP، URL، أو نطاق)
5. حدد النطاق المسموح

### War Room (غرفة العمليات)

1. افتح المشروع من Dashboard
2. اقرأ ووافق على الإقرار القانوني
3. راجع خطة الهجوم من Planner
4. اضغط "Approve Plan" لبدء الاختبار
5. شاهد الوكلاء يعملون في الوقت الحقيقي
6. راجع الثغرات المكتشفة في لوحة Findings

### التقارير

1. اذهب إلى صفحة Reports
2. اختر التقرير المطلوب
3. اضغط "PDF" أو "HTML" للتصدير
4. شارك التقرير مع الفريق

## 🔧 أدوات الاختبار المدعومة

| الأداة | الوظيفة | الوضع |
|--------|---------|-------|
| Nmap | مسح الشبكات | ✅ |
| SQLMap | اختبار SQL Injection | ✅ |
| SearchSploit | البحث عن الثغرات | ✅ |
| Metasploit | الاستغلال | محضر |
| Burp Suite | تحليل الويب | محضر |
| Frida | تحليل التطبيقات | محضر |

## ⚡ استغلال Zero-Click

### adbHijacker (CVE-2026-0073)

```bash
# تشغيل الماسح
python3 lib/exploits/adbHijacker/scanner.py --network 192.168.1.0/24

# تشغيل الاستغلال
python3 lib/exploits/adbHijacker/adb_tls_auth_bypass.py --target 192.168.1.100
```

### الدمج مع الوكلاء

الوكيل يستطيع استدعاء أداة `exploitAndroidAdb` عند اكتشاف أجهزة Android في الشبكة.

## 🐛 استكشاف الأخطاء وإصلاحها

### ❌ خطأ: "E2B_API_KEY is not configured"

**السبب**: لم يتم تعيين مفتاح E2B

**الحل**:
```bash
# 1. احصل على مفتاح من https://e2b.dev/
# 2. أضفه في .env.local
echo "E2B_API_KEY=your_key_here" >> .env.local

# 3. أعد تشغيل الخادم
npm run dev
```

**البديل**: النظام يعمل في وضع Demo بدون المفتاح

---

### ❌ خطأ: "OPENAI_API_KEY is not configured"

**السبب**: لم يتم تعيين مفتاح OpenAI

**الحل**:
```bash
# 1. احصل على مفتاح من https://platform.openai.com/
# 2. أضفه في .env.local
echo "OPENAI_API_KEY=sk-your_key_here" >> .env.local

# 3. أعد تشغيل الخادم
npm run dev
```

**البديل**: النظام يستخدم قوالب محاكاة للردود

---

### ❌ خطأ: "Failed to connect to Convex"

**السبب**: Convex CLI لا يعمل

**الحل**:
```bash
# 1. تأكد من تشغيل Convex
npx convex dev

# 2. أو أعد تشغيله
pkill -f "convex"
npx convex dev

# 3. تحقق من الملف
cat .env.local | grep CONVEX
```

---

### ❌ خطأ: "Sandbox creation failed"

**السبب**: مشكلة في اتصال E2B

**الحلول**:
```bash
# 1. تحقق من صحة المفتاح
echo $E2B_API_KEY

# 2. تحقق من الاتصال
curl -H "Authorization: Bearer $E2B_API_KEY" https://api.e2b.dev/api/v1/sandboxes

# 3. تحقق من الرصيد
# رصيد E2B قد يكون مستهلك
```

---

### ❌ خطأ: "Module not found"

**السبب**: حزم مفقودة

**الحل**:
```bash
# 1. أعد تثبيت الحزم
rm -rf node_modules package-lock.json
npm install

# 2. تأكد من وجود jsPDF
npm ls jspdf
```

---

### ❌ خطأ: TypeScript compilation errors

**السبب**: إصدار TypeScript قديم أو إعدادات خاطئة

**الحل**:
```bash
# 1. تأكد من إصدار TypeScript
npm ls typescript

# 2. حدّث TypeScript
npm update typescript

# 3. نظف الكاش وأعد البناء
rm -rf .next
npm run build
```

---

### ❌ خطأ: "Connection timeout" أثناء المسح

**السبب**: الهدف لا يستجيب أو خطأ في الشبكة

**الحل**:
```bash
# 1. تحقق من صحة الهدف
ping -c 3 target.com

# 2. تحقق من فتح المنافذ
nmap -p 22,80,443 target.com

# 3. جرب目標 آخر للاختبار
```

---

### ❌ خطأ: Certificate SSL في OAuth

**السبب**: إعدادات OAuth غير صحيحة

**الحل**:
```bash
# 1. تأكد من URLs في Google/GitHub Console:
#    Homepage URL: http://localhost:3000
#    Callback URL: http://localhost:3000/auth/callback/google

# 2. تأكد من تطابق URLs مع .env.local
#    NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### ❌ خطأ: PDF لا يتم تحميله

**السبب**: مشكلة في jsPDF

**الحل**:
```bash
# 1. تأكد من تثبيت jsPDF
npm ls jspdf

# 2. أعد تثبيت
npm uninstall jspdf jspdf-autotable
npm install jspdf jspdf-autotable

# 3. امسح الكاش
rm -rf .next
npm run build
```

---

### ❌ خطأ: Session expired

**السبب**: انتهاء صلاحية الجلسة

**الحل**:
```bash
# 1. امسح localStorage
localStorage.clear()

# 2. أو احذف ملفات الكوكيز
```

---

## 🔒 الأمان

### تحذيرات مهمة

⚠️ **الاستخدام غير المصرح به غير قانوني**
- تأكد دائماً من وجود تصريح كتابي للاختبار
- وثّق نطاق الاختبار قبل البدء
- التزم بالنطاق المحدد فقط

### مميزات الأمان

- ✅ عزل كامل في بيئة E2B
- ✅ سجل تدقيق (Audit Log) غير قابل للتعديل
- ✅ إقرار قانوني قبل كل اختبار
- ✅ التحقق من النطاق (Scope Validation)

## 🌐 النشر

### Vercel

```bash
# 1. ربط المشروع
vercel link

# 2. إضافة متغيرات البيئة
vercel env add E2B_API_KEY
vercel env add OPENAI_API_KEY

# 3. النشر
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### متغيرات الإنتاج

```env
# Convex Production
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# E2B Production
E2B_API_KEY=production_key

# OpenAI Production
OPENAI_API_KEY=production_key

# Security
NODE_ENV=production
SESSION_EXPIRATION_DAYS=30
```

## 📚 مراجع

- [Convex Documentation](https://docs.convex.dev/)
- [E2B API Reference](https://e2b.dev/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى:

1. Fork المشروع
2. إنشاء branch للميزة (`git checkout -b feature/amazing`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. فتح Pull Request

## 📄 الرخصة

MIT License - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🙏 شكر خاص

- [E2B](https://e2b.dev/) - بيئة التنفيذ المعزولة
- [OpenAI](https://openai.com/) - نماذج الذكاء الاصطناعي
- [Convex](https://convex.dev/) - منصة الـ Backend
- [Next.js](https://nextjs.org/) - إطار العمل
- المجتمع الأمني المفتوح المصدر

---

**⚠️ إخلاء مسؤولية**: ZERO-X مصممة لاختبار الاختراق المصرح به فقط. المطورون غير مسؤولين عن أي سوء استخدام لهذا الأداة. استخدم دائماً بشكل مسؤول وأخلاقي.

---

**Built with 🎯 for the security community**

*آخر تحديث: أغسطس 2026*
