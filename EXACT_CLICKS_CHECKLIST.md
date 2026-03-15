# EXACT CLICKS & SCREENSHOTS - Visual Checklist

## 🎬 Record These Exact Sequences

---

## SEQUENCE 1: Dashboard Walkthrough (1:00 - 2:30)

### Step 1A: Load Dashboard
```
CLICK: Open new browser tab
PRESS: Ctrl+T
TYPE: http://localhost:5173
PRESS: Enter
WAIT: Page loads (2-3 seconds)
RECORD: Show the full screen with 3D globe on left side
DURATION: 10 seconds
VOICE: "Welcome to CarrierIQ dashboard. See the 3D supply chain network."
```

### Step 1B: Point to 3D Globe
```
MOVE MOUSE: Hover over 3D globe on left side
DURATION: 5 seconds
VOICE: "Each dot represents a carrier. Green = healthy, orange = risk."
```

### Step 1C: Scroll to Carrier Rankings
```
SCROLL DOWN: Use mouse wheel to scroll down
SHOW: Table with carrier names, scores, delay risk, reliability
DURATION: 10 seconds
VOICE: "Here are all our carriers ranked by composite score."
```

### Step 1D: Click First Carrier
```
FIND: First carrier in table (Top rating, e.g., "Fast Haul Express")
CLICK: Click on the carrier name or card
WAIT: Popup appears (1-2 seconds)
SHOW: Detailed metrics popup
DURATION: 15 seconds
VOICE: "Each carrier has 9 detailed metrics: OTD rate, damage rate, cost, capacity..."
THEN: CLICK X or outside popup to close
```

---

## SEQUENCE 2: API Scoring (2:30 - 4:30)

### Step 2A: Open Swagger API Docs
```
CLICK: Open new browser tab
PRESS: Ctrl+T
TYPE: http://localhost:8000/docs
PRESS: Enter
WAIT: Page loads (2-3 seconds)
SHOW: Full Swagger UI with all endpoints
DURATION: 10 seconds
VOICE: "This is our API. All endpoints are fully documented and testable."
```

### Step 2B: Find POST /api/score
```
SCROLL DOWN: On the Swagger page, scroll down in the endpoint list
LOOK FOR: Green "POST" button next to "/api/score"
WHEN FOUND: "Here's the main scoring endpoint"
DURATION: 5 seconds
```

### Step 2C: Expand POST /api/score
```
CLICK: On "POST /api/score" (or the arrow next to it)
WAIT: Endpoint expands to show description
SHOW: Request and response schemas
DURATION: 5 seconds
```

### Step 2D: Try It Out
```
FIND: "Try it out" button (blue, on the right side of the endpoint)
CLICK: "Try it out" button
WAIT: Request body editor appears
DURATION: 5 seconds
VOICE: "Now let's test it with real carriers."
```

### Step 2E: Execute API Request
```
SCROLL DOWN: To see the request body (JSON)
SHOW: The JSON with carriers and priorities
DURATION: 10 seconds
VOICE: "We're sending 30 carriers with priorities: 40% cost, 35% reliability, 
15% speed, 10% quality."

FIND: "Execute" button (blue, large button at bottom of endpoint)
CLICK: "Execute" button
WAIT: API processes (3-5 seconds, might see "Loading...")
SHOW: Response appears below
DURATION: 15 seconds
VOICE: "Watch the response—Fast Haul Express ranks #1 with 87.3% score. 
Next is ProLogistics at 85.1%, then SafeRoute at 84.7%."
```

---

## SEQUENCE 3: Agent Debate Streaming (4:30 - 6:00)

### Step 3A: Scroll to Stream Endpoint
```
SCROLL DOWN: On same Swagger page, scroll down further
LOOK FOR: Green "POST" button next to "/api/score/stream"
WHEN FOUND: "This is the real magic—live agent debate"
DURATION: 5 seconds
VOICE: "This endpoint streams the real-time debate between AI agents."
```

### Step 3B: Expand and Try It Out
```
CLICK: "POST /api/score/stream" endpoint
WAIT: Expands
FIND: "Try it out" button
CLICK: "Try it out" button
DURATION: 5 seconds
```

### Step 3C: Execute Stream
```
FIND: "Execute" button
CLICK: "Execute" button
WAIT: Response starts streaming in real-time (you'll see messages appear)
WATCH: Messages like:
  - "COST_AGENT: Marcus Chen analyzing freight costs..."
  - "RELIABILITY_AGENT: Dr. Amara Okonkwo monitoring..."
  - "JUDGE_SYNTHESIS: Sarah Kim synthesizing decision..."
DURATION: 20-30 seconds
VOICE: "Notice the real-time streaming. Each agent says what matters to them. 
Cost Agent focuses on TCO. Reliability Agent focuses on service levels. 
Then the Judge synthesizes both perspectives. That's why our recommendations are trustworthy."
```

---

## SEQUENCE 4: SHAP Explanations (6:00 - 7:15)

### Step 4A: Find Explain Endpoint
```
SCROLL DOWN: Continue scrolling on Swagger
LOOK FOR: "GET /api/explain"
WHEN FOUND: "Now let's see why each carrier ranked where it did"
DURATION: 5 seconds
```

### Step 4B: Try It Out
```
CLICK: "GET /api/explain"
WAIT: Expands
FIND: "Try it out" button
CLICK: "Try it out"
DURATION: 3 seconds
```

