# C.O.R.A.L Frontend

C.O.R.A.L (Collaborative Orchestrated Reasoning via Adversarial Loops) is a multi-agent AI debate platform.

![Screenshot Placeholder](https://via.placeholder.com/1280x800?text=C.O.R.A.L+Frontend)

## Requirements

**IMPORTANT**: The FastAPI backend must be running first at `http://localhost:8000` for the frontend to function properly. 
If the backend is not running, the frontend will attempt to gracefully simulate some state, but full functionality requires the backend API.

## Setup

Run the following commands to start the frontend:

```bash
cd coral-frontend
npm install
npm run dev
```

## Tech Stack
- React + Vite
- Tailwind CSS v3
- Framer Motion
- Axios
- Recharts
- Date-fns
