# 🎓 AI University LMS

An AI-powered Learning Management System (LMS) that combines course management with **Retrieval-Augmented Generation (RAG)** to help students understand and interact with their course materials.

The platform provides separate **Student** and **Admin** experiences, PDF lecture management, AI-powered lecture summaries, and an AI assistant that answers questions using the uploaded course material — with citations back to the exact document and page.

---

## ✨ Features

### 👨‍🎓 Student
- Register / login
- Student dashboard
- Browse enrolled courses
- View course details and materials
- View lecture PDFs
- AI tutor chat, scoped per course
- Ask questions about lecture materials, with source citations (document + page)
- AI-generated summaries per document
- AI-generated quizzes per document
- Profile page
- Role-based access

### 👨‍💼 Admin
- Admin dashboard
- Course management (create, update, delete)
- Lecture/PDF upload and management
- Ingestion status tracking per document (pending / processing / ready / failed)
- User management
- Role-based access control

### 🤖 AI / RAG pipeline
- PDF ingestion (page-aware text extraction via `PyPDFLoader`)
- Text chunking with page metadata preserved
- Embedding generation (`all-MiniLM-L6-v2`)
- Vector storage with ChromaDB — one collection per course
- Semantic similarity search, scoped per course
- RAG-based question answering with source citations
- AI-generated document summaries
- AI-generated quizzes (structured output)

---

## 🏗️ Architecture

The project is split into three independently-run services:

```
┌─────────────────────┐
│      React          │
│     Frontend UI      │
└──────────┬───────────┘
           │  REST API, Bearer token auth
           ▼
┌─────────────────────┐
│     Laravel API      │
│                       │
│ Authentication        │
│ Courses               │
│ Slides / Documents    │
│ Users & Roles         │
│ Authorization         │
└──────────┬───────────┘
           │  Internal REST, shared secret header
           ▼
┌─────────────────────┐
│   FastAPI AI Service │
│                       │
│ LangChain             │
│ RAG pipeline           │
│ Retrieval              │
│ Embeddings              │
│ LLM generation          │
└───────┬───────────┬───┘
        │           │
        ▼           ▼
┌───────────┐ ┌──────────────┐
│ ChromaDB  │ │ Gemini (LLM) │
│ Vector DB │ │ via LangChain │
└───────────┘ └──────────────┘
```

React never talks to the AI service directly — every request flows through Laravel, which is the only service aware that the Python backend exists.

---

## 🛠️ Tech stack

**Frontend**
- React + Vite (TypeScript)
- Custom fetch-based API client with token auth

**Backend**
- Laravel 11 (API-only, no Blade)
- Laravel Sanctum (token auth)
- MySQL
- Laravel Queues (background document ingestion)

**AI service**
- FastAPI
- LangChain (`langchain-google-genai`, `langchain-community`, `langchain-text-splitters`)
- ChromaDB (one collection per course)
- `all-MiniLM-L6-v2` sentence-transformer embeddings
- Google Gemini (`gemini-3.6-flash`) via `langchain-google-genai`
- `pypdf` / `PyPDFLoader` for page-aware PDF extraction

---

## 📂 Project structure

```
.
├── lms-backend/        # Laravel API
├── lms-ai-service/      # FastAPI + LangChain RAG service
└── lms-frontend/        # React SPA
```

---

## 🚀 Running locally

Each service runs independently. You'll need four terminals open during development:

```bash
# Terminal 1 — React frontend
cd lms-frontend
npm run dev

# Terminal 2 — Laravel API
cd lms-backend
php artisan serve

# Terminal 3 — FastAPI AI service
cd lms-ai-service
venv\Scripts\activate      # or source venv/bin/activate on macOS/Linux
uvicorn main:app --reload --port 8001

# Terminal 4 — Laravel queue worker (processes document ingestion jobs)
cd lms-backend
php artisan queue:work
```

### Environment variables

**`lms-backend/.env`**
```
DB_CONNECTION=mysql
DB_HOST=******
DB_PORT=*****
DB_DATABASE=lms_backend
DB_USERNAME=
DB_PASSWORD=

AI_SERVICE_URL=http://localhost:8001
AI_SERVICE_KEY=your_shared_secret
```

**`lms-ai-service/.env`**
```
GOOGLE_API_KEY=your_gemini_api_key
CHROMA_DB_PATH=./chromadb
INTERNAL_API_KEY=your_shared_secret
```

> `AI_SERVICE_KEY` (Laravel) and `INTERNAL_API_KEY` (Python) must match — this is the shared secret used to authenticate requests between the two backend services.

---

## 🗺️ Roadmap

**Shipped (v1)**
- Auth, roles (student/admin)
- Course and document management
- Page-aware PDF ingestion pipeline
- RAG chat with source citations
- AI document summaries and quizzes (single-shot generation)

**Planned**
- Agentic quiz generation (LangChain tool-calling agent, dynamic retrieval)
- Compare-two-lectures tool
- Cross-course search
- Self-verifying quiz generation (LangGraph, reflection loop)

---

## 📄 License

Personal portfolio project — not licensed for reuse.