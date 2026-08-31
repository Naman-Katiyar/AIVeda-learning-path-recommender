# AI-Powered Personalized Learning Path Recommender

## Project Overview

The AI-Powered Personalized Learning Path Recommender is a learning platform designed to help students, career switchers, and working professionals turn broad goals into focused, actionable study plans. Instead of generic course suggestions, the system understands the learner’s background, interests, and target objective, then generates a structured roadmap with milestones, prerequisites, and project-based learning recommendations.

The platform combines conversational AI, learner profiling, and intelligent recommendation logic to deliver a personalized pathway that adapts as the learner progresses. By translating a vague aspiration such as “become a data analyst” into a realistic roadmap, the system makes learning more goal-driven, practical, and measurable.

## Problem Statement and Background

Traditional learning platforms often present a one-size-fits-all catalogue of courses, videos, and tutorials. This creates friction for learners who are unsure where to start, what to prioritize, and how to connect isolated content into a coherent learning journey. Many users experience decision fatigue, poor retention, and weak momentum because the recommended path is not aligned with their individual context, constraints, or career goals.

This project addresses that gap by creating an AI-powered recommender that captures a learner’s profile, goal, and current level, then converts that information into a personalized learning path. The system helps learners move from uncertainty to clarity by building roadmaps that are structured, sequential, and justified through transparent recommendations.

## Key Features and Functionality

### Conversational AI Interface

The platform supports natural-language interactions where users share their learning objective and context. The AI interprets the input, asks clarifying questions when required, and continues the dialogue in a way that reflects the learner’s profile and learning stage.

### Intelligent Learner Profiling

The system collects and stores signals such as interests, current skills, educational background, target career direction, and time availability. This information is used to personalize recommendations and avoid generic content that is unrelated to the user’s actual needs.

### Dynamic Path Generator

Once the learner’s goal is defined, the system generates a milestone-based roadmap with sequenced learning steps, required prerequisites, and recommended resources. It structures the journey around practical outcomes and progressive mastery rather than random content consumption.

### Recommendation and Explainability Engine

Each recommendation is backed by direct reasoning so the learner understands why a topic, project, or course is included. This improves trust, supports adoption, and helps the learner connect each stage of the roadmap to their broader career goals.

### Interactive Analytics Dashboard

The application includes a dashboard that visualizes the learner’s progression, current milestone status, completed work, and pending actions. This turns the learning journey into a measurable, trackable process with actionable next steps.

## System Architecture and Tech Stack

| Layer             | Technology                               |
| ----------------- | ---------------------------------------- |
| Frontend          | React, Vite, Bootstrap, React Router     |
| Backend           | Node.js, Express.js                      |
| Database          | MongoDB Atlas with Mongoose ODM          |
| AI Infrastructure | Google Gemini API using gemini-3.6-flash |
| Authentication    | JWT-based authentication                 |
| Validation        | Zod                                      |
| Security          | Helmet, CORS, rate limiting              |

The frontend provides the user-facing experience for onboarding, dashboarding, AI chat, and path exploration. The backend manages authentication, profile management, user data persistence, AI orchestration, and recommendation generation. MongoDB Atlas stores persistent learner data, while Gemini powers AI-driven plan creation and conversational guidance.

## Repository Structure

```text
HCL_Tech/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.*
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   └── seed.ts
│   ├── package.json
│   └── tsconfig.json
├── shared/
│   └── schemas/
├── docs/
│   ├── architecture.md
│   └── api.md
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── docker-compose.yml
├── README.md
└── TODO.md
```

## Local Setup and Installation Guide

### Prerequisites

Before running the project locally, make sure you have:

- Node.js 18 or later
- MongoDB Atlas connection or a local MongoDB instance
- A valid Google Gemini API key
- A terminal with npm available

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd HCL_Tech
```

### Step 2: Backend Setup

Install dependencies:

```bash
npm install
```

Create the environment file with the required values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-3.6-flash
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

If you want to run the server directly in production mode, use:

```bash
npm run build
npm run start
```

### Step 3: Frontend Setup

The frontend is managed as part of the same workspace. To run it locally:

```bash
npm run dev --workspace client
```

The app will typically run on:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## AI and ML Implementation Details

The recommendation engine is built around structured prompt design and adaptive learning logic. The system converts a learner’s goal into a prompt that asks the model to return a machine-readable JSON payload describing the target role, key skill areas, difficulty estimate, and recommended learning durations.

The AI workflow includes:

- parsing the learner’s goal and historical context
- identifying the most relevant career direction and skill clusters
- generating milestone-based roadmap content in a structured format
- recommending sequential tasks and prerequisite dependencies
- validating the output against schema constraints before persistence

This design enables explainable outputs. Instead of relying on opaque recommendations, the app can clearly justify why a learner is being guided toward a certain sequence of topics, projects, and milestones. The recommendation loop is also adaptive: as the learner adds profile detail, updates progress, or interacts with the assistant, the future roadmap can be refined to reflect the latest context.

## Live Application and Video Links

- Deployed Application URL: [Insert Deployed URL Here]
- Demo Video Link: [Insert Demo Video URL Here]

## Team Credentials

- Team Name: Tech Titans
- Team Members: Shlok Maurya, Raman Katiyar, Naman Katiyar, Sachin
- Institution: Axis Colleges

## Summary

This project demonstrates how AI can move learning from generic content delivery to a structured, personalized, and career-oriented experience. By combining conversational AI, profile intelligence, and adaptive roadmap generation, the platform gives learners a clearer path from intent to execution.

The result is a practical learning system that supports students, job seekers, and working professionals in making better educational decisions with less ambiguity and more direction.
