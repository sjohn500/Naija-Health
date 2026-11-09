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
- **Deployment Targets:** Vercel (Frontend Hosting) & Render / Railway (Backend Node.js API Service).
