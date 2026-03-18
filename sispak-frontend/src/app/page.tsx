"use client";

import { useState } from "react";

// Tipe Data untuk hasil prediksi
interface DetailHasil {
  [key: string]: number;
}

interface DiagnosisResult {
  status: string;
  diagnosis_akhir?: string;
  nilai_cf?: number;
  detail_hasil?: DetailHasil;
  message?: string;
}

const GEJALA_LIST = [
  { code: "E01", name: "Poliuria (Sering kencing)" },
  { code: "E02", name: "Polidipsia (Sering haus)" },
  { code: "E03", name: "Polifagia (Sering lapar)" },
  { code: "E04", name: "Lemas / Cepat Lelah" },
  { code: "E05", name: "Kesemutan" },
  { code: "E06", name: "Pandangan Kabur" },
  { code: "E07", name: "Luka Sulit Sembuh" },
];

export default function Home() {
  const [gdp, setGdp] = useState<string>("");
  const [gds, setGds] = useState<string>("");
  const [preg, setPreg] = useState<boolean>(false);
  const [gejala, setGejala] = useState<{ [key: string]: number }>({
    E01: 0,
    E02: 0,
    E03: 0,
    E04: 0,
    E05: 0,
    E06: 0,
    E07: 0,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const handleSliderChange = (code: string, value: number) => {
    setGejala((prev) => ({
      ...prev,
      [code]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Dapatkan URL dasar (lokal atau domain Vercel)
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      const response = await fetch(`${baseUrl}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gdp: gdp ? parseFloat(gdp) : 0,
          gds: gds ? parseFloat(gds) : 0,
          preg: preg,
          gejala: gejala,
        }),
      });

      const data: DiagnosisResult = await response.json();
      setResult(data);
    } catch (error: any) {
      console.error(error);
      setResult({
        status: "error",
        message: "Gagal terhubung ke server backend. Pastikan Flask API berjalan di port 5000.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-600">
            Sistem Pakar Diagnosis Diabetes
          </h1>
          <p className="text-lg text-slate-500">
            Perhitungan Menggunakan Certainty Factor (CF)
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Input */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-slate-700">Form Parameter Pasien</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Tes Lab (GDP & GDS) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-500 border-b pb-2">Hasil Lab (mg/dL)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">GDP (Gula Darah Puasa)</label>
                    <input
                      type="number"
                      value={gdp}
                      onChange={(e) => setGdp(e.target.value)}
                      placeholder="Contoh: 110"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">GDS (Gula Darah Sewaktu)</label>
                    <input
                      type="number"
                      value={gds}
                      onChange={(e) => setGds(e.target.value)}
                      placeholder="Contoh: 105"
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center mt-2 group cursor-pointer w-max">
                  <input
                    id="preg"
                    type="checkbox"
                    checked={preg}
                    onChange={(e) => setPreg(e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="preg" className="ml-3 text-sm font-medium text-slate-700 cursor-pointer group-hover:text-blue-600 transition-colors">
                    Pasien Sedang Hamil (Gestasional Check)
                  </label>
                </div>
              </div>

              {/* Slider Gejala */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-blue-500 border-b pb-2">Keyakinan Gejala (0.0 - 1.0)</h3>
                
                <div className="space-y-5">
                  {GEJALA_LIST.map((item) => (
                    <div key={item.code} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <label className="font-medium text-slate-600">
                          <span className="font-bold text-slate-800">{item.code}</span> - {item.name}
                        </label>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold w-12 text-center">
                          {gejala[item.code]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={gejala[item.code]}
                        onChange={(e) => handleSliderChange(item.code, parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    "Jalankan Prediksi"
                  )}
                </button>
              </div>

            </form>
          </section>

          {/* Result Section */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 h-max sticky top-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-700">Hasil Diagnosis</h2>
            
            {!result ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-4 border-2 border-dashed border-slate-200 rounded-xl">
                <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                <p>Belum ada prediksi. Silakan isi form dan tekan tombol prediksi.</p>
              </div>
            ) : result.status === "error" ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                <p className="font-bold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Terjadi Kesalahan
                </p>
                <p className="mt-1 text-sm">{result.message}</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Visual Diagnosis Paling Tinggi */}
                <div className={`p-6 rounded-xl border text-center space-y-2 ${
                  result.nilai_cf && result.nilai_cf > 0.6 
                    ? "bg-gradient-to-br from-red-500 to-rose-600 text-white border-red-600 shadow-lg shadow-red-200" 
                    : result.nilai_cf && result.nilai_cf > 0.4
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-500 shadow-lg shadow-amber-200"
                      : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-200"
                }`}>
                  <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Diagnosis Terkuat</p>
                  <h3 className="text-3xl font-extrabold">{result.diagnosis_akhir || "Tidak Ada"}</h3>
                  <div className="inline-block px-4 py-1 bg-white/20 rounded-full font-bold backdrop-blur-sm mt-3 border border-white/30">
                    Nilai CF: {result.nilai_cf ? (result.nilai_cf * 100).toFixed(2) : 0}%
                  </div>
                </div>

                {/* Detail Semua Probabilitas */}
                <div className="space-y-3 pt-4">
                  <h4 className="font-bold text-slate-700 border-b pb-2">Detail Probabilitas Penyakit</h4>
                  <ul className="space-y-3">
                    {result.detail_hasil && Object.entries(result.detail_hasil).map(([penyakit, cf], idx) => (
                      <li key={penyakit} className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm font-medium">
                          <span className={`${idx === 0 ? "text-slate-900 font-bold" : "text-slate-600"}`}>
                            {penyakit}
                          </span>
                          <span className={`${idx === 0 ? "text-blue-600 font-bold" : "text-slate-500"}`}>
                            {(cf * 100).toFixed(2)}%
                          </span>
                        </div>
                        {/* Progress Bar Simple */}
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              idx === 0 ? "bg-blue-500" : "bg-slate-300"
                            }`}
                            style={{ width: `${cf * 100}%` }}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
