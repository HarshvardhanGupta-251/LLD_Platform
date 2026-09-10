# 🚀 LLD_Platform — Low-Level System Design Practice & AI Evaluation Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

An intelligent, interactive **Low-Level System Design (LLD)** platform engineered to help software developers master Object-Oriented Design (OOD), SOLID principles, design patterns, and distributed concurrency.

Powered by **Google Gemini 2.5 Flash** and deterministic rule rubrics, the platform automatically evaluates candidate architecture proposals across **8 strict architectural criteria**, citing direct evidence quotes, surfacing architectural risks, and generating actionable improvement recommendations.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [8-Criterion Architectural Rubric](#-8-criterion-architectural-rubric)
- [System Architecture & Design Patterns](#-system-architecture--design-patterns)
- [Data Model & Entity Relationships](#-data-model--entity-relationships)
- [Tech Stack](#-tech-stack)
- [Problem Catalog](#-problem-catalog)
- [Project Directory Structure](#-project-directory-structure)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Author & Contact](#-author--contact)

---

## 🌟 Overview

While algorithmic platforms like LeetCode focus predominantly on data structures and time complexity, Low-Level Design (LLD) interviews demand a radically different skill set:
- **Modular decomposition** and Single Responsibility Principle (SRP).
- **Loose coupling** and interface-driven abstractions.
- **Appropriate design pattern selection** (Strategy, State, Observer, Factory).
- **Robust concurrency models**, thread safety, and race-condition prevention.
- **Extensibility** without modifying core domain engines (Open/Closed Principle).

**LLD_Platform** bridges this gap by offering:
1. **Interactive Workspace**: A rich markdown and code editor with customizable templates and instant validation.
2. **Multi-Engine Evaluation**: Pluggable evaluation backends (AI-driven with Gemini 2.5 Flash, deterministic rule-based, or hybrid).
3. **Evidence-Based Grading**: Structured 1–5 scoring per criterion, backed by textual excerpts, concerns, and suggestions.
4. **Retry & Delta Diffs**: Visual before-and-after comparisons showing score progressions across problem attempts.
5. **Session History & Rubric Analytics**: Longitudinal trend tracking to identify recurring architectural blind spots.

---

## ✨ Key Features

### 1. 🎯 Curated Real-World LLD Problems
- Diverse problem scenarios with explicit functional requirements, expected deliverables, and strict scale constraints (e.g., handling 10,000+ vehicles/day or 50-story skyscraper elevator dispatching).
- Difficulty badges, pattern tags, and difficulty-reactive visual themes.

### 2. 🤖 Pluggable Evaluation Engines
- **AI Evaluator (`AIEvaluator`)**: Harnesses `@google/genai` (Gemini 2.5 Flash) with strict JSON schema enforcement to grade code and design narratives against rigorous anchor rubrics.
- **Rule-Based Evaluator (`RuleBasedEvaluator`)**: Performs rapid, deterministic keyword, token, and structural AST checks (validating classes, methods, concurrency tokens, and pattern presence).
- **Hybrid Evaluator (`HybridEvaluator`)**: Merges deterministic safety and sanity checks with nuanced LLM architectural reasoning.
- **Offline Heuristic Engine**: Built-in fallback system that gracefully continues evaluation if the external AI API is unreachable or unconfigured.

### 3. 🔍 Granular 8-Criterion Rubric
- Evaluates every submission across eight standardized dimensions:
  - Requirement Understanding
  - Responsibility Assignment (SRP)
  - Coupling & Cohesion
  - Encapsulation
  - Abstraction & Design Patterns
  - Extensibility (Open/Closed Principle)
  - Edge Case & Concurrency Handling
  - Explanation & Trade-off Quality
- Each criterion includes a score (1–5), citation evidence, concerns, actionable suggestions, and confidence scores (0.0–1.0).

### 4. 🔄 Retry & Diff View
- Compare the latest attempt against past submissions.
- Visual score delta indicator (`+1.0`, `-0.5`) per criterion to quickly inspect whether changes improved decoupling, encapsulation, or concurrency.
- Side-by-side or unified textual diff viewer.

### 5. 📊 Learner Analytics & History
- Comprehensive timeline of all practice sessions.
- Average rubric score indicators and criterion breakdown badges.
- Attempt trend charts showing improvement trajectories over time.

### 6. 🌌 Retro-Modern UI Aesthetic
- Dark mode interface styled with deep obsidian tones (`#0d0d14`), subtle borders, and glassmorphic navigation.
- **WebGL Particle Snow (`PixelSnow`)** dynamic background canvas for an immersive engineering vibe.
- **Interactive Shader Grid (`PixelCard`)** problem cards that react dynamically to cursor hover.
- Full mobile and desktop responsiveness.

---

## 📐 8-Criterion Architectural Rubric

Every submission is evaluated against this standardized grading framework:

| # | Criterion | Focus Area | Score 1 Anchor | Score 5 Anchor |
|---|---|---|---|---|
| **1** | **Requirement Understanding** | Scope, functional & non-functional bounds | Misses core requirements, invents irrelevant features, or misunderstands problem domain. | Comprehensive coverage of functional and non-functional requirements, explicit bounds, and clear constraints. |
| **2** | **Responsibility Assignment (SRP)** | Single Responsibility Principle & entity roles | God objects handling DB, UI, state, and business logic simultaneously. | Clean SRP enforcement with single focused responsibility per entity, well-bounded contexts. |
| **3** | **Coupling & Cohesion** | Module interdependence & internal focus | Tightly coupled monolithic design; changing one class requires cascading updates. | Loose coupling via interfaces and dependency injection; high cohesion within domain models. |
| **4** | **Encapsulation** | Information hiding & invariant safety | Exposes mutable public fields everywhere; external code mutates state directly. | Strict encapsulation; state mutated only via rich domain methods with invariant validation. |
| **5** | **Abstraction & Design Patterns** | Strategic pattern application | No abstractions; excessive nested if-else/switch blocks replacing polymorphism. | Judicious design pattern selection (Strategy, State, Factory, Observer) cleanly separating concerns. |
| **6** | **Extensibility (Open/Closed)** | Ease of adding new requirements | Rigid structure; adding features requires editing core engine execution paths. | Highly extensible; new behaviors added seamlessly via interface implementations without touching engine core. |
| **7** | **Edge Case & Concurrency** | Race conditions, locks, thread safety | Ignores errors, concurrency, race conditions, and invalid inputs completely. | Robust error handling, explicit thread-safety / concurrency locks, transaction boundaries, and graceful degradation. |
| **8** | **Explanation Quality** | Rationale, design decisions, trade-offs | Sparse or incomprehensible text; no rationale provided for key architectural choices. | Crystal-clear structure, detailed design rationales, explicit trade-off analysis, and class relationship flow. |

---

## 🏛️ System Architecture & Design Patterns

### Architecture Diagram

```mermaid
flowchart TD
    subgraph Frontend["Frontend (React 18 + Vite + Tailwind)"]
        UI["Modern UI / Pages"]
        PS["PixelSnow WebGL Background"]
        PC["PixelCard Interactive Components"]
        SE["Solution Workspace & Editor"]
        EV["Evaluation & Diff Views"]
        HT["History & Analytics Charts"]
    end

    subgraph Backend["Backend (Node.js + Express + TypeScript)"]
        Router["Express REST API Router (/api)"]
        subgraph Controllers
            PCtrl["Problem Controller"]
            ACtrl["Attempt & Submission Controller"]
            ECtrl["Evaluation Controller"]
            LCtrl["Learner Controller"]
        end
        subgraph Evaluator_System["Evaluator Architecture (Strategy + Factory)"]
            EF["EvaluatorFactory"]
            direction LR
            RBE["RuleBasedEvaluator"]
            AIE["AIEvaluator"]
            HE["HybridEvaluator"]
        end
        SM["Async State Machine (Queued -> Evaluating -> Completed/Failed)"]
    end

    subgraph External_AI["AI Infrastructure"]
        Gemini["Google Gemini 2.5 Flash API (@google/genai)"]
    end

    subgraph Database["Persistence Layer (Prisma ORM)"]
        SQLite[("SQLite Database")]
    end

    UI --> Router
    Router --> PCtrl & ACtrl & ECtrl & LCtrl
    ACtrl --> SM
    ECtrl --> SM
    SM --> EF
    EF --> RBE & AIE & HE
    AIE --> Gemini
    PCtrl & ACtrl & ECtrl & LCtrl --> SQLite
```

### Design Patterns Utilized

1. **Strategy Pattern**: Evaluator engines implement a common `Evaluator` interface (`evaluate(submission, problemContext)`). The system can dynamically swap between `AIEvaluator`, `RuleBasedEvaluator`, and `HybridEvaluator` without affecting callers.
2. **Factory Pattern**: `EvaluatorFactory.getEvaluator(type)` encapsulates the instantiation logic, credential checks, and fallback mechanisms for evaluation engines.
3. **State Pattern**: Evaluator progress transitions deterministically through states (`Queued` → `Evaluating` → `Completed` | `Failed`).
4. **Idempotency Pattern**: Submissions accept an `idempotencyKey` to guarantee that network retries or repeated button presses do not create duplicate evaluation runs or corrupt history.
5. **Repository / ORM Pattern**: Prisma client abstracts all database queries with type safety, cascades, and migrations.

---

## 🗄️ Data Model & Entity Relationships

```mermaid
erDiagram
    Problem ||--o{ Attempt : "has"
    Attempt ||--o{ Submission : "records"
    Submission ||--o| Evaluation : "triggers"
    Evaluation ||--o| EvaluationResult : "produces"
    EvaluationResult ||--o{ CriterionScore : "contains"

    Problem {
        string id PK
        string title
        string description
        string constraints
        string difficulty
        string tags
        datetime createdAt
        datetime updatedAt
    }

    Attempt {
        string id PK
        string problemId FK
        string learnerId
        string status
        datetime startedAt
        datetime completedAt
    }

    Submission {
        string id PK
        string attemptId FK
        string format
        string content
        string idempotencyKey UK
        datetime submittedAt
    }

    Evaluation {
        string id PK
        string submissionId FK
        string status
        string evaluatorType
        string errorMessage
        datetime createdAt
        datetime completedAt
    }

    EvaluationResult {
        string id PK
        string evaluationId FK
        string overallSummary
        string strengths
        string improvementAreas
    }

    CriterionScore {
        string id PK
        string evaluationResultId FK
        string criterion
        int score
        string evidence
        string concern
        string suggestion
        float confidence
    }
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Graphics & 3D**: [Three.js](https://threejs.org/) + [OGL](https://github.com/oframe/ogl) + [GSAP](https://greensock.com/)
- **Icons**: [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/react-icons/)
- **Component Utilities**: `clsx`, `tailwind-merge`

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+ or v20+)
- **Framework**: [Express 4.21](https://expressjs.com/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) with `ts-node-dev`
- **ORM**: [Prisma ORM 5.22](https://www.prisma.io/)
- **Database**: [SQLite](https://www.sqlite.org/) (zero-config, self-contained)
- **AI Integration**: [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Google Gemini 2.5 Flash)
- **Testing**: [Vitest 2.1](https://vitest.dev/) + [Supertest 7.0](https://github.com/ladjs/supertest)

---

## 📚 Problem Catalog

The platform ships pre-seeded with four classic Low-Level Design interview challenges:

| Problem | Difficulty | Key Architectural Focus Areas |
|---|---|---|
| **Parking Lot System** | `Medium` | Strategy Pattern, State Pattern, Spot Allocation Algorithms, Dynamic Pricing Strategies, Multi-level Concurrency |
| **Elevator Control System** | `Hard` | Finite State Machine, Real-time Dispatching (SCAN/LOOK), Button Request Queues, Overload Sensors, Thread-safety |
| **Vending Machine System** | `Easy` | State Pattern (`IdleState`, `HasMoneyState`, `DispensingState`, `SoldOutState`), Inventory Management, Change Return |
| **Movie Ticket Booking Platform** | `Hard` | High-concurrency Seat Reservation, Distributed Locking (Optimistic vs Pessimistic), 10-minute Lock TTLs, Double-booking Prevention |

---

## 📁 Project Directory Structure

```text
CipherSchools/
├── package.json                   # Root scripts (build, dev orchestration)
├── README.md                      # Comprehensive project documentation
├── backend/                       # Express + Prisma + Gemini Backend
│   ├── .env                       # Environment configuration
│   ├── package.json               # Backend dependencies & scripts
│   ├── tsconfig.json              # Backend TypeScript configuration
│   ├── vitest.config.ts           # Vitest configuration
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema & entity models
│   │   ├── seed.ts                # Database seeder (LLD problems)
│   │   └── dev.db                 # SQLite database file
│   ├── src/
│   │   ├── app.ts                 # Express application configuration & CORS
│   │   ├── server.ts              # Server startup & port binding
│   │   ├── routes/
│   │   │   └── api.ts             # API route definitions
│   │   ├── controllers/
│   │   │   ├── problemController.ts     # Problems CRUD endpoints
│   │   │   ├── attemptController.ts     # Attempts & submissions endpoints
│   │   │   ├── evaluationController.ts  # Evaluation status & retry
│   │   │   └── learnerController.ts     # Learner history & metrics
│   │   ├── domain/
│   │   │   └── rubric.ts          # 8-criterion rubric definitions & AI prompt
│   │   ├── evaluators/
│   │   │   ├── Evaluator.ts       # Core Evaluator interfaces & types
│   │   │   ├── EvaluatorFactory.ts # Pluggable Evaluator Factory
│   │   │   ├── AIEvaluator.ts     # Google Gemini 2.5 Flash implementation
│   │   │   ├── RuleBasedEvaluator.ts # Deterministic keyword/AST checks
│   │   │   └── HybridEvaluator.ts # Combined evaluation engine
│   │   └── services/
│   │       ├── evaluationService.ts     # Evaluation pipeline execution
│   │       └── prisma.ts          # Shared Prisma client instance
│   └── tests/                     # Automated Vitest test suite
│       ├── idempotency.test.ts            # Idempotency key verification
│       ├── stateMachine.test.ts           # Evaluation state lifecycle
│       ├── submissionImmutability.test.ts # Immutability compliance
│       └── evaluatorFailure.test.ts       # Fault tolerance & error handling
│
└── frontend/                      # React + Vite + Tailwind Frontend
    ├── package.json               # Frontend dependencies
    ├── vite.config.ts             # Vite configuration
    ├── tailwind.config.js         # Tailwind styling & tokens
    ├── public/
    │   └── logo.jpg               # Platform branding logo
    └── src/
        ├── main.tsx               # React application entry point
        ├── App.tsx                # Main container & layout
        ├── index.css              # Global styles & Tailwind directives
        ├── types/                 # Frontend TypeScript interfaces
        ├── services/
        │   └── api.ts             # Typed API client
        ├── pages/
        │   ├── ProblemsPage.tsx   # Catalog & hero with difficulty cards
        │   ├── ProblemDetailPage.tsx # Problem specs, workspace, evaluation
        │   └── HistoryPage.tsx    # Practice history, sessions, analytics
        └── components/
            ├── Navbar.tsx         # Floating glassmorphic header
            ├── PixelSnow.jsx      # WebGL particle canvas background
            ├── PixelCard.jsx      # Interactive hover grid canvas card
            ├── SolutionEditor.tsx # Markdown/code submission workspace
            ├── EvaluationView.tsx # Rubric scores, evidence, feedback
            ├── RetryDiffView.tsx  # Comparison between revision attempts
            ├── AttemptTrendChart.tsx # Rubric score trajectory chart
            ├── CriterionBadge.tsx # Rubric score badge with color coding
            └── ConfidenceBadge.tsx# AI evaluation confidence rating
```

---

## 🔌 API Reference

### Problem Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/problems` | List all available LLD practice problems. |
| `GET` | `/api/problems/:id` | Fetch full details, requirements, and constraints for a problem. |

### Attempt & Submission Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/attempts` | Initialize a new practice attempt (`problemId`, `learnerId`). |
| `GET` | `/api/attempts/:id` | Retrieve an attempt with its full submission history and evaluations. |
| `POST` | `/api/attempts/:id/submissions` | Submit a solution (`content`, `idempotencyKey`, `evaluatorType`). |
| `GET` | `/api/attempts/:id/evaluation-status` | Poll asynchronous evaluation progress (`Queued`, `Evaluating`, `Completed`, `Failed`). |

### Evaluation Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/submissions/:id/evaluation` | Fetch full evaluation results, overall summary, strengths, and criterion scores. |
| `POST` | `/api/evaluations/:id/retry` | Trigger a retry for a failed or re-analyzed evaluation. |

### Learner Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/learners/:id/attempts` | Retrieve complete attempt history, performance trends, and score analytics for a learner. |
| `DELETE` | `/api/learners/:id/attempts` | Reset and purge all historical practice attempts, submissions, and evaluations for a learner. |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `yarn` / `pnpm`
- *(Optional)* [Google Gemini API Key](https://aistudio.google.com/) for live AI evaluation. (If omitted, the platform automatically utilizes its high-fidelity heuristic engine).

---

### Installation & Setup

#### 1. Clone the repository
```bash
git clone https://github.com/HarshvardhanGupta-251/LLD_Platform.git
cd LLD_Platform
```

#### 2. Backend Setup
Navigate into the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env`:
```env
PORT=5000
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your-gemini-api-key-here"
```

Initialize the database and seed the problem catalog:
```bash
# Push the Prisma schema to the SQLite database
npm run prisma:db-push

# Seed the database with standard LLD problems
npm run seed
```

Start the backend development server:
```bash
npm run dev
```
The backend API server will run at: `http://localhost:5000`

---

#### 3. Frontend Setup
In a new terminal window, navigate into the `frontend` folder:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend application will run at: `http://localhost:5173`

---

## 🧪 Testing & Quality Assurance

The backend includes a comprehensive automated test suite powered by **Vitest** and **Supertest** ensuring architectural stability, error handling, and data integrity:

```bash
cd backend
npm test
```

### Test Suites Covered:
1. **Idempotency (`idempotency.test.ts`)**: Validates that re-sending the same submission with identical idempotency keys returns existing evaluations without running duplicate LLM calls or creating redundant records.
2. **State Machine (`stateMachine.test.ts`)**: Asserts correct transitions through the evaluation lifecycle (`Queued` → `Evaluating` → `Completed`).
3. **Submission Immutability (`submissionImmutability.test.ts`)**: Enforces that submitted code/text cannot be overwritten or mutated post-evaluation.
4. **Fault Tolerance (`evaluatorFailure.test.ts`)**: Verifies graceful error capture, status marking (`Failed`), and manual retry capability upon unexpected evaluator faults.

---

## 👨‍💻 Author & Contact

**Harshvardhan Gupta**

- 🌐 **GitHub Profile**: [@HarshvardhanGupta-251](https://github.com/HarshvardhanGupta-251)
- 📦 **Repository**: [LLD_Platform](https://github.com/HarshvardhanGupta-251/LLD_Platform)
- 📧 **Email**: [harshvardhangupta751@gmail.com](mailto:harshvardhangupta751@gmail.com)
- 📞 **Phone**: [+91 7037500363](tel:+917037500363)

---

<div align="center">
  <sub>Built with ❤️ for software engineers striving for excellence in Low-Level System Design and Object-Oriented Architecture.</sub>
</div>
