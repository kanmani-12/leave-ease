# LeaveEase – MERN Employee Leave Management System

This project recreates the supplied LeaveEase dashboard reference with an employee portal and an admin portal.

## Features
- Blue-and-white LeaveEase dashboard layout
- Casual Leave, Medical Leave and Total Available cards
- Employee leave application form
- Leave history with request status
- Admin dashboard with pending, approved and rejected counts
- Admin Approve / Reject actions
- Express REST API and MongoDB Atlas persistence
- Vercel frontend and Render backend deployment configuration

## 1. Requirements
Install Node.js (LTS) and Git. Create a MongoDB Atlas database and allow your development IP address in Atlas Network Access.

## 2. Configure MongoDB and run locally
1. Open the `server` folder.
2. Copy `.env.example` to a new file named `.env`.
3. In `server/.env`, replace `MONGODB_URI` with your MongoDB Atlas connection string. Use your own database username and password; do not share this file or commit it to GitHub.
4. Keep `PORT=5000` and `CLIENT_URL=http://localhost:5173`.
5. Open a terminal in the project root and run:

```bash
npm install
npm run install-all
npm run dev
```

6. Open `http://localhost:5173`.
7. Use the Employee Portal to submit a leave request. Use the Admin Portal button at the top to approve or reject it. Data is stored in MongoDB.

If you already installed dependencies, run `npm run dev` from the project root.

## 3. Deploy backend on Render
1. Push the entire project folder to a GitHub repository.
2. In Render, choose **New + → Web Service**, connect your repository.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add environment variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `CLIENT_URL` = your deployed Vercel frontend URL (for example `https://your-app.vercel.app`)
   - `NODE_ENV` = `production`
7. Deploy. Copy the Render service URL, for example `https://leaveease-api.onrender.com`.
8. Check `https://YOUR-RENDER-URL/api/health` and confirm it returns a JSON status.

## 4. Deploy frontend on Vercel
1. In Vercel, import the same GitHub repository.
2. Set **Root Directory** to `client`.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add environment variable:
   - `VITE_API_URL` = your Render backend URL, without a trailing slash (example `https://leaveease-api.onrender.com`)
7. Deploy the frontend.
8. Copy the Vercel URL and update Render's `CLIENT_URL` to that exact URL, then redeploy the Render service if needed.

## 5. MongoDB Atlas checklist
- Create a database named `leaveease`.
- Create a database user and password.
- In Network Access, allow access from Render. For a student/demo project, `0.0.0.0/0` allows connections from any IP; use it only if you understand the exposure and protect the database with a strong unique password. Prefer restricted access where possible.
- Keep credentials only in environment variables. Never put the MongoDB URI in React source code.

## Important notes
- This is a learning/demo app and does not include user login or role-based security. The Admin Portal switch is a demonstration UI, not secure administrator authentication. Add authentication and authorization before using it for real employee data.
- Leave balances start at 10 casual days and 10 medical days per employee in this demo. Approved requests reduce the displayed balances.
- If Render's free service has gone idle, its first request may take a short time to wake up.
