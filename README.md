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

Enjoy building the future of classroom assessments with **VedaAI**! 🎓✨
