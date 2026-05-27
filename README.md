# HR Analytics Intelligence Platform
### Powered by SynthoMind Innovation

A full-stack AI-powered HR analytics system that transforms raw employee CSV data into deep insights using a **NL2Query chatbot**, **25 analytical questions** across **7 sections**, and **dynamic chart generation** — all in a modern dark-theme dashboard.

---

## What It Does

Upload a CSV of employee records and instantly get:
- **25 pre-built analytical answers** covering performance, training, behavioral skills, project outcomes, attrition, compensation, and recruitment
- **AI-generated insights** (key finding + evidence + recommendation) for every question
- **An AI chatbot** that understands natural language, generates MongoDB aggregation pipelines on the fly, executes them, and responds with data-grounded answers + charts

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND  (React + Vite)                  │
│                                                                  │
│  Upload CSV ──► Dashboard ──► 7 Analysis Sections ──► AI Chat   │
│                                     │                    │       │
│              Recharts Visualizations│          Chat History      │
│              (Bar, Line, Radar,     │          (localStorage)    │
│               Scatter, Heatmap)     │                            │
└────────────────────────┬────────────┴────────────────────────────┘
                         │  Axios (REST API)
┌────────────────────────▼────────────────────────────────────────┐
│                     BACKEND  (Express + Node.js)                 │
│                                                                  │
│  /api/data        /api/analysis/*        /api/rag/chat           │
│  CSV ingest       25 pre-built queries   NL2Query pipeline       │
│  MongoDB          MongoDB Aggregation    Gemini 2.5 Flash        │
└────────────────────────┬────────────────────────────────────────┘
                         │  Mongoose ODM
┌────────────────────────▼────────────────────────────────────────┐
│                      MongoDB Atlas / Local                        │
│   employees collection  ·  analysis_cache collection            │
└─────────────────────────────────────────────────────────────────┘
```

---

## NL2Query Chatbot — How It Works

The chatbot does **not** use embeddings or vector search. Instead it uses **Text-to-MongoDB (NL2Query)** — a 3-step pipeline:

```
User Question
     │
     ▼
┌─────────────────────────────────────────────┐
│  STEP 1 — Pipeline Generation               │
│  Gemini receives the MongoDB schema         │
│  + user question and generates a           │
│  MongoDB aggregation pipeline (JSON array)  │
│  Retries up to 3× on parse errors          │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  STEP 2 — Security Validation               │
│  Whitelist check: only $match $group        │
│  $sort $limit $project $addFields etc.      │
│  Blocks $out $merge and any write ops       │
│  Recursive check for nested pipelines       │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  STEP 3 — Execute on MongoDB                │
│  Real data returned (≤50 rows)              │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│  STEP 4 — Analysis & Visualization          │
│  Gemini analyses real numbers, writes a     │
│  plain-text answer (max 200 words), and     │
│  picks the best chart type:                 │
│  bar · grouped-bar · horizontal-bar         │
│  line · table · none                        │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
              Answer + Chart in Chat
```

**Why NL2Query over RAG/Embeddings?**
Employee data is structured tabular data — embeddings and cosine similarity are designed for unstructured text. NL2Query gives **exact, aggregated answers** (e.g., "53.5% resignation rate in Sales") instead of approximate semantic matches. Every number in the chatbot response comes directly from MongoDB.

---

## 7 Analysis Sections — 25 Questions

| Section | Questions | Focus |
|---------|-----------|-------|
| Performance | Q1 – Q5 | Skills, ratings, ideal employee profile |
| Training & Mentorship | Q6 – Q10 | Dev hours, mentor impact, top programs |
| Behavioral Skills | Q11 – Q14 | Engagement clusters, conflict, blockers |
| Project Performance | Q15 – Q18 | Complexity, outcomes, role success |
| Attrition & Retention | Q19 – Q21 | Resignation risk, work-life balance |
| Compensation | Q22 – Q24 | Salary trends, bonuses, underpaid list |
| Recruitment | Q25 | Source effectiveness, hire cost, time-to-hire |

Each question renders:
1. A data chart (Recharts)
2. An AI insight card — **Key Finding · Evidence · Recommendation**

---

## Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| Recharts | Data visualization |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Axios | HTTP client |

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| Mongoose | MongoDB ODM |
| Gemini 2.5 Flash | LLM for insights + NL2Query |
| csvtojson | CSV parsing |
| Multer | File upload |
| simple-statistics | Statistical helpers |

### Infrastructure
| Tool | Purpose |
|------|---------|
| MongoDB | Primary database (employees + cache) |
| dotenv | Environment configuration |

---

## Project Structure

```
employee-analytics/
├── backend/
│   ├── index.js                  # Express server + MongoDB connect
│   ├── models/
│   │   ├── Employee.js           # Employee schema (50+ fields)
│   │   └── AnalysisCache.js      # 24h LLM response cache
│   ├── routes/
│   │   ├── data.js               # CSV upload, status
│   │   ├── rag.js                # Chat endpoint
│   │   └── analysis/             # Q1–Q25 aggregation routes
│   └── services/
│       ├── rag.js                # NL2Query pipeline (core chatbot logic)
│       └── llm.js                # Gemini insight generation + cache
│
└── frontend/
    └── src/
        ├── App.jsx               # Routes
        ├── pages/
        │   ├── Upload.jsx        # CSV upload
        │   ├── Dashboard.jsx     # Overview + KPIs
        │   ├── Chat.jsx          # AI chatbot + history panel
        │   └── Section1–7.jsx    # Analysis pages
        ├── components/
        │   ├── Layout/           # Sidebar + Navbar + Layout
        │   ├── ChatVisualization.jsx  # Dynamic chart renderer
        │   ├── LLMInsightCard.jsx     # AI insight display
        │   └── charts/index.jsx       # All chart components
        └── services/
            └── api.js            # Axios API calls
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key → [aistudio.google.com](https://aistudio.google.com)

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/hr-analytics
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`, proxies API calls to `:5000`.

### 3. Load Data

1. Go to `http://localhost:3000/upload`
2. Upload your employee CSV file
3. Navigate to Dashboard — all charts and AI insights are live

---

## Key Design Decisions

### Security — Read-Only LLM Queries
The LLM can only generate read queries. A whitelist validator (`ALLOWED_STAGES`) checks every pipeline stage before execution and blocks `$out`, `$merge`, and any write operations. Nested pipelines inside `$lookup` and `$facet` are checked recursively.

### Retry Logic
If the LLM generates invalid JSON (unclosed brackets, JS comments, trailing commas), the error is sent back to the LLM with a clear correction prompt. Retries up to 3 times before falling back to domain knowledge.

### 24-Hour Cache
All 25 analysis question responses are cached in MongoDB with a 24-hour TTL. Re-visiting a section loads instantly without hitting the LLM again.

### Chat History
Chat sessions are persisted in `localStorage` with session titles auto-derived from the first user message. Sessions survive page refresh and can be deleted with a confirmation prompt.

---

## Sample Questions for the Chatbot

- *"Which department has the highest resignation rate?"*
- *"Why do Sales employees resign more than HR?"*
- *"What is the average technical skills rating by job title?"*
- *"Which hiring source produces the highest performers?"*
- *"List the top 10 employees by performance rating"*
- *"What training programs do high performers use?"*

---

*Built by SynthoMind Innovation*
