# Questrix — Your AI Study Buddy 🎓✨

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Express-5.0-green?style=for-the-badge&logo=express)](https://expressjs.com/)
[![AI Engine](https://img.shields.io/badge/Google%20Gemini-Multimodal-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)

> **“Your AI Study Buddy”** — Questrix is a production-ready, multimodal AI-powered learning platform designed for students from Middle School to University and Competitive Exam preparation. Scan any question, understand step-by-step derivations, practice similar problems, take adaptive quizzes, and master STEM concepts in both **English and Urdu (اردو)**.

---

## 🌟 Key Features

### 1. 📸 Smart Question Scanner & Multimodal Solver
- **Live Camera / Photo Upload / Text Input**: Capture homework directly from your webcam, upload pictures or notes, or paste equations.
- **Step-by-Step Derivations**: Numbered solution steps detailing the exact arithmetic, formulas, and laws applied.
- **Pedagogical Math & STEM Engine**: Built-in deterministic calculator solving basic arithmetic (`2+2=4`, `15*4`), order of operations (BODMAS/PEMDAS), linear equations (`2x+5=15 ⟹ x=5`), and quadratic roots ($ax^2+bx+c=0$) even if cloud AI is rate-limited.
- **Bilingual Urdu Mode (اردو میں سمجھیں)**: Full Urdu RTL explanation with Nastaliq typography.
- **"Explain Simpler" & Alternative Methods**: Breaks down complex mathematics into intuitive concepts and alternative analytical models (e.g., number lines, factoring vs. quadratic formula).
- **Practice Similar Problems**: Instant analogous practice questions with revealable hints and verified solutions.

### 2. 💬 Bilingual Conversational AI Tutor
- Multi-turn study companion with quick-action prompts: *"Explain simpler"*, *"Give a real-world example"*, *"Quiz me on this"*, *"اردو میں سمجھائیں"*.
- Context retention for follow-up questions on any previously solved problem.

### 3. 📝 Adaptive Quiz Generator & Diagnostics
- Generates 4-choice MCQs tailored to any subject and difficulty level (Easy, Medium, Hard).
- Real-time timer, answer evaluation, celebratory mastery confetti, weak topic detection, and personalized study recommendations.

### 4. 🗂️ Notes & Document Summarizer
- Paste study notes or upload documents to extract executive summaries, high-yield bullet points, and core definitions.
- Convert summaries into active flashcard decks with a single tap.

### 5. 🎴 3D Flip Flashcards with Spaced Repetition
- Interactive cards with smooth 3D flip animations.
- Spaced repetition algorithm tracking difficulty ratings (*Easy*, *Hard*, *Review Again*).

### 6. 📅 Smart Exam Planner
- Generates personalized study calendars based on your exam date, daily study hours, and knowledge level.
- Interactive daily checklists with streak tracking.

### 7. 🔐 Google OAuth & Identity Sign-In
- **"Continue with Google"**: Seamless sign-in with Google Account IDs using Google Identity Services (GSI).
- Email login and one-click guest mode.

### 8. 💎 Pro Entitlements & Monetization Architecture
- Built-in Free vs. Pro tier management with daily scan quotas, unlimited problem solving, and instant upgrade flows.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18 or newer)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/questrix-study-buddy.git
cd questrix-study-buddy
npm install
```

### 2. Configure Environment Variables
Copy the template file:
```bash
cp .env.example .env
```
Edit `.env` and insert your Google Gemini API key:
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
JWT_SECRET=your_secret_key_here
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

### 3. Run the Development Server
```bash
# Start backend server
npm run server

# In a separate terminal, start frontend with Vite
npm run dev
```
Open **`http://localhost:5000`** in your browser.

---

## 🌐 Deploy to Vercel (Step-by-Step Guide)

Questrix is configured out-of-the-box for zero-configuration Vercel deployment using Express Serverless Functions and Vite SPA builds.

### Step 1: Push Your Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Questrix AI Study Buddy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/questrix.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** ➔ **"Project"**.
3. Select your `questrix` repository and click **"Import"**.
4. Vercel will automatically detect the Vite framework and use:
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables in Vercel
In the Vercel project configuration, expand **Environment Variables** and add:
| Key | Description | Example |
|---|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API Key | `AIzaSy...` |
| `JWT_SECRET` | Secret token string for sessions | `questrix_secure_key_2026` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `12345...apps.googleusercontent.com` |
| `NODE_ENV` | Environment mode | `production` |

### Step 4: Deploy!
Click **"Deploy"**. Vercel will compile the Vite frontend into `/dist` and serve all `/api/*` endpoints through the serverless function in `api/index.ts`.

---

## 🔑 Setting Up Google OAuth (Google Sign-In)

To enable the **"Continue with Google"** button with your own Google Cloud credentials:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **"Questrix Study Assistant"**.
3. Go to **APIs & Services** ➔ **OAuth consent screen**:
   - User Type: **External**
   - App Name: **Questrix**
   - Add your support email and developer contact email.
4. Go to **APIs & Services** ➔ **Credentials**:
   - Click **Create Credentials** ➔ **OAuth client ID**.
   - Application Type: **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:5000` (for local development)
     - `https://your-questrix-app.vercel.app` (your Vercel domain)
   - Click **Create**.
5. Copy the generated **Client ID** (e.g., `123456789-abc.apps.googleusercontent.com`).
6. Paste it into:
   - Your local `.env`: `VITE_GOOGLE_CLIENT_ID=your_client_id`
   - Your Vercel Environment Variables: `VITE_GOOGLE_CLIENT_ID`

---

## 📁 Repository Structure

```
├── api/
│   └── index.ts                 # Vercel Serverless Function entry point
├── server/
│   ├── index.ts                 # Express 5 REST API & routes
│   ├── db/
│   │   └── database.ts          # Relational atomic JSON store
│   ├── services/ai/
│   │   ├── ai.interface.ts      # Core AI provider contracts
│   │   ├── gemini.provider.ts   # Google Gemini multimodal integration
│   │   ├── heuristic.provider.ts# Resilient pedagogical fallback engine
│   │   ├── math.engine.ts       # Deterministic Math & Science calculation engine
│   │   └── ai.service.ts        # AI Service coordinator
│   └── test-e2e.js              # 14-test end-to-end integration test suite
├── src/
│   ├── components/              # Reusable modern UI components
│   │   ├── Header.tsx           # Brand, streak counter, language switcher
│   │   ├── Sidebar.tsx          # Desktop navigation
│   │   ├── BottomNav.tsx        # Mobile navigation bar
│   │   ├── ScanModal.tsx        # WebRTC camera, file dropzone & question input
│   │   ├── SolutionView.tsx     # Step-by-step derivation & action controls
│   │   ├── TutorView.tsx        # Bilingual conversational AI tutor
│   │   ├── QuizView.tsx         # 4-choice interactive test engine
│   │   ├── NotesView.tsx        # AI document summarizer
│   │   ├── FlashcardsView.tsx   # 3D spaced-repetition flip cards
│   │   ├── PlannerView.tsx      # Exam countdown & task checklist
│   │   ├── ProgressView.tsx     # Diagnostics, accuracy & bookmarks
│   │   ├── AuthModal.tsx        # Google OAuth & email authentication
│   │   └── UpgradeModal.tsx     # Pro tier subscription modal
│   ├── context/                 # React state contexts (Auth, Theme)
│   ├── styles/
│   │   ├── design-tokens.css    # Colors, fonts, radius, shadows (Light/Dark)
│   │   └── global.css           # Vanilla CSS layout & animations
│   ├── App.tsx                  # Tab routing & application coordinator
│   └── main.tsx                 # React entrypoint
├── vercel.json                  # Vercel deployment configuration
└── package.json                 # Project dependencies & scripts
```

---

## 🛡️ License

MIT License. Open-source and educational use. Built for students worldwide.
