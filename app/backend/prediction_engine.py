"""
DALOY Prediction Engine
Supports:
  - Dengue (Quezon City) 2010–2025 Poisson model
  - Leptospirosis (Manila) 2001–2012 Poisson/GBM model
  - Nearest similar historical month matching (linear mm distance + seasonal proximity + transparent explanation)
  - Flood-vulnerable zone data
  - CSV validation and rank correlation for user-uploaded city datasets
"""

import csv
import math
from pathlib import Path
from typing import Dict, List, Optional, Any

from dataset.dengue.main import dengue_model
from dataset.leptos.main import leptos_model


BASE_DIR = Path(__file__).resolve().parent

MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]
MON3 = [m[:3] for m in MONTHS]
RAIN_SHAPE = [20, 14, 18, 28, 120, 260, 400, 430, 360, 210, 130, 70]


def mulberry32(seed: int):
    s = seed & 0xFFFFFFFF
    def next_rand():
        nonlocal s
        s = (s + 0x6D2B79F5) & 0xFFFFFFFF
        t = (s ^ (s >> 15)) & 0xFFFFFFFF
        t = ((t * (1 | s)) & 0xFFFFFFFF)
        t = (t + ((t ^ (t >> 7)) * (61 | t) & 0xFFFFFFFF)) & 0xFFFFFFFF
        res = ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0
        return res
    return next_rand


def gauss(rand_fn):
    u = max(rand_fn(), 1e-9)
    v = rand_fn()
    return math.sqrt(-2.0 * math.log(u)) * math.cos(2.0 * math.pi * v)


