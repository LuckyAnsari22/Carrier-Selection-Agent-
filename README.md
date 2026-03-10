# CarrierIQ: Solving the Chaos of Freight Procurement

Most people don't realize that nearly $1 trillion of freight is moved every year using nothing but gut instinct and messy Excel sheets. I built **CarrierIQ** to fix that. 

It's an intelligent selection engine that doesn't just rank carriers—it simulates a real boardroom decision. I combined mathematical ranking (TOPSIS) with predictive machine learning (XGBoost) so that logistics teams can finally stop guessing and start using data that actually makes sense.

---

### Why I built this
Procurement teams face a "Black Box" problem. They have plenty of data (OTD rates, costs, damages), but they have no way to weight them fairly. 
1. **Tribal Knowledge:** Logic like "don't use Carrier X during monsoon" stays in people's heads. If they leave, the company loses that intelligence.
2. **Analysis Paralysis:** It takes days to normalize bids from different carriers.
3. **Black Box AI:** Most AI tools just give a "score" with no explanation. No one trusts a score they can't verify.

### How it Works (The Tech)
I structured the backend to mirror a real-world procurement board using a **Multi-Agent Debate** system:
*   **The Cost Agent (Marcus):** Only cares about the bottom line and saving money.
*   **The Reliability Agent (Amara):** Only cares about network health, OTD, and damage prevention.
*   **The Judge:** Listens to both agents, reviews the ML risk predictions, and makes the final, balanced award.

Under the hood, I'm using **XGBoost** to forecast delay risks (currently hitting ~94% accuracy) and **TOPSIS** (a multi-criteria decision-making method) to ensure the rankings aren't just arbitrary.

---

### Core Features I focused on:
*   **3D Visual Intuition:** I built a 3D Supply Chain Globe using Three.js/Fiber. Healthy lanes glow green, at-risk ones turn orange. It turns a spreadsheet into something you can see.
*   **SHAP Explanations:** Every carrier rank comes with a "Why". It explains in plain English exactly which factors moved a carrier to the top spot.
*   **What-If Simulator:** You can drag sliders to shift priorities. If you need to pivot from "Cost Savings" to "Service Protection" because of a strike, you can see the new rankings in under 50ms.
*   **Automated Research:** The agents use live market signals (news, fuel spikes, weather) to adjust rankings before a problem even hits your supply chain.

---

### The Stack
I kept it modern and fast:
*   **Backend:** FastAPI (Python) for the core logic and ML.
*   **Intelligence:** Google Gemini 2.5 (for the strategic agent debate).
*   **ML Engine:** XGBoost for risk and SHAP for explainability.
*   **Frontend:** React 18 / Vite.
*   **Visuals:** Three.js & Framer Motion for the UI.

### Getting Started
I've fully Dockerized the project so you can run the whole stack (Backend + Frontend) with one command:
```bash
docker-compose up --build
```

Developed with a focus on **logic, math, and making complex data actually usable.**
