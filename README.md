
<div align="center">

```
 ██████╗ ██████╗ ██████╗  █████╗ ██╗     
██╔════╝██╔═══██╗██╔══██╗██╔══██╗██║     
██║     ██║   ██║██████╔╝███████║██║     
██║     ██║   ██║██╔══██╗██╔══██║██║     
╚██████╗╚██████╔╝██║  ██║██║  ██║███████╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
```

**Collaborative Orchestrated Reasoning via Adversarial Loops**

*A self-evolving multi-agent AI debate platform where three agents argue, critique, and converge.*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.1-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraph)
[![Ollama](https://img.shields.io/badge/Ollama-Local-000000?style=flat-square&logo=ollama&logoColor=white)](https://ollama.com)
[![LangSmith](https://img.shields.io/badge/LangSmith-Tracing-F4C430?style=flat-square&logo=langchain&logoColor=black)](https://smith.langchain.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

![C.O.R.A.L Demo](https://via.placeholder.com/1280x720/0D1117/7F77DD?text=C.O.R.A.L+Debate+Arena)

</div>

---

## What is C.O.R.A.L?

C.O.R.A.L is a **multi-agent debate interface** that visualises a three-agent adversarial reasoning loop in real time. A **Proposer** generates an answer, a **Critic** attacks it, and an **Arbitrator** synthesises both into a consensus — roles dynamically reassigning each round based on agent performance scores.

This is the **frontend only**. It connects to a FastAPI + LangGraph backend that runs the debate orchestration locally via Ollama — no external API calls, no data leaves your machine.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ Sidebar  │  │  Debate Arena    │  │ Trace Panel  │  │
│  │ History  │  │ Proposer │ Critic│  │ LangSmith    │  │
│  │ Memory   │  │       Arbitrator │  │ Arc Gauges   │  │
│  └──────────┘  └──────────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ Axios · REST
┌────────────────────────▼────────────────────────────────┐
│                 FastAPI Backend (:8000)                  │
│         LangGraph · LangSmith · SQLite Memory           │
│              Ollama · qwen2.5:0.5b (local)              │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

> **Prerequisites:** Node.js ≥ 18, the CORAL FastAPI backend running at `http://localhost:8000`, and Ollama with `qwen2.5:0.5b` pulled.

```bash
# 1. Install dependencies
cd coral-frontend && npm install

# 2. Configure environment
cp .env.example .env          # set VITE_API_URL if backend is not on :8000

# 3. Start the dev server
npm run dev                   # → http://localhost:5173
```

---

## Key Features

| Feature | Description |
|---|---|
| Live Debate Arena | Three agent columns stream output in real time via typewriter effect |
| Dynamic Role Reassignment | Animated banner fires when agents swap roles after each round |
| Reasoning-Bank Memory | Sidebar shows similar past debates injected as Proposer context |
| LangSmith Trace Feed | Right panel streams live trace events with per-step latency |
| Quality Arc Gauges | SVG gauges for Coherence, Convergence Efficiency, Hallucination Risk, Role Stability |
| Session History | Searchable list of all past debates with convergence status badges |
| Export Report | One-click JSON download of the full debate trace via `/reports/{trace_id}` |

---

## API Contract

The frontend consumes these five endpoints from the backend:

```
POST   /debate                     Start a debate session
GET    /debate/status/{trace_id}   Poll live debate state (2s interval)
GET    /history?limit=N            Fetch past session list
GET    /reports/{trace_id}         Download full JSON report
GET    /health                     Check Ollama + LangSmith connectivity
```

Configure the base URL in `.env`:

```env
VITE_API_URL=http://localhost:8000
```

---

## Project Structure

```
coral-frontend/
├── src/
│   ├── components/
│   │   ├── layout/       AppShell, Header, Sidebar, TracePanel
│   │   ├── input/        InputScreen, ConfigCard, DebateButton
│   │   ├── arena/        DebateArena, AgentColumn, RoundProgress, ReassignBanner
│   │   ├── result/       ConvergenceCard, TranscriptTimeline, StatChip
│   │   └── shared/       StatusBadge, ArcGauge, Toast, Modal, SkeletonLoader
│   ├── context/          CoralContext.jsx   (global state via useReducer)
│   ├── hooks/            useApi.js · useTypewriter.js · useDebatePoller.js
│   ├── utils/            api.js · formatters.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── tailwind.config.js    (custom CORAL color tokens)
└── vite.config.js
```

---

## Design System

```
primary-bg:      #0D1117     card-bg:     #161B22
accent-purple:   #7F77DD     accent-teal: #1D9E75
accent-amber:    #E8A838     accent-red:  #E85D4A
text-primary:    #FFFFFF     text-muted:  #8B949E
border-default:  #30363D

fonts: JetBrains Mono (agent output) · Inter (UI chrome)
```

Custom Tailwind tokens expose these as `bg-coral-purple`, `text-coral-teal`, etc.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion 11 |
| HTTP | Axios |
| Charts | Recharts + custom SVG arc gauges |
| Date formatting | date-fns |
| Icons | Tabler Icons |

---

## Minimum Viewport

C.O.R.A.L requires a **1280px minimum viewport width** to render the three-panel layout correctly. Below this width, a full-screen notice is displayed.

---

## Roadmap

- [ ] WebSocket support for true real-time agent streaming
- [ ] Mobile-responsive single-column debate view
- [ ] Dark / light theme toggle
- [ ] Debate replay mode from transcript history
- [ ] Multi-model support (swap Ollama model per agent)
- [ ] PDF export of convergence report

---

## Related

- [CORAL Backend](../coral) — FastAPI + LangGraph debate orchestration engine
- [LangGraph Docs](https://langchain-ai.github.io/langgraph)
- [Ollama](https://ollama.com) — local LLM inference

---

<div align="center">
Built with LangGraph · Ollama · React  |  Zero external API calls  |  Fully local
</div>
