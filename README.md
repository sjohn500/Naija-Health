# NaijaHealth AI 🇳🇬🏥

NaijaHealth AI is an enterprise-grade, empathetic medical triage assistant and emergency care routing web application engineered specifically to bridge healthcare accessibility gaps across Nigeria's 36 states and the FCT.

Built using **React, TypeScript, Node.js**, and the **Google Gemini 2.5 Flash API**, the system acts as a digital first-point-of-contact, interpreting symptoms across localized socio-cultural contexts and providing structured, safe, and actionable health guidance.

---

## 🚀 Core Features

### 🩺 1. Structured 3-Part Triage Architecture
- **[Potential Causes]:** Translates symptoms cleanly using relatable Nigerian healthcare contexts (e.g., malaria/typhoid awareness, "purging", sickle cell precautions, and cholera prevention).
- **[Home Management]:** Provides strict, medically verified first-aid workflows (such as exact WHO/UNICEF Oral Rehydration Solution formulation: 1 level tsp salt + 10 level tsps sugar in 1L clean water).
- **[Action Plan]:** Instructs users exactly when and where to seek physical care.

### 🚨 2. Fail-Safe Emergency Interceptors
- Continuous background evaluation for high-severity red flags (e.g., chest pain, respiratory distress, stroke-like weakness, heavy bleeding).
- Instantly bypasses standard LLM processing loops to activate the `EmergencyModal`, showcasing crucial national hotlines (National 112, NCDC 6232) and state-specific response units.

### 🌍 3. Multi-Lingual & Digital Accessibility
- Voice-to-Text integration using **Web Speech Recognition** allows users to dictate symptoms naturally in English, Nigerian Pidgin, Hausa, Yoruba, or Igbo.
- Text-to-Speech (Audio Narration) streams triage advice back vocally, eliminating reading and literacy barriers.

### 🗺️ 4. Localized Care Routing Directory
- Integrated geographic database mapping users dynamically across all 36 Nigerian states to verified General Hospitals, Teaching Hospitals, and Federal Medical Centres (FMCs).
- Features clickable direct-call hooks and automated Google Maps navigation triggers.

---

## 🛠️ The Architecture & Tech Stack

- **Frontend Component Layer:** React 18 with TypeScript for type-safe UI management.
- **Styling Framework:** Tailwind CSS for a mobile-first, responsive, lightweight layout optimized for low-data network environments.
- **Intelligence Orchestration:** Google GenAI SDK (Gemini 2.5 Flash) managed via a secure backend wrapper to protect system credentials.
- **State & Memory Management:** Native react hooks combined with structural context layers to retain conversation memory seamlessly across symptom threads.
- **Deployment Targets:** Render (Fullstack Web Service), Cloud Run, Vercel / Railway.

---

## ☁️ How to Deploy on Render (Step-by-Step)

Because this app is a **full-stack application** (Express API + Vite React client served on one port), it deploys cleanly to Render as a **Web Service**:

### Option 1: Automatic Blueprint (using `render.yaml`)
1. Push this project to your **GitHub** account.
2. Go to your [Render Dashboard](https://dashboard.render.com/) and click **New + > Blueprint**.
3. Connect your repository. Render will automatically read `render.yaml`.
4. Enter your `GEMINI_API_KEY` under Environment Variables and click **Apply**.

### Option 2: Manual Web Service Setup
1. On [Render](https://dashboard.render.com/), click **New + > Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name:** `naijahealth-ai` (or your chosen name)
   - **Language / Runtime:** `Node`
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. In the **Environment Variables** section, add:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
5. Click **Deploy Web Service**.
6. Render will build the Vite frontend into `dist/`, launch `server.ts`, and give you a free HTTPS live URL:
   `https://naijahealth-ai.onrender.com`

