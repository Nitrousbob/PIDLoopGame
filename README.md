# HVAC PID Loop Simulator

An interactive browser-based game for learning how to tune PID control loops found in building automation systems (BAS/BMS). Run real-time simulations of HVAC control loops, tune P/I/D gains, earn badges, and build intuition for what good (and bad) tuning looks like.

---

## Getting Started

### Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### No Install (Static Build)

Open `dist/index.html` directly in a browser — no server needed.

---

## How to Use

### 1. Add a Loop

Click **+ Add Loop** in the left sidebar. Choose a loop type (see below), optionally give it a name, and click **Add Loop**. You can run multiple loops simultaneously.

### 2. Set Your Gains

On the **Tune** tab, use the **P**, **I**, and **D** sliders to set your controller gains. Start with P only, then add I if needed.

- **Kp (Proportional)** — how hard the controller reacts to error right now
- **Ki (Integral)** — eliminates steady-state error over time; too much causes windup and oscillation
- **Kd (Derivative)** — dampens overshoot; useful for slow processes with dead time

### 3. Start the Simulation

Click **▶ Start**. Watch the **Chart** tab to see the setpoint (dashed line), process variable (solid line), and controller output in real time.

### 4. Read the Analysis

Switch to the **Analysis** tab at any time. The analyzer detects common tuning problems in plain English:

| Problem | What it means | Fix |
|---|---|---|
| Overshoot | PV shot past the setpoint | Reduce Kp |
| Oscillation | PV hunting back and forth | Cut Kp, reduce Ki |
| Slow Response | Takes too long to reach setpoint | Increase Kp |
| Integral Windup | I term built up too much force | Reduce Ki |
| Steady-State Error | Never quite reaches setpoint | Add or increase Ki |
| Output Saturation | Output pegged at 0% or 100% too long | Check if setpoint is achievable |

### 5. Scoring

Each loop is graded on three metrics:

- **Accuracy** (50%) — how often the PV stays within tolerance of the setpoint
- **Smoothness** (30%) — how much the output chops around (chatter penalty)
- **Speed** (20%) — how quickly the loop settles relative to its time constant

Overall grade: **S** ≥95 · **A** ≥85 · **B** ≥70 · **C** ≥55 · **D** below 55

### 6. Sim Speed & Noise

- **Sim Speed** (top bar) — run at up to 120× real time so slow loops (like zone temperature) don't take forever
- **Noise** toggle — adds realistic measurement noise to the process variable

### 7. Save / Load

Your session auto-saves to browser storage every 30 seconds. Use the **Save/Load** button in the header to manually save or load named sessions.

---

## Loop Types

| Loop | Icon | What it controls | Difficulty |
|---|---|---|---|
| Hot Water Supply | 🔥 | Boiler supply water temperature | Medium |
| Chilled Water Supply | ❄️ | Chiller supply water temperature (reverse-acting) | Medium |
| AHU Heating Coil Valve | 🔆 | Discharge air temp via HW valve at air handler | Medium |
| AHU Cooling Coil Valve | 🧊 | Discharge air temp via CHW valve at air handler (reverse-acting) | Medium |
| Supply Air Pressure | 💨 | Duct static pressure | Easy |
| Fan Speed / VFD | 🌀 | Fan VFD speed | Easy |
| Zone Temperature (VAV) | 🏢 | Room temperature via VAV box | Hard |
| Building Static Pressure | 🏗️ | Building pressurization | Medium |

**Reverse-acting loops** (Chilled Water Supply, AHU Cooling Coil Valve): the controller opens the valve more to *lower* the process variable. The PID handles this automatically — tune it the same way.

---

## Tuning Tips by Loop

**Hot Water Supply / AHU Heating Coil Valve**
- Start around Kp = 0.4–0.6. Add Ki = 0.01–0.03 if there's steady-state error.
- Watch for windup on setpoint changes — the integrator can overshoot badly if Ki is too high.

**Chilled Water Supply / AHU Cooling Coil Valve**
- Same approach as heating, but expect the PV to move in the opposite direction from the output.
- A Kp of 0.5–0.8 is a good starting point.

**Supply Air Pressure**
- Fast loop — Kp can be much higher (3–8). Aggressive tuning is normal here.
- Add Ki = 0.1–0.5 to hold pressure steady against VAV demand swings.

**Fan VFD**
- Very fast (τ = 3s). Kp = 3–8 is typical. Usually doesn't need Ki or Kd.

**Zone Temperature (VAV)**
- Very slow loop (τ = 300s, dead time = 30s). Kp = 0.5–1.5, Ki ≤ 0.01.
- Be patient — use high sim speed. Overshoot and oscillation take a long time to show up.

**Building Static Pressure**
- Tiny engineering units (0.05 in H₂O setpoint). Kp needs to be large (15–40) to get any response.
- Fast loop — reacts to door opens in seconds.

---

## Badges

Earn badges by hitting performance targets on your loops. Each badge is worth +100 points.

| Badge | How to earn |
|---|---|
| No Overshoot | <5% peak overshoot with accuracy >60% |
| Smooth Operator | Smoothness score ≥90 |
| Speed Demon | Speed score ≥90 |
| Steady State Master | Accuracy ≥95% |
| Integral Tamer | 120 seconds with zero windup events |
| Cold Start Pro | Overall score ≥85 from startup |
| Perfect Tune | Overall score ≥95 (S grade) |
| Pressure Pro | Pressure loop with score ≥85 |
| Multi-Loop Master | 3+ loops running green simultaneously |

---

## Development

```bash
npm run dev      # Dev server with hot reload
npm run build    # Production build → dist/
npm run lint     # ESLint check
npm run preview  # Preview production build
```
