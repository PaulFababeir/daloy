import numpy as np
import pandas as pd
from datetime import datetime

def make_row(rain_mm, prev_rain_mm, month):
    return [
        np.log1p(rain_mm),                    
        np.log1p(prev_rain_mm),               
        np.sin(2 * np.pi * month / 12),       
        np.cos(2 * np.pi * month / 12),      
    ]

def n_weeks_in_month(month):
    year = datetime.now().year
    days = pd.date_range(f"{year}-{month:02d}-01", periods=pd.Timestamp(year, month, 1).days_in_month)
    return int((days.day_of_week == 0).sum()) 