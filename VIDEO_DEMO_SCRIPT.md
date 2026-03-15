# CarrierIQ Demo Video Script & Click Guide

## 📺 Video Duration: 8-10 minutes
---

## **SECTION 1: INTRO (0:00 - 1:00)**

**SCRIPT:**
"Hello, I'm showing you CarrierIQ—an AI-powered platform that solves the chaos of freight procurement. 
Instead of picking carriers based on gut instinct, CarrierIQ uses machine learning and multi-agent AI 
to intelligently rank carriers and explain every decision. Let me show you how it works."

**ACTION:** 
- Keep this as a voiceover / title card (no clicking needed)
- Duration: 30-45 seconds

---

## **SECTION 2: DASHBOARD OVERVIEW (1:00 - 2:30)**

**SCRIPT:**
"The platform has a sleek dashboard where you can see all your carriers ranked by performance. 
Notice the 3D visualization showing each carrier's network health. Green means healthy, orange means risk."

**CLICKS:**
1. **Open:** http://localhost:5173
   - Wait for page to load (~2 seconds)
   - Point to the 3D globe on the left side
   - Mention: "Live supply chain map showing carrier routes"

2. **Scroll Down** on the dashboard
   - Show the carrier rankings table
   - Point to: Score %, Delay Risk, Reliability metrics
   - Timing: 20-30 seconds

3. **Click on ANY carrier card** (e.g., first carrier in list)
   - Shows detailed metrics popup
   - Timing: 10-15 seconds
   - Say: "Each carrier has detailed metrics—OTD rate, damage rate, capacity, cost, and more"

---

## **SECTION 3: THE SCORING SYSTEM - LIVE API DEMO (2:30 - 4:30)**

**SCRIPT:**
"Under the hood, we're using a combination of TOPSIS (multi-criteria decision making) and XGBoost 
machine learning to score carriers. But the real magic is our multi-agent system where specialized 
AI agents debate the best choice."

**CLICKS:**

1. **Open new tab:** http://localhost:8000/docs
   - Shows Swagger API documentation
   - Timing: 10 seconds
   - Say: "This is our API—fully documented and ready to test"

2. **Scroll down to "POST /api/score"** endpoint
   - Click on it to expand
   - Say: "Let's score a batch of carriers with specific priorities"

3. **Click "Try it out"** button
   - The request body will appear
   - Show the JSON structure with carriers and priorities
   - Say: "You define what matters to you—cost, reliability, speed, or quality"

4. **Modify the priorities in request body:**
   ```json
   "priorities": {
     "cost": 0.40,
     "reliability": 0.35,
     "speed": 0.15,
     "quality": 0.10
   }
   ```
   - Timing: 10 seconds
   - Say: "In this scenario, cost is 40%, reliability is 35%"

5. **Click "Execute"** button
   - The API will score the carriers
   - Wait for response (~3-5 seconds)
   - Timing: 10 seconds
   - Show the ranked output: "See how Fast Haul Express ranks #1 with 87.3% score"

---

## **SECTION 4: AGENT DEBATE - STREAMING (4:30 - 6:00)**

**SCRIPT:**
"But here's the really cool part—instead of one black-box algorithm, you see the actual debate 
between specialized AI agents. We have a Cost Agent, a Reliability Agent, and a Judge who synthesizes 
their perspectives into a final decision."

**CLICKS:**

1. **Still in Swagger, scroll to "POST /api/score/stream"** endpoint
   - Click to expand
   - Say: "This endpoint streams the real-time agent debate using Server-Sent Events"

2. **Click "Try it out"**
   - Use same carrier data as before

3. **Click "Execute"**
   - Watch the streaming response come in real-time
   - You'll see messages from:
     - "COST_AGENT: Marcus Chen analyzing..."
     - "RELIABILITY_AGENT: Dr. Amara Okonkwo analyzing..."
     - "JUDGE_SYNTHESIS: Sarah Kim synthesizing..."
   - Timing: 20-30 seconds
   - Say: "Each agent gives its perspective, then the Judge makes the final call. 
     This transparency is why procurement teams trust our recommendations."

---

## **SECTION 5: SHAP EXPLANATIONS (6:00 - 7:15)**

**SCRIPT:**
"Every ranking comes with a detailed explanation using SHAP values. This shows exactly which 
metrics pushed each carrier to the top or bottom of the list."

**CLICKS:**

1. **Scroll to "GET /api/explain"** endpoint
   - Click to expand
   - Say: "Let's get a SHAP explanation for our top-ranked carrier"

