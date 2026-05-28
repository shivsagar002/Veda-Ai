# VedaAI: Next-Gen AI Teacher Assessment & Assignment Suite

VedaAI is a state-of-the-art, high-fidelity curriculum generation and assessment platform designed for modern educators. By leveraging the industry’s latest artificial intelligence, VedaAI automates the creation of high-quality, syllabus-aligned question papers, grading rubrics, and detailed answer keys in seconds.

Designed with a premium, responsive interface inspired by modern design principles (clean typography, glassmorphism, harmonious color palettes, and fluid animations), VedaAI looks stunning across both desktop and mobile screens.

---

## 🌟 Key Features

### 1. Academic Analytics Dashboard
- **Dynamic KPI Metrics Cards**: Real-time counters showing **Total Assessments** created, **Unique Subjects** covered, **Questions Formulated** across all worksheets, and the **Average Exam Marks** across the curriculum.
- **Assessment Matrix Table**: An interactive, beautifully styled administrative data table listing all generated papers with status metrics, dynamic subject badges, question/marks breakdowns, due dates, and quick view/delete actions.
- **Subject Analytics Visualization**: Sleek, CSS-only horizontal charts illustrating percentage distribution and topic diversity index scores across the generated material.

### 2. Dynamic AI-Powered Question Paper Generation
- **Syllabus & Curriculum Alignment**: Custom-built prompts direct the AI to behave as a professional curriculum specialist matching specific class grades and subjects (CBSE, NCERT, and custom standards).
- **Vision-Enriched Context Ingestion**: Drag-and-drop or upload course PDFs and textbook images. The AI utilizes advanced multimodal vision processing to parse pages, extract diagrams, and construct contextually perfect assignments.
- **Granular Customization**: Tailor assessments down to the finest detail. Educators can customize:
  - **Question Types**: Multiple Choice (MCQ), Short Questions, Numerical Problems, Diagram-Based questions, Long Essays, Fill-in-the-Blanks, Match the Following, and True/False.
  - **Difficulty Scaling**: Easy, Moderate, or Hard presets.
  - **Marking Systems**: Assign custom weightage (marks) to individual sections.
  - **Metadata Integration**: Dynamically inserts school boards, name headers, and specific exam instructions.

### 3. Section-Wise Interactive Answer Keys
- Grouped neatly by section headers (e.g., *Section A: Multiple Choice Questions*, *Section B: Short Questions*).
- Indices reset to `1` for each individual section (Q1, Q2, etc.), aligning perfectly with how students view the printed papers.
- Interactive toggle controls allow teachers to hide or reveal answer keys in a single click on the web dashboard.

### 4. Print-Grade PDF Compiler
- Compiles elegant, printable exam papers dynamically in the backend.
- **Institutional Branding**: Embeds school board name, branch sub-labels, dynamic page numbers ("Page X of Y"), and signature fields in the footer.
- Spaciously outputs sections, markings, instructions, and grouped answer keys at the end.

### 5. Resilient Hybrid Architecture
- **Real-Time BullMQ Queue System**: Employs redis-backed message workers for parallel, background AI generation and compilation tasks.
- **Fail-Safe Offline Mode**: Detects connection interruptions to Redis instantly using active tracking. If Redis is offline, the app seamlessly bypasses the queue and runs secure synchronous generators locally to prevent interface hangs.
- **Resilient AI Parsing**: Features a Markdown JSON extractor that cleanly isolates response structures from model blocks, eliminating parser exceptions.

### 6. High-Fidelity UI/UX
- **Smooth Navigation**: Optimized client-side routing using a Next.js Server-Client boundary refactor, delivering instant, zero-reload page transitions.
- **Mobile Harmony**: Tailored viewport heights, elevated layout actions, hidden duplicate headers, and natural scrolling mobile top-bars.

---

## 🛠️ Tool & Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS (Curated harmony, sleek transitions, glassmorphism)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: Lucide React
- **Animations**: CSS Keyframes + `canvas-confetti`

### Backend
- **Runtime**: Node.js & TypeScript (`ts-node-dev`)
- **Server Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Message Broker & Queue**: BullMQ & Upstash Redis (Secure TLS support)
- **AI Core**: Google Gemini 3.5 Flash (Stable Production API v1)
- **PDF Compilation**: PDF-Kit / custom document pipeline

---

## 🚀 Setup & Installation Instructions

