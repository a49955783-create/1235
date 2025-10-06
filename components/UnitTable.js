import React, { useEffect, useState } from 'react';

const STATUSES = ['في الميدان', 'مشغول', 'خارج الخدمة', 'خارج الخدمه', 'في الميدان.', 'مشغول.', 'خارج الخدمة.'];

const CODE_RE = /\b(?:DS|DA|A|V|U|P|RP|SP|EM|EMS|DX|X|K|Q|T|B)[A-Z]?\d{1,3}\b/i;
const STATUS_RE = /(في الميدان|مشغول|خارج الخدمة|خارج الخدمه)/;

function splitArabicWords(s) {
  return s.replace(/[.,،]/g, ' ').split(/\s+/).filter(Boolean);
}

function parseUnitsFromText(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const rows = [];

  for (const line of lines) {
    const codeMatch = line.match(CODE_RE);
    const statusMatch = line.match(STATUS_RE);
    if (!codeMatch && !statusMatch) continue;

    let code = codeMatch ? codeMatch[0].toUpperCase() : '';
    let status = statusMatch ? statusMatch[1] : '';
    let rest = line;
    if (code) rest = rest.replace(codeMatch[0], '').trim();
    if (status) rest = rest.replace(statusMatch[1], '').trim();

    let location = '';
    const locTag = rest.match(/الموقع[:：]?\s*([\u0600-\u06FF0-9\s\-_/]+)/);
    if (locTag) {
      location = locTag[1].trim();
      rest = rest.replace(locTag[0], '').trim();
    } else {
      const arrow = rest.split(/[-–—>→]/);
      if (arrow.length > 1) {
        location = arrow.pop().trim();
        rest = arrow.join(' ').trim();
      }
    }

    const name = splitArabicWords(rest).join(' ');
    if (code || name || status || location) {
      rows.push({ name, code, status, location });
    }
  }

  return rows.slice(0, 80);
}

export default function UnitTable({ text, onUnitsChange }) {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const parsed = parseUnitsFromText(text);
    if (parsed.length) setUnits(parsed);
  }, [text]);

  useEffect(() => {
    onUnitsChange && onUnitsChange(units);
  }, [units, onUnitsChange]);

  const addRow = () => setUnits([...units, { name: '', code: '', status: '', location: '' }]);
  const removeRow = (idx) => setUnits(units.filter((_, i) => i !== idx));
  const updateRow = (idx, key, value) => {
    const u = [...units];
    u[idx][key] = value;
    setUnits(u);
  };

  return (
    <div className="bg-gray-900/70 rounded-2xl p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">القائمة (ضبط/الاسم//الكود/الحالة/الموقع)</h3>
        <button onClick={addRow} className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm">إضافة سطر جديد</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm rtl text-right">
          <thead>
            <tr className="text-gray-300">
              <th className="p-2">الاسم</th>
              <th className="p-2">الكود</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">الموقع</th>
              <th className="p-2">—</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u, i) => (
              <tr key={i} className="border-t border-gray-800">
                <td className="p-2">
                  <input value={u.name} onChange={(e)=>updateRow(i,'name',e.target.value)}
                         className="w-full rounded bg-black/40 border border-gray-800 p-2 focus:outline-none" placeholder="اسم ثلاثي" />
                </td>
                <td className="p-2">
                  <input value={u.code} onChange={(e)=>updateRow(i,'code',e.target.value.toUpperCase())}
                         className="w-full rounded bg-black/40 border border-gray-800 p-2 focus:outline-none" placeholder="مثال DA5" />
                </td>
                <td className="p-2">
                  <select value={u.status} onChange={(e)=>updateRow(i,'status',e.target.value)}
                          className="w-full rounded bg-black/40 border border-gray-800 p-2 focus:outline-none">
                    <option value="">— لا شي —</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <input value={u.location} onChange={(e)=>updateRow(i,'location',e.target.value)}
                         className="w-full rounded bg-black/40 border border-gray-800 p-2 focus:outline-none" placeholder="الموقع" />
                </td>
                <td className="p-2">
                  <button onClick={()=>removeRow(i)} className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-xs">حذف</button>
                </td>
              </tr>
            ))}
            {units.length === 0 && (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-400">لا توجد صفوف حتى الآن — ابدأ بإضافة سطر جديد أو الصق صورة لاستخراج الوحدات.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
