/**
 * حارس أسلوب البناء — يمنع تكرار علة Tailwind v4.
 *
 * كان globals.css يستخدم توجيهات v3 (@tailwind base/components/utilities)
 * مع tailwindcss v4 مثبّتة. v4 تُهمل هذه التوجيهات بصمت، فينجح next build
 * ويخرج ملف CSS بحجم ~9KB بلا أي utility class: الصفحة تُعرض بلا تنسيق
 * إطلاقاً (نصوص متراكبة وشريط تنقل ملتصق) ولا يكشف ذلك أي فحص قائم.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CSS_DIR = ".next/static/chunks";
const MIN_BYTES = 20000; // التنسيق الكامل ~26KB؛ نسخة v3 المعطّلة ~9KB

function cssFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return cssFiles(full);
    return name.endsWith(".css") ? [full] : [];
  });
}

let files;
try {
  files = cssFiles(CSS_DIR);
} catch {
  console.error(`✗ ${CSS_DIR} غير موجود — شغّل "npm run build" أولاً.`);
  process.exit(1);
}

if (files.length === 0) {
  console.error("✗ لم يُولَّد أي ملف CSS — فشل البناء في تجميع الأنماط.");
  process.exit(1);
}

const total = files.reduce((sum, f) => sum + readFileSync(f).length, 0);
const hasUtilities = files.some((f) =>
  /\.(flex|grid|hidden|rounded|px-6|max-w-7xl)\b/.test(readFileSync(f, "utf8")),
);

if (total < MIN_BYTES || !hasUtilities) {
  console.error(
    `✗ أنماط معطّلة: ${total} بايت في ${files.length} ملف (الحد ${MIN_BYTES}) — ` +
      `utilities=${hasUtilities}. راجع @import "tailwindcss" في app/globals.css.`,
  );
  process.exit(1);
}

console.log(`✓ الأنماط سليمة: ${total} بايت عبر ${files.length} ملف، وutilities موجودة.`);
