import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Download, Copy, RefreshCw } from 'lucide-react';

interface UploadCityViewProps {
  disease: 'dengue' | 'lepto';
  theme?: 'light' | 'dark';
}

function computeSpearmanRho(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;
  const rank = (arr: number[]) => {
    const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const ranks = new Array<number>(arr.length);
    for (let i = 0; i < indexed.length; i++) {
      ranks[indexed[i].i] = i + 1;
    }
    return ranks;
  };
  const rx = rank(x.slice(0, n));
  const ry = rank(y.slice(0, n));
  const meanRank = (n + 1) / 2;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = rx[i] - meanRank;
    const dy = ry[i] - meanRank;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const denom = Math.sqrt(denX * denY);
  return denom > 0 ? Number((num / denom).toFixed(3)) : 0;
}

export const UploadCityView: React.FC<UploadCityViewProps> = ({ disease: initialDisease, theme = 'dark' }) => {
  const [disease, setDisease] = useState<'dengue' | 'lepto'>(initialDisease);
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDark = theme === 'dark';

  const cardCls = isDark
    ? 'bg-slate-900 text-white border-slate-800 shadow-sm'
    : 'bg-[#FFFDF9] text-stone-900 border-[#E7E1D6] shadow-sm';

  const insetCls = isDark
    ? 'bg-slate-800/60 text-slate-200 border-slate-800'
    : 'bg-[#F4EFE6] text-stone-800 border-[#E7E1D6]';

  const headingCls = isDark ? 'text-white' : 'text-stone-900';
  const mutedCls = isDark ? 'text-slate-400' : 'text-stone-600';
  const borderCls = isDark ? 'border-slate-800' : 'border-[#E7E1D6]';

  const schemas = {
    dengue: {
      cols: ['YR', 'MN', 'DC_QC', 'RF_NASA', 'n_weeks'],
      rainCol: 'RF_NASA',
      caseCol: 'DC_QC',
      sample: `YR,MN,DC_QC,RF_NASA,n_weeks
2018,1,95,35.2,4
2018,2,80,22.1,4
2018,3,65,18.4,4
2018,4,70,30.0,4
2018,5,130,110.5,5
2018,6,220,240.2,4
2018,7,350,380.0,5
2018,8,390,410.8,4
2018,9,310,340.5,4
2018,10,210,190.2,5
2018,11,150,120.0,4
2018,12,110,65.4,5
2019,1,85,40.1,4
2019,2,75,25.3,4
2019,3,70,20.0,4
2019,4,80,35.2,4
2019,5,145,115.0,5
2019,6,240,260.4,4
2019,7,380,420.0,5
2019,8,420,450.2,4
2019,9,340,360.8,4
2019,10,230,210.0,5
2019,11,165,130.5,4
2019,12,120,70.0,5`
    },
    lepto: {
      cols: ['month', 'lepto', 'rain_total_mm', 'n_weeks'],
      rainCol: 'rain_total_mm',
      caseCol: 'lepto',
      sample: `month,lepto,rain_total_mm,n_weeks
2005-01,12,45.2,4
2005-02,8,25.0,4
2005-03,6,18.5,4
2005-04,9,30.2,4
2005-05,22,125.4,5
2005-06,45,280.1,4
2005-07,95,450.0,5
2005-08,120,510.6,4
2005-09,85,380.2,4
2005-10,50,220.0,5
2005-11,30,135.5,4
2005-12,18,75.0,5
2006-01,10,40.0,4
2006-02,7,22.1,4
2006-03,5,15.2,4
2006-04,8,28.0,4
2006-05,25,130.0,5
2006-06,55,310.2,4
2006-07,110,480.5,5
2006-08,135,540.0,4
2006-09,90,395.2,4
2006-10,55,235.1,5
2006-11,32,140.0,4
2006-12,20,80.0,5`
    }
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(schemas[disease].sample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([schemas[disease].sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daloy_${disease}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    await processFile(selected);
  };

  const processFile = async (selectedFile: File) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('disease', disease);
      formData.append('city', selectedFile.name.replace(/\.csv$/i, '') || 'custom_city');
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        setValidationResult(json);
        setIsLoading(false);
        return;
      }
    } catch {
      // Offline fallback client validator
    }

    // In-browser fallback CSV validation with authentic Spearman correlation & summary stats
    const text = await selectedFile.text();
    const lines = text
      .trim()
      .split(/\r?\n/)
      .filter(l => l.trim().length > 0)
      .map(l => l.trim().split(','));
    if (lines.length < 2) {
      setValidationResult({
        valid: false,
        errors: ['File contains insufficient data lines.'],
        row_count: 0
      });
      setIsLoading(false);
      return;
    }

    const headers = lines[0].map(h => h.trim());
    const expected = schemas[disease].cols;
    const missing = expected.filter(c => !headers.includes(c));

    if (missing.length > 0) {
      setValidationResult({
        valid: false,
        errors: [`Missing required columns: ${missing.join(', ')}`],
        expected_columns: expected,
        found_columns: headers
      });
      setIsLoading(false);
      return;
    }

    const dataRows = lines.slice(1);
    const rowCount = dataRows.length;
    const valid = rowCount >= 24;
    const errors = valid
      ? []
      : [`Need at least 24 monthly records for Leave-One-Year-Out cross-validation (found ${rowCount}).`];

    const rainIdx = headers.indexOf(schemas[disease].rainCol);
    const caseIdx = headers.indexOf(schemas[disease].caseCol);

    const rains = dataRows.map(r => Number(r[rainIdx]) || 0);
    const cases = dataRows.map(r => Number(r[caseIdx]) || 0);

    const meanRain = rains.length > 0 ? Number((rains.reduce((a, b) => a + b, 0) / rains.length).toFixed(1)) : 0;
    const totalCases = Math.round(cases.reduce((a, b) => a + b, 0));
    const meanCases = cases.length > 0 ? Number((totalCases / cases.length).toFixed(1)) : 0;
    const spearmanRho = computeSpearmanRho(rains, cases);

    setValidationResult({
      valid,
      row_count: rowCount,
      errors,
      spearman_rho: spearmanRho,
      summary: {
        mean_rainfall: meanRain,
        mean_cases: meanCases,
        total_cases: totalCases
      },
      preview: dataRows.slice(0, 5).map(r => {
        const obj: any = {};
        headers.forEach((h, i) => {
          obj[h] = r[i];
        });
        return obj;
      })
    });
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cardCls}`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold mb-2">
            Experimental Feature
          </div>
          <h2 className={`text-xl font-bold ${headingCls}`}>
            Upload Your City Surveillance Data
          </h2>
          <p className={`text-xs mt-1 max-w-xl ${mutedCls}`}>
            DALOY is trained on Quezon City and Manila. Upload your local monthly panel (≥ 24 months) to run Leave-One-Year-Out validation or evaluate rainfall-case correlation for your LGU.
          </p>
        </div>

        {/* Disease switcher */}
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-[#F4EFE6] border border-[#E7E1D6]/70'}`}>
          <button
            onClick={() => {
              setDisease('dengue');
              setFile(null);
              setValidationResult(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              disease === 'dengue'
                ? 'bg-rose-500 text-white shadow-sm'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Dengue Format
          </button>
          <button
            onClick={() => {
              setDisease('lepto');
              setFile(null);
              setValidationResult(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              disease === 'lepto'
                ? 'bg-teal-700 text-white shadow-sm'
                : isDark ? 'text-slate-300 hover:text-white' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Lepto Format
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Schema and Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 rounded-3xl border ${cardCls}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${mutedCls}`}>
              Required CSV Schema ({disease.toUpperCase()})
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {schemas[disease].cols.map(c => (
                <code
                  key={c}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${insetCls}`}
                >
                  {c}
                </code>
              ))}
            </div>

            <p className={`text-xs mb-4 leading-relaxed ${mutedCls}`}>
              Files must be in UTF-8 CSV format with non-negative numeric counts. Minimum 24 monthly records required to support cross-validation.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadSample}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-[#F4EFE6] hover:bg-[#ECE5D8] text-stone-800 border border-[#E7E1D6]'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Download Template
              </button>
              <button
                onClick={handleCopySample}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-[#F4EFE6] hover:bg-[#ECE5D8] text-stone-800 border border-[#E7E1D6]'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Sample'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Upload Zone and Live Analysis */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-8 rounded-3xl border-2 border-dashed text-center relative transition ${
            isDark
              ? 'bg-slate-900 border-slate-700 hover:border-teal-500'
              : 'bg-[#F4EFE6]/60 border-[#DBD4C8] hover:border-stone-500'
          }`}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className={`p-4 rounded-full mb-3 ${
                isDark ? 'bg-teal-950/60 text-teal-400' : 'bg-[#EBE4D8] text-stone-700'
              }`}>
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-stone-800'}`}>
                {file ? file.name : 'Drop your city CSV here or click to browse'}
              </p>
              <p className={`text-xs mt-1 ${mutedCls}`}>
                CSV format only · Maximum 10MB
              </p>
            </div>
          </div>

          {isLoading && (
            <div className={`flex items-center justify-center p-6 rounded-2xl border gap-2 text-sm ${cardCls}`}>
              <RefreshCw className={`w-4 h-4 animate-spin ${isDark ? 'text-teal-400' : 'text-stone-700'}`} />
              <span className={mutedCls}>Validating schema and computing correlation...</span>
            </div>
          )}

          {validationResult && (
            <div className={`p-6 rounded-3xl border space-y-6 ${cardCls}`}>
              <div className={`flex items-center justify-between pb-4 border-b ${borderCls}`}>
                <div className="flex items-center gap-2.5">
                  {validationResult.valid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <h4 className={`text-base font-bold ${headingCls}`}>
                    {validationResult.valid ? 'File Validated Successfully' : 'Validation Issues Detected'}
                  </h4>
                </div>
                <span className={`text-xs font-mono font-bold ${mutedCls}`}>
                  {validationResult.row_count} monthly rows parsed
                </span>
              </div>

              {validationResult.errors && validationResult.errors.length > 0 && (
                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDark
                    ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <span className="text-xs font-bold">
                    Fix the following:
                  </span>
                  <ul className={`list-disc list-inside text-xs space-y-1 ${
                    isDark ? 'text-rose-400' : 'text-rose-700'
                  }`}>
                    {validationResult.errors.map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult.valid && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-2xl border ${insetCls}`}>
                      <span className={`text-xs ${mutedCls}`}>Spearman Rank ρ</span>
                      <div className={`text-xl font-extrabold font-mono mt-1 ${isDark ? 'text-teal-400' : 'text-stone-900'}`}>
                        {validationResult.spearman_rho >= 0 ? `+${validationResult.spearman_rho}` : validationResult.spearman_rho}
                      </div>
                      <span className="text-[10px] opacity-75">Rain-case correlation</span>
                    </div>

                    <div className={`p-4 rounded-2xl border ${insetCls}`}>
                      <span className={`text-xs ${mutedCls}`}>Mean Monthly Rain</span>
                      <div className={`text-xl font-extrabold font-mono mt-1 ${isDark ? 'text-slate-200' : 'text-stone-900'}`}>
                        {validationResult.summary?.mean_rainfall} mm
                      </div>
                      <span className="text-[10px] opacity-75">Local climate baseline</span>
                    </div>

                    <div className={`p-4 rounded-2xl border col-span-2 sm:col-span-1 ${insetCls}`}>
                      <span className={`text-xs ${mutedCls}`}>Total Cases Reported</span>
                      <div className={`text-xl font-extrabold font-mono mt-1 ${isDark ? 'text-slate-200' : 'text-stone-900'}`}>
                        {validationResult.summary?.total_cases?.toLocaleString()}
                      </div>
                      <span className="text-[10px] opacity-75">Across dataset</span>
                    </div>
                  </div>

                  {/* 5-row preview table */}
                  {validationResult.preview && validationResult.preview.length > 0 && (
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${mutedCls}`}>
                        Data Preview (First 5 Rows)
                      </span>
                      <div className={`overflow-x-auto rounded-xl border ${borderCls}`}>
                        <table className="w-full text-left text-xs font-mono">
                          <thead className={isDark ? 'bg-slate-800 text-slate-300' : 'bg-[#F4EFE6] text-stone-700'}>
                            <tr>
                              {Object.keys(validationResult.preview[0]).map(k => (
                                <th key={k} className="p-2.5 font-bold">
                                  {k}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${borderCls}`}>
                            {validationResult.preview.map((row: any, idx: number) => (
                              <tr key={idx} className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-[#F9F6F0]'}>
                                {Object.values(row).map((v: any, j: number) => (
                                  <td key={j} className={`p-2.5 ${isDark ? 'text-slate-300' : 'text-stone-800'}`}>
                                    {String(v)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