2. **Click "Try it out"**

3. **Click "Execute"**
   - Response shows SHAP values for each feature
   - You'll see something like:
     ```
     "shap_values": {
       "otd_rate": +0.28,
       "price_per_kg": -0.15,
       "damage_rate": +0.12,
       ...
     }
     ```
   - Timeout: 10 seconds
   - Say: "Positive numbers help the score, negative ones hurt it. 
     You immediately see why a carrier was chosen."

---

## **SECTION 6: WHAT-IF SIMULATOR (7:15 - 8:45)**

**SCRIPT:**
"Now, what if your priorities change? Maybe a strike is coming and you suddenly care more about 
reliability than cost. The What-If Simulator lets you adjust in real-time and see new rankings instantly."

**CLICKS:**

1. **Go back to first tab** http://localhost:5173
   - Click on "What-If Simulator" (or similar navigation button)
   - Timing: 5 seconds

2. **Look for sliders** on the page (Reliability, Cost, Speed, Quality)
   - Say: "These sliders let you adjust priorities on the fly"

3. **Drag the "Reliability" slider to the RIGHT** (increase it to 70%)
   - Drag the "Cost" slider to the LEFT (decrease it to 20%)
   - Watch the rankings change in real-time (<50ms)
   - Timing: 15 seconds
   - Say: "Notice how the rankings completely shift in under 50 milliseconds. 
     That's the power of having a pre-trained model."

4. **Drag sliders back to original positions**
   - Show the rankings return to original order
   - Timing: 10 seconds

---

## **SECTION 7: CLOSING (8:45 - 9:30)**

**SCRIPT:**
"CarrierIQ combines three powerful technologies:
1. **TOPSIS & XGBoost** - For mathematical rigor in rankings
2. **Multi-Agent AI Debate** - For transparency and trust
3. **SHAP Explanations** - So you always know WHY

This means procurement teams can finally make data-driven decisions they can actually explain 
to their leadership. No more gut instinct. No more black boxes.

CarrierIQ is ready to transform how you select carriers."

**ACTION:**
- No clicking needed
- Show final rankings one more time
- Voiceover with mission statement
- End on dashboard screenshot or logo

---

## **QUICK REFERENCE - CLICK LOCATIONS**

| Time | Component | URL | What to Click |
|------|-----------|-----|----------------|
| 1:00 | Dashboard | localhost:5173 | 3D Globe area |
| 1:30 | Dashboard | localhost:5173 | Carrier cards in table |
| 2:30 | Swagger UI | localhost:8000/docs | POST /api/score |
| 3:00 | API Payload | localhost:8000/docs | "Try it out" button |
| 3:30 | Execute | localhost:8000/docs | "Execute" button |
| 4:30 | Stream | localhost:8000/docs | POST /api/score/stream |
| 5:00 | Execute | localhost:8000/docs | "Execute" button |
| 6:00 | Explain | localhost:8000/docs | GET /api/explain |
| 6:30 | Execute | localhost:8000/docs | "Execute" button |
| 7:15 | Simulator | localhost:5173 | What-If page |
| 7:30 | Sliders | localhost:5173 | Drag Reliability slider right |
| 7:45 | Sliders | localhost:5173 | Drag Cost slider left |

---

## **PRODUCTION TIPS**

1. **Recording Software:** Use OBS Studio, ScreenFlow, or Camtasia
2. **Screen Resolution:** 1920x1080 (27" monitor at 100% zoom is ideal)
3. **Zoom Level:** Chrome DevTools might shrink text—use Ctrl+0 to reset zoom
4. **Speed:** Keep mouse movements smooth and deliberate
5. **Voice:** Speak clearly, pause between sections
6. **Loading Times:** APIs usually respond in <1 second. If slow, check backend status

---

## **TALKING POINTS TO EMPHASIZE**

✅ Saves time (no more days of manual analysis)
✅ Explainable (SHAP shows why each decision is made)
✅ Real-time (What-If simulator runs in <50ms)
✅ Trustworthy (multi-agent debate = balanced perspective)
✅ Scalable (can handle 1000+ carriers)

---

## **IF SOMETHING GOES WRONG DURING RECORDING**

- **API slow?** Check terminal—backend might be training XGBoost model on first request (~5 sec)
- **Page not loading?** Make sure both localhost:8000 and localhost:5173 are running
- **Sliders not working?** Refresh the page, then try again
- **Just restart from that section**—no need to redo entire video

---

Good luck! You've got this! 🎬
