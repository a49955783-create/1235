import React, { useEffect, useState } from 'react';

export default function Intro() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50">
      <img src="/logo-police.png" alt="police logo" className="w-24 h-24 mb-4 animate-pulse" />
      <h1 className="text-2xl font-bold text-blue-400 drop-shadow-lg">تحديث مركز العمليات للشرطة</h1>
    </div>
  );
}
