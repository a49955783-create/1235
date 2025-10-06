import { useState, useEffect } from "react";
import Intro from "../components/Intro";
import UnitTable from "../components/UnitTable";
import Tesseract from "tesseract.js";

function parsePeopleFromText(text) {
  if (!text) return {};
  const recName = (text.match(/المستلم\s*[:：]\s*([\u0600-\u06FF\s]+)/) || [,''])[1].trim();
  const recCode = (text.match(/الكود\s*[:：]\s*([A-Z]{1,3}\d{1,3})/i) || [,''])[1].toUpperCase();
  const depName = (text.match(/النائب\s*[:：]\s*([\u0600-\u06FF\s]+)/) || [,''])[1].trim();
  const depCode = (text.match(/نائب.*?الكود\s*[:：]\s*([A-Z]{1,3}\d{1,3})/i) || [,''])[1].toUpperCase();
  return { recName, recCode, depName, depCode };
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [progress, setProgress] = useState(0);

  // ⏳ الانترو يختفي بعد 3 ثواني
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 🔍 OCR استخراج النص من الصورة
  const handleImage = async (img) => {
    if (!img) return;
    setProgress(0);
    setOcrText("");
    Tesseract.recognize(img, "ara+eng", {
      logger: (info) => {
        if (info.status === "recognizing text") {
          setProgress(Math.round(info.progress * 100));
        }
      },
    }).then(({ data: { text } }) => {
      // تنظيف الرموز غير المفيدة
      const cleanText = text.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "");
      setOcrText(cleanText);
    });
  };

  // 📎 رفع الصورة أو لصقها
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => handleImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => handleImage(reader.result);
        reader.readAsDataURL(blob);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <div className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/background-police.png')" }}
    >
      {showIntro ? (
        <Intro />
      ) : (
        <div className="backdrop-blur-md bg-black/40 min-h-screen p-6">
          <header className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo-police.png" alt="شعار الشرطة" className="w-16 h-16" />
            <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-300 drop-shadow-lg">
              تحديث مركز العمليات للشرطة
            </h1>
          </header>

          {/* أزرار التحكم */}
          <div className="flex flex-col md:flex-row gap-3 justify-center mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="text-sm file:mr-3 file:px-4 file:py-2 file:bg-blue-600 file:text-white rounded-lg cursor-pointer"
            />
            <button
              onClick={() => handleImage(image)}
              className="px-6 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg font-semibold"
            >
              استخراج النص
            </button>
          </div>

          {/* عداد التقدم */}
          {progress > 0 && progress < 100 && (
            <div className="text-center text-sm text-gray-300 mb-3">
              جاري التحليل: {progress}%
            </div>
          )}

          {/* عرض النص بعد التحليل */}
          {ocrText && (
            <div className="bg-gray-800/60 rounded-xl p-4 text-right text-sm whitespace-pre-wrap leading-relaxed">
              <UnitTable text={ocrText} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
