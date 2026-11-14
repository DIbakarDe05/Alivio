# 🧠 Alivio AI Inference Microservice (`ai-service`)

**Service ID:** `alivio-ai-service` | **Version:** `2.1.0`  
**Runtime:** Python 3.11, FastAPI, Uvicorn | **Port:** `:8000`  
**SDK:** Modern Google GenAI SDK (`google-genai`), Model `gemini-2.5-flash`

---

## 1. Overview & Architectural Boundaries

The `ai-service` is a stateless AI inference microservice built for the **Alivio** Smart Campus Complaint Management System. It handles:
1. **Stage 1 (`POST /api/v1/validate-evidence`):** Bidirectional Visual Evidence Gatekeeper (student defect photos & staff repair resolution photos) with Fail-Open resilience.
2. **Stage 2 (`POST /api/v1/analyze`):** Multimodal Triage, 80/20 Severity Scoring, and in-memory Semantic Deduplication against nearby active tickets with Safe Manual-Review Fallback.
3. **Stage 3 (`POST /api/v1/chat`):** Domain-Restricted Helpdesk Assistant with <15ms Pre-LLM Regex Scope Guard and grounded ticket assistance.
4. **Health Check (`GET /api/v1/health`):** Zero-quota health and pool readiness check.

### Core Architectural Guarantees:
* **Statelessness:** Zero database drivers, zero Cloudinary secrets, zero disk writes.
* **Option C RAM Discipline:** Base64 images are decoded strictly in RAM with a 5 MiB ceiling and magic-byte MIME signature verification.
* **45 RPM Multi-Account Quota:** 3 distinct API keys for Vision, Triage, and Chat with automatic zero-sleep failover on `429 RESOURCE_EXHAUSTED`.
* **Bounded Deadlines:** 6.0-second outer application deadline (`asyncio.timeout(6.0)`) with 3.2-second per-attempt timeout and maximum 2 attempts.

---

## 2. Directory Layout

```text
ai-service/
├── .env.example                # Environment configuration template
├── .env                        # Local runtime secrets and configurations
├── requirements.txt            # Pinned dependencies
├── Dockerfile                  # Non-root container specification
├── main.py                     # FastAPI application, lifespan, middleware & routers
├── config.py                   # Pydantic BaseSettings configuration
├── test_service.py             # Verification test suite
├── routers/
│   ├── __init__.py
│   ├── validate.py             # POST /api/v1/validate-evidence
│   ├── analyze.py              # POST /api/v1/analyze
│   ├── chat.py                 # POST /api/v1/chat
│   └── health.py               # GET /api/v1/health
├── schemas/
│   ├── __init__.py
│   ├── enums.py                # CategoryEnum, DepartmentEnum, PriorityEnum, etc.
│   ├── validation.py           # Evidence validation schemas
│   ├── analyze.py              # Triage & deduplication schemas
│   └── chat.py                 # Helpdesk chat schemas
├── services/
│   ├── __init__.py
│   ├── key_manager.py          # 3-pool key manager & 2-attempt failover
│   ├── image_verifier.py       # Stage 1 evidence verification service (temp=0.0)
│   ├── gemini_triage.py        # Stage 2 triage & deduplication service (temp=0.1)
│   └── chatbot.py              # Stage 3 helpdesk assistant service (temp=0.3)
├── prompts/
│   ├── __init__.py
│   ├── verifier.py             # Evidence validation prompt templates
│   ├── classify.py             # Triage taxonomy & deduplication prompt templates
│   └── chatbot.py              # Maintenance domain system prompt & scope guard
└── utils/
    ├── __init__.py
    ├── image.py                # In-memory RAM Base64 decoder & magic byte verifier
    └── logger.py               # Structured JSON stdout logger with correlation ID
```

---

## 3. Quick Start (Local Setup)

### Step 1: Create Virtual Environment & Install Dependencies
```powershell
cd d:\testing\ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and provide your Google AI Studio keys:
```dotenv
GEMINI_API_KEY_VISION=your_project_a_vision_api_key
GEMINI_API_KEY_TRIAGE=your_project_b_triage_api_key
GEMINI_API_KEY_CHATBOT=your_project_c_chatbot_api_key
MODEL_NAME=gemini-2.5-flash
PORT=8000
```

### Step 3: Run the Verification Test Suite
```powershell
python test_service.py
```
*(All 5 test suites will run and pass).*

### Step 4: Launch the Microservice
```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger UI will be live at: `http://localhost:8000/docs`

---

## 4. cURL Testing Guide

### 1. Health Check (`GET /api/v1/health`)
```bash
curl -X GET http://localhost:8000/api/v1/health
```

### 2. Stage 1 Evidence Gatekeeper (`POST /api/v1/validate-evidence`)
```bash
curl -X POST http://localhost:8000/api/v1/validate-evidence \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Dangerous electrical wire sparking in corridor of Hostel B near room 102.",
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
    "mode": "student_intake"
  }'
```

### 3. Stage 2 Multimodal Triage + Deduplication (`POST /api/v1/analyze`)
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Drinking water fountain leaking continuously on 2nd floor corridor of Hostel A.",
    "imageBase64": null,
    "imageUrl": null,
    "recentNearbyTickets": [
      {
        "ticketId": "ALV-04810",
        "category": "Plumbing",
        "summary": "Water cooler on 2nd floor of Hostel A leaking onto floor."
      }
    ]
  }'
```

### 4. Stage 3 Helpdesk Assistant (`POST /api/v1/chat`)
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the status of my ceiling fan complaint?",
    "ticketId": "ALV-04821",
    "ticketData": {
      "ticketId": "ALV-04821",
      "title": "Ceiling fan making loud grinding noise",
      "category": "Electrical",
      "priority": "MEDIUM",
      "status": "in_progress",
      "locationDescription": "Hostel A, Room 204",
      "assignedStaff": "Ramesh Kumar (Electrical Maintenance)",
      "slaDeadline": "2026-11-15T12:00:00Z"
    },
    "conversationHistory": []
  }'
```

---

## 5. Node.js Express Gateway Integration Bridge

In your Node.js Gateway (`:5000`):

```typescript
import axios from 'axios';

const aiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 8000,
});

// 1. Validate Evidence in RAM before uploading to Cloudinary
export async function validateComplaintEvidence(text: string, buffer: Buffer, mimeType: string) {
  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
  const response = await aiClient.post('/validate-evidence', {
    text,
    imageBase64: base64Data,
    mode: 'student_intake',
  });
  return response.data; // { isValid, rejectionReason, consistencyScore, userFeedback }
}

// 2. Multimodal Triage & Semantic Deduplication
export async function triageComplaint(text: string, buffer: Buffer | null, nearbyCandidates: any[]) {
  const base64Data = buffer ? buffer.toString('base64') : null;
  const response = await aiClient.post('/analyze', {
    text,
    imageBase64: base64Data,
    imageUrl: null,
    recentNearbyTickets: nearbyCandidates,
  });
  return response.data; // { category, priority, severityScore, department, summary, deduplication }
}
```
