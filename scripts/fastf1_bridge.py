import os
import sys
import json
import argparse
import traceback

# Setup argparse
parser = argparse.ArgumentParser(description="RaceCtrl FastF1 Bridge")
parser.add_argument("--year", type=int, required=True, help="Year of the session")
parser.add_argument("--round", type=int, required=True, help="Round number")
parser.add_argument("--session", type=str, required=True, help="Session type (FP1, FP2, FP3, SQ, S, Q, R)")
args = parser.parse_args()

try:
    import fastf1
    import pandas as pd
    import numpy as np
except ImportError:
    print(json.dumps({"success": False, "error": "FastF1 or dependencies are not installed in the Python environment."}))
    sys.exit(1)

# Helper to format timedelta to a readable string (M:SS.fff)
def format_timedelta(td):
    if pd.isna(td) or not isinstance(td, pd.Timedelta):
        return None
    total_seconds = td.total_seconds()
    minutes = int(total_seconds // 60)
    seconds = total_seconds % 60
    if minutes > 0:
        return f"{minutes}:{seconds:06.3f}"
    else:
        return f"{seconds:.3f}"

def format_race_gap(time_val, is_leader=False):
    if pd.isna(time_val):
        return None
    if isinstance(time_val, pd.Timedelta):
        total_seconds = time_val.total_seconds()
        if is_leader:
            minutes = int(total_seconds // 60)
            seconds = total_seconds % 60
            hours = int(minutes // 60)
            minutes = minutes % 60
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:06.3f}"
            return f"{minutes}:{seconds:06.3f}"
        else:
            return f"+{total_seconds:.3f}s"
    return str(time_val)

def main():
    year = args.year
    round_num = args.round
    session_code = args.session

    # Enable raw requests caching to local directory
    os.makedirs(".fastf1_raw_cache", exist_ok=True)
    fastf1.Cache.enable_cache(".fastf1_raw_cache")

    cache_dir = os.path.join("data", "fastf1_cache")
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = os.path.join(cache_dir, f"session_{year}_{round_num}_{session_code}.json")

    # If cache exists, we can print it and exit
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                print(f.read())
            return
        except Exception:
            pass

    try:
        # Load FastF1 session
        session = fastf1.get_session(year, round_num, session_code)
        
        # Load session data
        # For practice sessions, we load laps, but we can skip full telemetry if we want it to be faster
        # But we do need telemetry for the fastest lap comparison, so we load telemetry as well.
        session.load(laps=True, telemetry=True, weather=False)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Failed to load session from FastF1: {str(e)}",
            "details": traceback.format_exc()
        }))
        sys.exit(0)

    # 1. Resolve session metadata info
    info = {
        "year": year,
        "round": round_num,
        "sessionCode": session_code,
        "sessionName": session.event["EventName"],
        "sessionType": session.name,
        "circuitName": session.event["OfficialEventName"],
        "date": session.date.strftime("%Y-%m-%d") if pd.notna(session.date) else ""
    }

    # 2. Extract classification
    classification = []
    
    # We group by session type: Race and Sprint use final results table; practice and qualifying use lap timings
    is_race_type = session_code in ["R", "S"]
    
    if is_race_type and session.results is not None and not session.results.empty:
        # Sort results by position
        results_df = session.results.sort_values(by="Position")
        leader_time = None
        
        for idx, row in results_df.iterrows():
            pos = int(row["Position"]) if pd.notna(row["Position"]) else idx + 1
            pos_text = str(pos)
            status_str = str(row.get("Status", "Finished"))
            status_lower = status_str.lower()
            classified = row.get("Classified", True)
            
            if not classified or status_lower in ["retired", "accident", "collision", "power unit", "engine", "gearbox", "brakes", "suspension", "puncture", "spinned"]:
                pos_text = "R"
            if "disqualified" in status_lower or "dsq" in status_lower:
                pos_text = "DSQ"
            elif "did not start" in status_lower or "dns" in status_lower:
                pos_text = "DNS"
            elif "not classified" in status_lower or "nc" in status_lower:
                pos_text = "NC"
            
            # Format gap to leader
            raw_time = row["Time"]
            gap_str = ""
            if idx == 0:
                leader_time = raw_time
                gap_str = format_race_gap(raw_time, is_leader=True) if pd.notna(raw_time) else "Finished"
            else:
                gap_str = format_race_gap(raw_time, is_leader=False) if pd.notna(raw_time) else str(row["Status"])
            
            # Find driver's fastest lap
            fastest_lap_time = None
            if session.laps is not None and not session.laps.empty:
                drv_laps = session.laps.pick_driver(row["Abbreviation"])
                if not drv_laps.empty:
                    fastest_lap = drv_laps.pick_fastest()
                    if fastest_lap is not None:
                        fastest_lap_time = format_timedelta(fastest_lap["LapTime"])
            
            classification.append({
                "position": pos,
                "positionText": pos_text,
                "driverNumber": str(row["DriverNumber"]),
                "driverCode": str(row["Abbreviation"]),
                "driverName": f"{row['FirstName']} {row['LastName']}".strip(),
                "team": str(row["TeamName"]),
                "gap": gap_str or "—",
                "status": str(row["Status"]),
                "fastestLapTime": fastest_lap_time or "—",
                "points": float(row["Points"]) if pd.notna(row["Points"]) else 0.0
            })
    else:
        # Practice or Qualifying - rank by fastest lap time from laps dataframe
        if session.laps is not None and not session.laps.empty:
            drivers_fastest = []
            
            for drv in session.drivers:
                drv_laps = session.laps.pick_driver(drv)
                if drv_laps.empty:
                    continue
                
                fastest_lap = drv_laps.pick_fastest()
                if fastest_lap is not None and pd.notna(fastest_lap["LapTime"]):
                    try:
                        drv_info = session.get_driver(drv)
                        code = drv_info["Abbreviation"]
                        name = drv_info["FullName"]
                        team = drv_info["TeamName"]
                    except Exception:
                        # Fallback if get_driver fails
                        code = str(drv)
                        name = f"Driver {drv}"
                        team = "Unknown"
                        
                    drivers_fastest.append({
                        "driverNumber": str(drv),
                        "driverCode": str(code),
                        "driverName": str(name),
                        "team": str(team),
                        "best_lap_td": fastest_lap["LapTime"],
                        "fastestLapTime": format_timedelta(fastest_lap["LapTime"]),
                        "sector1": format_timedelta(fastest_lap["Sector1Time"]),
                        "sector2": format_timedelta(fastest_lap["Sector2Time"]),
                        "sector3": format_timedelta(fastest_lap["Sector3Time"]),
                        "compound": str(fastest_lap["Compound"]).upper() if pd.notna(fastest_lap["Compound"]) else "—"
                    })
            
            # Sort by best lap time
            drivers_fastest.sort(key=lambda x: x["best_lap_td"])
            
            # Format classification with relative gaps
            leader_lap_td = drivers_fastest[0]["best_lap_td"] if drivers_fastest else None
            
            for pos, item in enumerate(drivers_fastest, start=1):
                gap_str = "Interval" if pos == 1 else ""
                if pos > 1 and leader_lap_td is not None:
                    diff_td = item["best_lap_td"] - leader_lap_td
                    gap_str = f"+{diff_td.total_seconds():.3f}s"
                
                classification.append({
                    "position": pos,
                    "positionText": str(pos),
                    "driverNumber": item["driverNumber"],
                    "driverCode": item["driverCode"],
                    "driverName": item["driverName"],
                    "team": item["team"],
                    "gap": gap_str,
                    "status": "Active" if item["fastestLapTime"] else "No Time",
                    "fastestLapTime": item["fastestLapTime"] or "—",
                    "sector1": item["sector1"] or "—",
                    "sector2": item["sector2"] or "—",
                    "sector3": item["sector3"] or "—",
                    "points": 0.0
                })
        else:
            # Fallback using results table if laps is empty
            for idx, row in session.results.iterrows():
                classification.append({
                    "position": idx + 1,
                    "positionText": str(idx + 1),
                    "driverNumber": str(row["DriverNumber"]),
                    "driverCode": str(row["Abbreviation"]),
                    "driverName": f"{row['FirstName']} {row['LastName']}".strip(),
                    "team": str(row["TeamName"]),
                    "gap": "—",
                    "status": str(row["Status"]),
                    "fastestLapTime": "—",
                    "points": 0.0
                })

    # 3. Extract Stints
    stints = {}
    if session.laps is not None and not session.laps.empty:
        for drv in session.drivers:
            try:
                drv_info = session.get_driver(drv)
                code = drv_info["Abbreviation"]
            except Exception:
                code = str(drv)
                
            drv_laps = session.laps.pick_driver(drv)
            if drv_laps.empty:
                continue
                
            driver_stints = []
            unique_stints = sorted(drv_laps["Stint"].unique())
            for stint in unique_stints:
                stint_laps = drv_laps[drv_laps["Stint"] == stint]
                if stint_laps.empty:
                    continue
                compound = stint_laps["Compound"].iloc[0]
                if pd.isna(compound):
                    compound = "UNKNOWN"
                
                lap_nums = stint_laps["LapNumber"].astype(int)
                driver_stints.append({
                    "stintNumber": int(stint),
                    "compound": str(compound).upper(),
                    "lapCount": int(len(stint_laps)),
                    "startLap": int(lap_nums.min()),
                    "endLap": int(lap_nums.max())
                })
            stints[code] = driver_stints

    # 4. Downsampled Telemetry of the session's overall fastest lap
    telemetry = None
    if session.laps is not None and not session.laps.empty:
        try:
            fastest_lap = session.laps.pick_fastest()
            if fastest_lap is not None and pd.notna(fastest_lap["LapTime"]):
                tel_df = fastest_lap.get_telemetry()
                if tel_df is not None and not tel_df.empty:
                    # downsample to exactly 100 points
                    indices = np.linspace(0, len(tel_df) - 1, 100, dtype=int)
                    downsampled = tel_df.iloc[indices]
                    
                    gear_col = "nGear" if "nGear" in downsampled.columns else ("Gear" if "Gear" in downsampled.columns else None)
                    telemetry = {
                        "driverCode": str(fastest_lap["Driver"]),
                        "lapTime": format_timedelta(fastest_lap["LapTime"]),
                        "distance": downsampled["Distance"].fillna(0).tolist(),
                        "speed": downsampled["Speed"].fillna(0).tolist(),
                        "throttle": downsampled["Throttle"].fillna(0).tolist(),
                        "brake": downsampled["Brake"].fillna(False).astype(bool).tolist(),
                        "gear": downsampled[gear_col].fillna(0).astype(int).tolist() if gear_col else [0]*100
                    }
        except Exception as tel_err:
            # If telemetry loading fails, skip it but do not fail the whole script
            sys.stderr.write(f"Telemetry warning: {str(tel_err)}\n")
            traceback.print_exc(file=sys.stderr)

    # Save to JSON cache
    output_data = {
        "success": True,
        "info": info,
        "classification": classification,
        "stints": stints,
        "telemetry": telemetry
    }

    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(json.dumps(output_data, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