class DaloyEngine:
    def __init__(self):
        self.config = {
            'dengue': {
                'disease': 'Dengue',
                'city': 'Quezon City',
                'years': [2010, 2025],
                'seed': 11,
                'coef': {'b0': math.log(170), 'b1': 0.42},
                'inputs': [
                    "This month's rainfall (mm), as log(1 + rain), standardized",
                    "Last month's rainfall (mm), as log(1 + rain), standardized",
                    'Calendar month, as sin(2πm/12) and cos(2πm/12)',
                ],
                'mu': 0.0,
                'sdv': 1.0,
                'rain_std': 180.0,
            },
            'lepto': {
                'disease': 'Leptospirosis',
                'city': 'Manila',
                'years': [2001, 2012],
                'seed': 29,
                'coef': {'a': 0.35, 'bc': 0.38, 'bp': 0.30, 'bs': -0.28, 'bcs': -0.12},
                'inputs': [
                    "This month's rainfall (mm), as log(1 + rain)",
                    "Last month's rainfall (mm), as log(1 + rain)",
                    'Calendar month, as sin(2πm/12) and cos(2πm/12)',
                    'Case weeks in the month (4 or 5), to turn the weekly rate into monthly cases',
                ],
                'mu': 0.0,
                'sdv': 1.0,
                'rain_std': 160.0,
            }
        }
        self.history: Dict[str, List[Dict[str, Any]]] = {
            'dengue': self._build_history('dengue'),
            'lepto': self._build_history('lepto')
        }

    def _build_history(self, key: str) -> List[Dict[str, Any]]:
        cfg = self.config[key]
        rows: List[Dict[str, Any]] = []

        try:
            if key == 'dengue':
                csv_path = BASE_DIR / 'dataset' / 'dengue' / 'qc_dengue_monthly.csv'
                if csv_path.exists():
                    with open(csv_path, 'r', encoding='utf-8-sig') as f:
                        reader = csv.DictReader(f)
                        for r in reader:
                            yr = int(float(r['YR']))
                            mn = int(float(r['MN']))
                            cases = int(round(float(r['DC_QC'])))
                            rain = round(float(r['RF_NASA']), 1)
                            n_weeks = int(float(r.get('n_weeks', 4)))
                            rows.append({
                                'year': yr,
                                'month': mn,
                                'rain': rain,
                                'nWeeks': n_weeks,
                                'prev': None,
                                'cases': cases
                            })
            elif key == 'lepto':
                csv_path = BASE_DIR / 'dataset' / 'leptos' / 'manila_lepto_monthly.csv'
                if csv_path.exists():
                    with open(csv_path, 'r', encoding='utf-8-sig') as f:
                        reader = csv.DictReader(f)
                        for r in reader:
                            parts = r['month'].strip().split('-')
                            yr = int(parts[0])
                            mn = int(parts[1])
                            cases = int(round(float(r['lepto'])))
                            rain = round(float(r['rain_total_mm']), 1)
                            n_weeks = int(float(r.get('n_weeks', 4)))
                            rows.append({
                                'year': yr,
                                'month': mn,
                                'rain': rain,
                                'nWeeks': n_weeks,
                                'prev': None,
                                'cases': cases
                            })
        except Exception:
            rows = []

        if rows:
            rows.sort(key=lambda d: (d['year'], d['month']))
            for i in range(len(rows)):
                if i > 0 and (rows[i]['year'] * 12 + rows[i]['month']) - (rows[i - 1]['year'] * 12 + rows[i - 1]['month']) == 1:
                    rows[i]['prev'] = rows[i - 1]['rain']
                else:
                    rows[i]['prev'] = rows[i - 1]['rain'] if i > 0 else None

            logs = [math.log1p(max(0.0, d['rain'])) for d in rows]
            mu = sum(logs) / len(logs)
            sdv = math.sqrt(sum((v - mu) ** 2 for v in logs) / len(logs)) or 1.0
            rains = [max(0.0, d['rain']) for d in rows]
            r_mean = sum(rains) / len(rains)
            r_std = math.sqrt(sum((v - r_mean) ** 2 for v in rains) / len(rains)) or 150.0
            cfg['mu'] = mu
            cfg['sdv'] = sdv
            cfg['rain_std'] = r_std
            return [d for d in rows if d['prev'] is not None]

        # Synthetic fallback if CSV files are missing
        r = mulberry32(cfg['seed'])
        n_weeks_pattern = [5, 4, 4, 4, 5, 4, 5, 4, 4, 5, 4, 5]
        for y in range(cfg['years'][0], cfg['years'][1] + 1):
            for m in range(1, 13):
                rain = max(0.0, RAIN_SHAPE[m - 1] * math.exp(gauss(r) * 0.55))
                rows.append({
                    'year': y,
                    'month': m,
                    'rain': round(rain, 1),
                    'nWeeks': n_weeks_pattern[m - 1],
                    'prev': None,
                    'cases': 0
                })

        for i in range(len(rows)):
            rows[i]['prev'] = rows[i - 1]['rain'] if i > 0 else None

        logs = [math.log1p(d['rain']) for d in rows]
        mu = sum(logs) / len(logs)
        sdv = math.sqrt(sum((v - mu) ** 2 for v in logs) / len(logs)) or 1.0
        rains = [max(0.0, d['rain']) for d in rows]
        r_mean = sum(rains) / len(rains)
        r_std = math.sqrt(sum((v - r_mean) ** 2 for v in rains) / len(rains)) or 150.0
        cfg['mu'] = mu
        cfg['sdv'] = sdv
        cfg['rain_std'] = r_std

        usable = [d for d in rows if d['prev'] is not None]
        for d in usable:
            expected = self._fallback_predict(key, d['rain'], d['prev'], d['month'], d['nWeeks'])
            d['cases'] = max(0, round(expected * math.exp(gauss(r) * 0.3)))
        return usable

    def _fallback_predict(self, key: str, rain: float, prev: Optional[float], month: int, n_weeks: int = 4) -> float:
        cfg = self.config[key]
        def z(v):
            return (math.log1p(max(0.0, v if v is not None else 0.0)) - cfg['mu']) / cfg['sdv']

        if key == 'dengue':
            return math.exp(cfg['coef']['b0'] + cfg['coef']['b1'] * z(rain))

        ang = (2.0 * math.pi * month) / 12.0
        c = cfg['coef']
        p_val = prev if prev is not None else rain
        rate = math.exp(c['a'] + c['bc'] * z(rain) + c['bp'] * z(p_val) + c['bs'] * math.sin(ang) + c['bcs'] * math.cos(ang))
        return max(0.0, rate * (n_weeks or 4))

    def predict_raw(self, key: str, rain: float, prev: Optional[float], month: int, n_weeks: int = 4) -> float:
        p_val = prev if prev is not None else rain
        month_name = MONTHS[int(month) - 1] if isinstance(month, int) or str(month).isdigit() else str(month)

        if key == 'dengue':
            try:
                res = dengue_model(float(rain), float(p_val), month_name)
                arr = res.tolist() if hasattr(res, 'tolist') else list(res)
                if len(arr) > 0:
                    return float(arr[0])
            except Exception:
                pass
            return self._fallback_predict(key, rain, prev, int(month), n_weeks)

        if key == 'lepto':
            try:
                res = leptos_model(float(rain), float(p_val), month_name, n_weeks=n_weeks)
                arr = res.tolist() if hasattr(res, 'tolist') else list(res)
                if len(arr) > 0:
                    return float(arr[0])
            except Exception:
                pass
            return self._fallback_predict(key, rain, prev, int(month), n_weeks)

        return self._fallback_predict(key, rain, prev, int(month), n_weeks)

    def baseline_for(self, key: str, month: int) -> float:
        subset = [d['cases'] for d in self.history[key] if d['month'] == month]
        return sum(subset) / len(subset) if subset else 1.0

    def typical_rain(self, key: str, month: int) -> float:
        vals = sorted([d['rain'] for d in self.history[key] if d['month'] == month])
        return vals[len(vals) // 2] if vals else 0.0

    def level_for(self, ratio: float) -> Dict[str, str]:
        if ratio < 0.8:
            return {'id': 'low', 'label': 'Below typical'}
        if ratio <= 1.2:
            return {'id': 'typ', 'label': 'Typical'}
        if ratio <= 1.6:
            return {'id': 'up', 'label': 'Above typical'}
        return {'id': 'high', 'label': 'Well above typical'}

    def similar_months(self, key: str, rain: float, prev: Optional[float], month: int, k: int = 4) -> List[Dict[str, Any]]:
        """
        Finds the closest historical months using normalized Euclidean distance in physical mm
        and circular calendar month proximity (as specified in METHODOLOGY.md Section 5),
        so that visual x-axis proximity on the Response Curve graph matches the selected twin.
        """
        cfg = self.config[key]
        r_std = cfg.get('rain_std', 170.0) or 170.0
        q_prev = prev if prev is not None else rain

        results = []
        for d in self.history[key]:
            d_rain = float(d['rain'])
            d_prev = float(d['prev']) if d['prev'] is not None else d_rain
            d_month = int(d['month'])

            # Linear rainfall difference normalized by std (primary visual & hydrological driver)
            diff_rain = abs(rain - d_rain)
            norm_rain = diff_rain / r_std

            # Antecedent rainfall difference normalized by std
            diff_prev = abs(q_prev - d_prev)
            norm_prev = diff_prev / r_std

            # Circular calendar month distance in [0, 6] -> normalized to [0, 1]
            raw_m_diff = abs(month - d_month)
            m_gap = min(raw_m_diff, 12 - raw_m_diff)
            norm_month = m_gap / 6.0

            # Weighted Euclidean distance: current rain is primary so x-axis alignment is intuitive,
            # while antecedent rain & seasonal alignment disambiguate points with similar current rain.
            if key == 'dengue':
                dist = math.sqrt((1.25 * norm_rain) ** 2 + (0.45 * norm_prev) ** 2 + (0.55 * norm_month) ** 2)
            else:
                dist = math.sqrt((1.15 * norm_rain) ** 2 + (0.65 * norm_prev) ** 2 + (0.55 * norm_month) ** 2)

            sim = max(1, min(99, round(100.0 * math.exp(-dist * 0.95))))
            m_label = "Same calendar month" if m_gap == 0 else f"{m_gap} mo seasonal offset"
            match_reason = (
                f"Δ {round(diff_rain, 1)} mm this mo · Δ {round(diff_prev, 1)} mm prev mo · {m_label}"
            )

            results.append({
                'year': d['year'],
                'month': d_month,
                'rain': d['rain'],
                'prev': d['prev'],
                'cases': d['cases'],
                'dist': round(dist, 4),
                'sim': sim,
                'rain_diff': round(diff_rain, 1),
                'prev_diff': round(diff_prev, 1),
                'month_gap': m_gap,
                'match_reason': match_reason
            })
        results.sort(key=lambda x: x['dist'])
        return results[:k]

    def get_actions(self, key: str, level_id: str) -> List[Dict[str, str]]:
        actions = {
            'dengue': {
                'base': [
                    {'i': '4S', 't': 'Search and destroy breeding sites', 'd': 'Run barangay clean-ups of containers, gutters and tires that hold water.', 'w': 'Barangay health workers'},
                    {'i': 'Rx', 't': 'Check clinic supplies', 'd': 'Confirm stocks of NS1 rapid tests, oral rehydration salts and paracetamol.', 'w': 'City health office'}
                ],
                'up': [
                    {'i': 'IV', 't': 'Prepare hospital fast lanes', 'd': 'Pre-position IV fluids and alert hospitals to open dengue fast lanes.', 'w': 'Hospitals'},
                    {'i': '!', 't': 'Issue a public advisory', 'd': 'Remind residents of warning signs and when to go to a health center.', 'w': 'Public information office'}
                ]
            },
            'lepto': {
                'base': [
                    {'i': '!', 't': 'Warn against wading', 'd': 'Advise residents to avoid floodwater and wear boots if exposure is unavoidable.', 'w': 'Public information office'},
                    {'i': 'Rx', 't': 'Check doxycycline stocks', 'd': 'Confirm health centers can give doxycycline prophylaxis after flood exposure.', 'w': 'City health office'}
                ],
                'up': [
                    {'i': 'Dx', 't': 'Distribute prophylaxis', 'd': 'Give doxycycline to residents and responders exposed to floodwater, per DOH guidance.', 'w': 'Health centers'},
                    {'i': 'H', 't': 'Ready kidney care', 'd': 'Alert hospitals to expect admissions in about 2 weeks and to prepare dialysis capacity.', 'w': 'Hospitals'}
                ]
            }
        }
        item_set = actions.get(key, actions['dengue'])
        if level_id in ('up', 'high'):
            return item_set['base'] + item_set['up']
        return item_set['base']

    def get_flood_zones(self, key: str) -> List[Dict[str, Any]]:
        if key == 'dengue':
            # Quezon City zones
            return [
                {'name': 'Barangay Tatalon', 'risk': 'High', 'level': 3, 'center': [121.0153, 14.6242], 'desc': 'San Juan River overflow zone; dense residential drainage corridor'},
                {'name': 'Barangay Bagong Silangan', 'risk': 'High', 'level': 3, 'center': [121.1050, 14.7060], 'desc': 'Marikina River tributary floodplain; rapid inundation risk'},
                {'name': 'Barangay Roxas District', 'risk': 'Medium', 'level': 2, 'center': [121.0216, 14.6283], 'desc': 'Low elevation basin near Scout area creek outlets'},
                {'name': 'Barangay Doña Imelda', 'risk': 'Medium', 'level': 2, 'center': [121.0177, 14.6151], 'desc': 'Bordering San Juan River; vulnerable during heavy monsoon surges'},
                {'name': 'Barangay Batasan Hills', 'risk': 'Low', 'level': 1, 'center': [121.0945, 14.6835], 'desc': 'Elevated terrain; localized gully erosion and pocket ponding'}
            ]
        else:
            # Manila zones
            return [
                {'name': 'Barangay Sampaloc (Espana corridor)', 'risk': 'High', 'level': 3, 'center': [120.9965, 14.6075], 'desc': 'Chronic street-level flooding; primary leptospirosis cluster zone'},
                {'name': 'Barangay Tondo I & II', 'risk': 'High', 'level': 3, 'center': [120.9680, 14.6185], 'desc': 'Estero de Vitas tidal influence and high wading frequency'},
                {'name': 'Barangay Ermita - Taft Ave', 'risk': 'Medium', 'level': 2, 'center': [120.9835, 14.5815], 'desc': 'Storm drain backup; pedestrian and commuter contact risk'},
                {'name': 'Barangay Santa Ana', 'risk': 'Medium', 'level': 2, 'center': [121.0115, 14.5815], 'desc': 'Pasig River tidal bend flood zone during monsoon tides'},
                {'name': 'Barangay Paco', 'risk': 'Low', 'level': 1, 'center': [120.9945, 14.5810], 'desc': 'Estero de Paco catchment; mitigated by pumping station operations'}
            ]

    def get_health_facilities(self, key: str) -> List[Dict[str, Any]]:
        if key == 'dengue':
            return [
                {'name': 'East Avenue Medical Center (EAMC)', 'type': 'hospital', 'category': 'DOH Level 3 Tertiary', 'coords': [121.0492, 14.6398], 'role': 'Primary Dengue Fast-Lane & ICU surge hub'},
                {'name': 'National Kidney and Transplant Institute (NKTI)', 'type': 'hospital', 'category': 'DOH Specialty Tertiary', 'coords': [121.0480, 14.6476], 'role': 'Renal & hematology referral center'},
                {'name': 'Quezon City General Hospital (QCGH)', 'type': 'hospital', 'category': 'LGU Level 3 Tertiary', 'coords': [121.0182, 14.6612], 'role': '24/7 Dengue Fast-Lanes & ambulatory IV hydration bays'},
                {'name': "Philippine Children's Medical Center (PCMC)", 'type': 'hospital', 'category': 'DOH Pediatric Specialty', 'coords': [121.0398, 14.6512], 'role': 'Pediatric dengue shock syndrome (DSS) & PICU triage'},
                {'name': 'Quirino Memorial Medical Center (QMMC)', 'type': 'hospital', 'category': 'DOH Level 3 Tertiary', 'coords': [121.0724, 14.6222], 'role': 'Eastern QC tertiary referral serving Districts 3 & 4'},
                {'name': 'Novaliches District Hospital (NDH)', 'type': 'hospital', 'category': 'LGU Level 2 Hospital', 'coords': [121.0375, 14.7089], 'role': 'Northern QC dengue inpatient hydration'},
                {'name': 'Batasan Hills Super Health Center', 'type': 'health_center', 'category': 'QCHD Super Health Center', 'coords': [121.0922, 14.6816], 'role': 'NS1 rapid test kits, CBC/platelet counts & ORS hub'},
                {'name': 'Tatalon Health Center', 'type': 'health_center', 'category': 'QCHD Health Center', 'coords': [121.0142, 14.6213], 'role': 'San Juan River basin NS1 testing & 4S vector dispatch'},
                {'name': 'Bagong Silangan Health Center', 'type': 'health_center', 'category': 'QCHD Health Center', 'coords': [121.1075, 14.7065], 'role': 'Marikina floodplain fever triage & ORS staging'},
                {'name': 'Kamuning Super Health Center', 'type': 'health_center', 'category': 'QCHD Super Health Center', 'coords': [121.0422, 14.6273], 'role': 'District 4 diagnostic & outpatient hydration hub'}
            ]
        return [
            {'name': 'Philippine General Hospital (PGH)', 'type': 'hospital', 'category': 'National University Tertiary', 'coords': [120.9855, 14.5780], 'role': 'Primary acute dialysis, ICU & severe leptospirosis hub'},
            {'name': 'San Lazaro Hospital (SLH)', 'type': 'hospital', 'category': 'DOH Infectious Disease Specialty', 'coords': [120.9852, 14.6182], 'role': 'National apex infectious disease & leptospirosis pavilions'},
            {'name': 'Ospital ng Maynila Medical Center (OMMC)', 'type': 'hospital', 'category': 'LGU Level 3 Tertiary', 'coords': [120.9864, 14.5639], 'role': 'Manila LGU tertiary renal replacement therapy & ICU'},
            {'name': 'Jose R. Reyes Memorial Medical Center (JRRMMC)', 'type': 'hospital', 'category': 'DOH Level 3 Tertiary', 'coords': [120.9808, 14.6105], 'role': 'Emergency & internal medicine surge admissions'},
            {'name': 'Ospital ng Sampaloc', 'type': 'hospital', 'category': 'LGU District IV Hospital', 'coords': [120.9967, 14.6078], 'role': 'España flood corridor acute leptospirosis triage & PEP'},
            {'name': 'Ospital ng Tondo', 'type': 'hospital', 'category': 'LGU District II Hospital', 'coords': [120.9783, 14.6260], 'role': 'Estero de Vitas flood zone hospital triage'},
            {'name': 'Gat Andres Bonifacio Memorial Medical Center', 'type': 'hospital', 'category': 'LGU Level 2 District I', 'coords': [120.9648, 14.6011], 'role': 'Coastal Tondo I flood-borne disease admissions'},
            {'name': 'Sta. Ana Hospital (MIDCC)', 'type': 'hospital', 'category': 'LGU Level 2 District VI', 'coords': [121.0164, 14.5834], 'role': 'Manila Infectious Disease Control Center for Pasig River bend'},
            {'name': 'Justice Jose Abad Santos General Hospital', 'type': 'health_center', 'category': 'LGU District III PEP Hub', 'coords': [120.9772, 14.5958], 'role': 'Binondo/San Nicolas post-flood Doxycycline PEP staging'},
            {'name': 'Paco Health Center (MHD District V)', 'type': 'health_center', 'category': 'MHD Primary Health Center', 'coords': [120.9922, 14.5812], 'role': 'Estero de Paco single-dose 200mg Doxycycline PEP station'}
        ]


engine = DaloyEngine()