Follow these steps to set up and run VedaAI locally or on a production server.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Running instance or MongoDB Atlas URI)
- [Redis](https://redis.io/) (Local instance, or an Upstash Redis database URL)
- [Google Gemini API Key](https://aistudio.google.com/)

---

### Step-by-Step Guide

#### 1. Clone & Open the Workspace
Open your preferred terminal inside the workspace directory (`d:\VEDA AI`).

#### 2. Set Up the Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend` directory and add the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/veda-ai # or your mongodb+srv:// url
   REDIS_URL=redis://127.0.0.1:6379  # Or your secure Upstash rediss:// URL
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # For Production Deployment: Add the deployed client app's URL for secure CORS connectivity
   FRONTEND_URL=https://your-veda-ai-frontend.com
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server runs on [http://localhost:5000](http://localhost:5000).*

#### 3. Set Up the Frontend
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `frontend` directory and add the following client environment variable:
   ```env
   # For Production Deployment: Point the frontend to the deployed Express backend url
   NEXT_PUBLIC_API_URL=https://your-veda-ai-backend-api.com
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The client app runs on [http://localhost:3000](http://localhost:3000).*

---

## 📁 Repository Structure

```
veda-ai/
├── backend/                  # Express REST API & AI Workers
│   ├── src/
│   │   ├── config/           # DB & Redis connection setups
│   │   ├── models/           # Mongoose Database schemas
│   │   ├── queues/           # BullMQ queue & worker processors
│   │   ├── routes/           # REST API Route declarations
│   │   └── services/         # Gemini AI & PDF Kit service logic
│   └── package.json
├── frontend/                 # Next.js App Router Client
│   ├── src/
│   │   ├── app/              # Router pages (Assignments, Toolkit, Create)
│   │   ├── components/       # Shared UI components (Sidebar, TopBar)
│   │   ├── hooks/            # Custom hooks (useWebSocket)
│   │   └── store/            # Zustand global state management
│   └── package.json
└── README.md                 # Complete project documentation
```

---

## ☁️ Render.com Production Deployment Guide (Free Tier)

This step-by-step guide explains how to deploy VedaAI frontend and backend onto **Render.com** entirely within their **Free Tiers**.

### 1. External Cloud Services Setup (Free Tiers)
Before deploying to Render, you will need free hosted instances for your MongoDB database and Redis queue:
1. **MongoDB**: Register a free account at [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database) and create a free **M0 Cluster**. Copy the `mongodb+srv://...` connection string.
2. **Redis**: Register a free account at [Upstash](https://upstash.com/) and create a free Redis database. Copy the secure `rediss://...` endpoint URL.

---

### 2. Deployed Backend Configuration (Express Service)
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your GitHub repository containing the VedaAI source code.
3. Configure the following service settings:
   - **Name**: `veda-ai-backend-api`
   - **Environment**: `Node`
   - **Root Directory**: `backend` *(Ensure this points to your backend sub-folder)*
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Add the following **Environment Variables** in the Service Dashboard:
   - `PORT`: `5000` *(Or render's dynamic selection)*
   - `MONGO_URI`: *Your MongoDB Atlas free cluster connection string*
   - `REDIS_URL`: *Your Upstash Redis connection string (use `rediss://` format)*
   - `GEMINI_API_KEY`: *Your Google Gemini AI Studio API key*
   - `FRONTEND_URL`: *Your deployed VedaAI frontend static/web URL (e.g. `https://veda-ai.onrender.com`)*
5. Click **Create Web Service**. Once built, copy the public URL provided by Render (e.g., `https://veda-ai-backend-api.onrender.com`).

---

### 3. Deployed Frontend Configuration (Next.js Service)
Next.js works beautifully as a Render Web Service to allow dynamic Server-Side rendering and Client transitions.
1. Go to the Render Dashboard and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the following service settings:
   - **Name**: `veda-ai-frontend`
   - **Environment**: `Node`
   - **Root Directory**: `frontend` *(Ensure this points to your frontend sub-folder)*
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Add the following **Environment Variables** in the Service Dashboard:
   - `NEXT_PUBLIC_API_URL`: *Your deployed Render backend URL (e.g., `https://veda-ai-backend-api.onrender.com`)*
5. Click **Create Web Service**.

🎉 Once both builds complete, open your deployed frontend URL (e.g., `https://veda-ai-frontend.onrender.com`) and enjoy using **VedaAI** live on the cloud!

---

Enjoy building the future of classroom assessments with **VedaAI**! 🎓✨
