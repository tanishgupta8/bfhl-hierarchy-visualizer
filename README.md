# Chitkara Full Stack Engineering Challenge

A complete production-ready Full Stack solution that validates, builds, and visualizes relationships between nodes. Built using **Node.js/Express** on the backend and **React/Vite** on the frontend, featuring clean modular logic, cycle detection, automatic multi-parent override management, and duplicate edge parsing.

## 🚀 Live Demo & Repository
* **Frontend Web URL:** [https://chitkara-challenge-frontend.vercel.app](https://chitkara-challenge-frontend.vercel.app) *(Placeholder - replace with your Vercel URL)*
* **Backend API Base URL:** [https://chitkara-challenge-backend.onrender.com](https://chitkara-challenge-backend.onrender.com) *(Placeholder - replace with your Render URL)*
* **GitHub Repository:** [https://github.com/yourusername/chitkara-challenge](https://github.com/yourusername/chitkara-challenge) *(Placeholder - replace with your repo URL)*
* **GitHub Profile:** [https://github.com/yourusername](https://github.com/yourusername) *(Placeholder - replace with your profile URL)*

---

## 🛠️ Project Structure
```text
bajaj-finserv-health/
├── backend/
│   ├── utils/
│   │   └── hierarchy.js   # Main validation & graph compilation engine
│   ├── server.js          # Express app definition & endpoints
│   ├── test.js            # Independent backend test runner
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React components & layout
│   │   ├── index.css      # Customized dark space theme stylesheet
│   │   └── main.jsx
│   ├── package.json
│   └── .env
├── .gitignore             # Root git ignore
└── README.md              # Project documentation
```

---

## ⚙️ Requirements & System Performance
* Fast processing under **3 seconds** for up to **50 nodes**.
* CORS enabled on backend for seamless API requests.
* Production-ready validation, filtering duplicate inputs, handling invalid formats, and detecting cyclic dependencies.

---

## 📖 API Documentation

### POST `/bfhl`
Processes an array of relationship strings and returns the computed hierarchies, invalid items, duplicate items, and a summary.

* **Request Format:**
  ```json
  {
    "data": ["A->B", "A->C", "B->D"]
  }
  ```

* **Validation Rules:**
  1. **Whitespace Trimming:** Leading/trailing whitespace is trimmed before validation.
  2. **Format Constraints:** Edge format must match exactly `X->Y`, where `X` and `Y` are single uppercase English letters (A-Z).
  3. **Invalid Entries:** Inputs not matching the format, having self-loops (e.g. `A->A`), missing a parent/child node, or using multi-character nodes are added to `invalid_entries`.
  4. **Duplicates:** Repeated edges (e.g. repeating `A->B`) are stored in `duplicate_edges` and only processed once.
  5. **Multi-Parent Overrides:** A node can have at most **one** parent. The first declared parent relationship wins; subsequent parents are silently ignored.
  6. **Cycle Detection:** If a weakly connected component contains a cycle, its tree output is set to `{}` and `has_cycle: true` is returned. Its root is defined as the smallest lexicographical node in that component.
  7. **Depth Calculation:** The depth of a non-cyclic tree is the number of nodes on the longest path from its root to a leaf.

* **Response Format:**
  ```json
  {
    "user_id": "tanishgupta_24062026",
    "email_id": "tanish.gupta@chitkara.edu.in",
    "college_roll_number": "2010992345",
    "hierarchies": [
      {
        "root": "A",
        "tree": {
          "A": ["B", "C"],
          "B": ["D"]
        },
        "depth": 3
      }
    ],
    "invalid_entries": [],
    "duplicate_edges": [],
    "summary": {
      "total_trees": 1,
      "total_cycles": 0,
      "largest_tree_root": "A"
    }
  }
  ```

### GET `/bfhl`
Health check endpoint returning system status.

---

## 💻 Local Setup & Development

### 1. Prerequisites
Make sure you have Node.js (version 20+) and npm installed.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in a `.env` file:
   ```env
   PORT=4000
   USER_ID=tanishgupta_24062026
   EMAIL_ID=tanish.gupta@chitkara.edu.in
   COLLEGE_ROLL_NUMBER=2010992345
   ```
4. Run the backend tests:
   ```bash
   node test.js
   ```
5. Start the local server:
   ```bash
   npm run dev
   ```
   *The server starts on `http://localhost:4000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the local backend endpoint in a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:4000
   ```
4. Start the frontend web dev server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 📁 Deployment Steps

### 1. Backend on Render
1. Push your code to a public GitHub repository.
2. Sign in to [Render](https://render.com) and create a new **Web Service**.
3. Link your GitHub repository.
4. Set the following settings:
   * **Root Directory:** `backend`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   * `PORT`: `4000` (or leave default)
   * `USER_ID`: `your_user_id`
   * `EMAIL_ID`: `your_email@chitkara.edu.in`
   * `COLLEGE_ROLL_NUMBER`: `your_roll_number`
6. Deploy the service.

### 2. Frontend on Vercel
1. Sign in to [Vercel](https://vercel.com) and create a **New Project**.
2. Link your GitHub repository.
3. In the configuration:
   * **Root Directory:** `frontend`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * **Install Command:** `npm install`
4. Add the environment variable:
   * `VITE_API_BASE_URL`: `https://your-deployed-backend-url.onrender.com`
5. Deploy the service.