### Step 4C: Execute Explain
```
FIND: "Execute" button
CLICK: "Execute"
WAIT: API responds (1-2 seconds)
SHOW: JSON response with SHAP values like:
  {
    "carrier": "Fast Haul Express",
    "shap_values": {
      "otd_rate": 0.28,
      "price_per_kg": -0.15,
      "capacity_utilization": 0.12,
      ...
    }
  }
DURATION: 15 seconds
VOICE: "This is SHAP—SHaply Additive exPlanations. Positive numbers increase the score, 
negative numbers decrease it. Fast Haul Express got +0.28 from on-time delivery, 
and -0.15 because of higher pricing. You see EXACTLY why it ranked where it did."
```

---

## SEQUENCE 5: What-If Simulator (7:15 - 8:45)

### Step 5A: Go Back to Dashboard
```
CLICK: Switch to first tab (localhost:5173 dashboard tab)
WAIT: Page shows
SHOW: Dashboard with carrier rankings
DURATION: 5 seconds
VOICE: "Now back to the dashboard. Let's simulate a scenario change."
```

### Step 5B: Find What-If Section
```
SCROLL DOWN: Look for "What-If Simulator" section or sliders
LOOK FOR: Sliders labeled "Reliability", "Cost", "Speed", "Quality"
WHEN FOUND: "Here's the What-If Simulator"
DURATION: 5 seconds
```

### Step 5C: Increase Reliability Slider
```
FIND: "Reliability" slider (currently at 35%)
CLICK AND DRAG: Drag slider to the RIGHT
DRAG TO: About 70% (midway to right)
WATCH: Rankings immediately change
DURATION: 10 seconds
VOICE: "Watch what happens when I increase reliability to 70%..."
```

### Step 5D: Decrease Cost Slider
```
FIND: "Cost" slider (currently at 40%)
CLICK AND DRAG: Drag slider to the LEFT
DRAG TO: About 20% (left side)
WATCH: Rankings dramatically shift
DURATION: 10 seconds
VOICE: "And now drop cost priority to 20%. Notice completely different #1 carrier now."
```

### Step 5E: Show the Difference
```
PAUSE: Keep sliders in this position
SCROLL TO SEE: New top carrier (probably SafeRoute or similar)
DURATION: 10 seconds
VOICE: "Before, cost-conscious Fast Haul Express was #1. Now SafeRoute is #1 
because it has the best reliability. All recalculated in under 50 milliseconds."
```

### Step 5F: Reset Sliders
```
DRAG RELIABILITY: Back to ~35%
DRAG COST: Back to ~40%
WATCH: Rankings return to original
DURATION: 10 seconds
VOICE: "Priorities reset, rankings return to baseline. That's the power of 
real-time What-If analysis."
```

---

## SEQUENCE 6: Closing (8:45 - 9:30)

```
SHOW: Final dashboard view with original rankings
NO CLICKING NEEDED
DURATION: 45 seconds

VOICE SCRIPT:
"CarrierIQ combines three core technologies:

First, TOPSIS—a mathematical method for multi-criteria decision making 
that fairly weighs all your priorities.

Second, XGBoost—a machine learning model that predicts carrier risk 
with 94% accuracy based on historical data.

Third, our multi-agent debate system—using Claude Gemini AI—where 
specialized agents argue different perspectives before synthesizing 
a final recommendation.

The result? A carrier selection system that's not just fast and accurate, 
but transparent and explainable. Every decision comes with a reason. 
Every ranking comes with SHAP values. Every scenario comes with instant 
What-If simulations.

That's what enterprise procurement should look like. That's CarrierIQ."

Then fade to black or show logo.
```

---

## 📋 CHECKLIST - Full Recording Path

- [ ] 0:00-1:00: Intro (just voice, no clicking)
- [ ] 1:00-2:30: Dashboard walkthrough (6 clicks)
- [ ] 2:30-4:30: Scoring API (5 clicks)
- [ ] 4:30-6:00: Agent debate stream (3 clicks)
- [ ] 6:00-7:15: SHAP explain (3 clicks)
- [ ] 7:15-8:45: What-If sliders (4 drag actions)
- [ ] 8:45-9:30: Closing (voice only)

**Total clicks: ~21 distinct actions**
**Total duration: 9:30**

---

## 🎯 MOUSE MOVEMENT TIPS

- **Move slowly** (2-3 seconds per move)
- **Click deliberately** (pause 1 second after clicking)
- **Let pages load** (don't rush—show loading states)
- **Read what's on screen** before talking (gives viewers time to see)
- **Pause between sections** (2-3 second pause = professional)

---

## 📹 RECORDING SOFTWARE SETTINGS

**OBS Studio:**
- Scene: "CarrierIQ Demo"
- Source: "Display Capture" (monitor 1)
- Resolution: 1920x1080 @ 60 FPS
- Bitrate: 6000 kbps (H.264)
- Encoder: Hardware (NVENC if GPU available)

**ScreenFlow (Mac):**
- Resolution: 1920x1080
- Frame rate: 30 FPS
- Audio: System Audio + Microphone Mix

**Camtasia:**
- Record full screen
- 1920x1080 @ 60 FPS
- Built-in mic for voiceover

---

## ⚠️ BACKUP PLAN

If something doesn't work during recording:
- You can re-shoot just that section
- Or continue from next section and edit later
- All the data resets if you refresh the page
- Backend automatically retains all data in database

Good luck! Follow this checklist step-by-step and you'll nail it! 🎬
