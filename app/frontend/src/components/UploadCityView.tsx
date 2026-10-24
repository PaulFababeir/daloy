import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  RefreshCw,
  MapPin,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { METRO_MANILA_CITIES } from './metroManilaData';
import { HistoricalPoint, UploadedCityData } from '../services/api';

interface UploadCityViewProps {
  disease: 'dengue' | 'lepto';
  initialCity?: string | null;
  uploadedCities?: Record<string, UploadedCityData>;
  onCityUploadSuccess?: (data: UploadedCityData) => void;
  onRemoveUploadedCity?: (cityKey: string) => void;
  onViewOnMap?: (cityName: string, disease: 'dengue' | 'lepto') => void;
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

const normalizeCityKey = (name?: string | null): string => {
  if (!name) return '';
  const n = name.trim().toLowerCase();
  if (n === 'city of manila' || n === 'manila') return 'manila';
  if (n.startsWith('city of ')) return n.replace('city of ', '');
  return n;
};

function matchNCRCityFromText(rawText: string): string | null {
  const cleaned = rawText.replace(/\.csv$/i, '').replace(/[_-]+/g, ' ').toLowerCase();
  for (const c of METRO_MANILA_CITIES) {
    const cLower = c.name.toLowerCase();
    const shortLower = cLower.replace(/^city of\s+/i, '');
    if (cleaned.includes(shortLower) || cleaned.includes(cLower)) {
      return c.name;
    }
  }
  return null;
}

function parseHistoryPointsFromRows(
  diseaseKey: 'dengue' | 'lepto',
  headers: string[],
  dataRows: string[][]
): HistoricalPoint[] {
  const points: HistoricalPoint[] = [];
  const rainCol = diseaseKey === 'dengue' ? 'RF_NASA' : 'rain_total_mm';
  const caseCol = diseaseKey === 'dengue' ? 'DC_QC' : 'lepto';
  const rainIdx = headers.indexOf(rainCol);
  const caseIdx = headers.indexOf(caseCol);
  const weeksIdx = headers.indexOf('n_weeks');
  const yrIdx = headers.indexOf('YR');
  const mnIdx = headers.indexOf('MN');
  const monthStrIdx = headers.indexOf('month');

  dataRows.forEach((row, idx) => {
    const rain = Number(row[rainIdx]);
    const cases = Number(row[caseIdx]);
    if (!Number.isFinite(rain) || !Number.isFinite(cases)) return;

    let year = 2020;
    let month = (idx % 12) + 1;

    if (diseaseKey === 'dengue' && yrIdx >= 0 && mnIdx >= 0) {
      const yVal = parseInt(row[yrIdx], 10);
      const mVal = parseInt(row[mnIdx], 10);
      if (Number.isFinite(yVal)) year = yVal;
      if (Number.isFinite(mVal) && mVal >= 1 && mVal <= 12) month = mVal;
    } else if (monthStrIdx >= 0 && row[monthStrIdx]) {
      const rawM = row[monthStrIdx].trim();
      const parts = rawM.split(/[-/]/);
      if (parts.length >= 2) {
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        if (parts[0].length === 4 && Number.isFinite(p0) && Number.isFinite(p1)) {
          year = p0;
          month = Math.max(1, Math.min(12, p1));
        } else if (Number.isFinite(p0) && Number.isFinite(p1)) {
          month = Math.max(1, Math.min(12, p0));
          year = p1;
        }
      }
    }

    const nWeeksVal = weeksIdx >= 0 ? parseInt(row[weeksIdx], 10) : 4;
    const prevRain = idx > 0 ? Number(dataRows[idx - 1][rainIdx]) : rain;

    points.push({
      year,
      month,
      rain,
      prev: Number.isFinite(prevRain) ? prevRain : rain,
      nWeeks: nWeeksVal === 5 ? 5 : 4,
      cases: Math.max(0, Math.round(cases))
    });
  });

  return points;
}

export const UploadCityView: React.FC<UploadCityViewProps> = ({
  disease: initialDisease,
  initialCity,
  uploadedCities = {},
  onCityUploadSuccess,
  onRemoveUploadedCity,
  onViewOnMap,
  theme = 'dark'
}) => {
  const defaultTargetCity =
    initialCity && initialCity !== 'Quezon City' && initialCity !== 'City of Manila'
      ? initialCity
      : initialCity || 'Makati';

  const [disease, setDisease] = useState<'dengue' | 'lepto'>(initialDisease);
  const [targetCity, setTargetCity] = useState<string>(defaultTargetCity);
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [parsedHistory, setParsedHistory] = useState<HistoricalPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialCity) {
      setTargetCity(initialCity);
    }
  }, [initialCity]);

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
2001-01-01,6,79.67,5
2001-02-01,6,255.86,4
2001-03-01,3,124.54,4
2001-04-01,0,72.12,5
2001-05-01,9,141.53,4
2001-06-01,5,244.04,4
2001-07-01,29,220.13,5
2001-08-01,27,229.92,4
2001-09-01,19,51.81,4
2001-10-01,12,298.15,5
2001-11-01,7,288.46,4
2001-12-01,1,392.15,5
2002-01-01,0,70.47,4
2002-02-01,1,92.77,4
2002-03-01,0,73.12,4
2002-04-01,0,58.37,5
2002-05-01,4,111.92,4
2002-06-01,7,173.36,4
2002-07-01,111,499.4,5
2002-08-01,66,264.74,4
2002-09-01,60,262.58,5
2002-10-01,26,299.9,4
2002-11-01,19,414.79,4
2002-12-01,6,219.61,5
2003-01-01,3,87.03,4
2003-02-01,1,47.73,4`
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
    a.download = `daloy_${targetCity.toLowerCase().replace(/\s+/g, '_')}_${disease}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTargetCityChange = (nextCity: string) => {
    setTargetCity(nextCity);
    if (validationResult?.valid && onCityUploadSuccess) {
      onCityUploadSuccess({
        cityName: nextCity,
        disease,
        fileName: file?.name || `${nextCity.toLowerCase()}.csv`,
        rowCount: validationResult.row_count,
        spearmanRho: validationResult.spearman_rho,
        meanRainfall: validationResult.summary?.mean_rainfall ?? 0,
        meanCases: validationResult.summary?.mean_cases ?? 0,
        totalCases: validationResult.summary?.total_cases ?? 0,
        historyPoints: parsedHistory
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    await processFile(selected);
  };

  const processFile = async (selectedFile: File) => {
    setIsLoading(true);

    // Check if filename matches an NCR city (when user didn't lock a specific city)
    const matchedFromFilename = matchNCRCityFromText(selectedFile.name);
    const effectiveCity = matchedFromFilename || targetCity;
    if (matchedFromFilename && matchedFromFilename !== targetCity) {
      setTargetCity(matchedFromFilename);
    }

    // Read CSV text first to auto-detect Dengue vs. Leptospirosis columns & build historyPoints
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
    let activeDiseaseKey: 'dengue' | 'lepto' = disease;
    if (schemas.lepto.cols.every(c => headers.includes(c))) {
      activeDiseaseKey = 'lepto';
      if (disease !== 'lepto') setDisease('lepto');
    } else if (schemas.dengue.cols.every(c => headers.includes(c))) {
      activeDiseaseKey = 'dengue';
      if (disease !== 'dengue') setDisease('dengue');
    }

    const dataRows = lines.slice(1);
    const extractedHistory = parseHistoryPointsFromRows(activeDiseaseKey, headers, dataRows);
    setParsedHistory(extractedHistory);

    try {
      const formData = new FormData();
      formData.append('disease', activeDiseaseKey);
      formData.append('city', effectiveCity);
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        const finalDisease: 'dengue' | 'lepto' = json.disease === 'lepto' ? 'lepto' : json.disease === 'dengue' ? 'dengue' : activeDiseaseKey;
        if (finalDisease !== disease) setDisease(finalDisease);
        setValidationResult(json);
        if (json.valid && onCityUploadSuccess) {
          onCityUploadSuccess({
            cityName: effectiveCity,
            disease: finalDisease,
            fileName: selectedFile.name,
            rowCount: json.row_count,
            spearmanRho: json.spearman_rho,
            meanRainfall: json.summary?.mean_rainfall ?? 0,
            meanCases: json.summary?.mean_cases ?? 0,
            totalCases: json.summary?.total_cases ?? 0,
            historyPoints: extractedHistory
          });
        }
        setIsLoading(false);
        return;
      }
    } catch {
      // Offline fallback client validator
    }

    // In-browser fallback CSV validation with authentic Spearman correlation & summary stats
    const expected = schemas[activeDiseaseKey].cols;
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

    const rowCount = dataRows.length;
    const valid = rowCount >= 24;
    const errors = valid
      ? []
      : [`Need at least 24 monthly records for Leave-One-Year-Out cross-validation (found ${rowCount}).`];

    const rainIdx = headers.indexOf(schemas[activeDiseaseKey].rainCol);
    const caseIdx = headers.indexOf(schemas[activeDiseaseKey].caseCol);

    const rains = dataRows.map(r => Number(r[rainIdx]) || 0);
    const cases = dataRows.map(r => Number(r[caseIdx]) || 0);

    const meanRain = rains.length > 0 ? Number((rains.reduce((a, b) => a + b, 0) / rains.length).toFixed(1)) : 0;
    const totalCases = Math.round(cases.reduce((a, b) => a + b, 0));
    const meanCases = cases.length > 0 ? Number((totalCases / cases.length).toFixed(1)) : 0;
    const spearmanRho = computeSpearmanRho(rains, cases);

    const resultObj = {
      valid,
      disease: activeDiseaseKey,
      city: effectiveCity,
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
    };

    setValidationResult(resultObj);

    if (valid && onCityUploadSuccess) {
      onCityUploadSuccess({
        cityName: effectiveCity,
        disease: activeDiseaseKey,
        fileName: selectedFile.name,
        rowCount,
        spearmanRho,
        meanRainfall: meanRain,
        meanCases,
        totalCases,
        historyPoints: extractedHistory
      });
    }

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
        {/* Left Column: Target City Selector, Schema and Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Metro Manila City Selector */}
          <div className={`p-6 rounded-3xl border space-y-3 ${cardCls}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${headingCls}`}>
                  Target Metro Manila LGU
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                disease === 'dengue'
                  ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                  : 'bg-teal-500/15 text-teal-400 border-teal-500/30'
              }`}>
                {disease === 'dengue' ? 'Dengue Layer' : 'Leptospirosis Layer'}
              </span>
            </div>

            <p className={`text-xs leading-relaxed ${mutedCls}`}>
              Select the Metro Manila city this CSV dataset belongs to. Once validated, this city will be highlighted on the 3D map under <strong>{disease === 'dengue' ? 'Dengue' : 'Leptospirosis'}</strong> alongside baseline cities.
            </p>

            <select
              value={targetCity}
              onChange={e => handleTargetCityChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold border focus:outline-none transition ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500'
                  : 'bg-[#F4EFE6] border-[#E7E1D6] text-stone-900 focus:border-stone-500'
              }`}
            >
              {METRO_MANILA_CITIES.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.district})
                </option>
              ))}
            </select>

            {/* Active Uploaded Cities List */}
            {Object.keys(uploadedCities).length > 0 && (
              <div className={`pt-3 mt-3 border-t ${borderCls} space-y-2`}>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${mutedCls}`}>
                  Active Uploaded Cities on 3D Map ({Object.keys(uploadedCities).length})
                </span>
                <div className="space-y-1.5">
                  {Object.entries(uploadedCities).map(([key, item]) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs ${insetCls}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-sm shrink-0 ${
                            item.disease === 'dengue' ? 'bg-[#E11D48]' : 'bg-[#0D9488]'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className={`font-bold truncate ${headingCls}`}>{item.cityName}</div>
                          <div className={`text-[10px] font-mono ${mutedCls}`}>
                            {item.disease === 'dengue' ? 'Dengue' : 'Leptospirosis'} · {item.rowCount} mos · ρ={item.spearmanRho >= 0 ? `+${item.spearmanRho}` : item.spearmanRho}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {onViewOnMap && (
                          <button
                            type="button"
                            onClick={() => onViewOnMap(item.cityName, item.disease)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                              item.disease === 'dengue'
                                ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                                : 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30'
                            }`}
                          >
                            View Map
                          </button>
                        )}
                        {onRemoveUploadedCity && (
                          <button
                            type="button"
                            onClick={() => onRemoveUploadedCity(normalizeCityKey(item.cityName))}
                            title="Remove uploaded city data"
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/15 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    disease === 'dengue'
                      ? isDark ? 'bg-rose-950/40 border-rose-500/40 text-rose-100' : 'bg-rose-50 border-rose-200 text-rose-900'
                      : isDark ? 'bg-teal-950/40 border-teal-500/40 text-teal-100' : 'bg-teal-50 border-teal-200 text-teal-900'
                  }`}>
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-sm ${disease === 'dengue' ? 'bg-[#E11D48]' : 'bg-[#0D9488]'}`} />
                        <span>{targetCity} added to {disease === 'dengue' ? 'Dengue' : 'Leptospirosis'} 3D Map Layer</span>
                      </div>
                      <p className="text-[11px] opacity-85">
                        {targetCity} will now highlight with full 3D elevation &amp; barangay grids alongside {disease === 'dengue' ? 'Quezon City' : 'City of Manila'}.
                      </p>
                    </div>
                    {onViewOnMap && (
                      <button
                        type="button"
                        onClick={() => onViewOnMap(targetCity, disease)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold shrink-0 transition shadow-md ${
                          disease === 'dengue'
                            ? 'bg-[#E11D48] hover:bg-rose-500 text-white'
                            : 'bg-[#0D9488] hover:bg-teal-500 text-white'
                        }`}
                      >
                        <span>Visualize {targetCity} on Map</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

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
