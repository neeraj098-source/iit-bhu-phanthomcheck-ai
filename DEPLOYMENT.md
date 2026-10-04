# Deployment Guide: PhantomCheck AI

This guide explains how to deploy the PhantomCheck AI application to the cloud.

## 1. Backend Deployment (Render.com)

Render is recommended for the FastAPI backend because it supports Docker out of the box.

1.  **Create a New Web Service** on Render.
2.  **Connect your GitHub Repository**.
3.  **Select Docker** as the runtime.
4.  **Root Directory**: Set to `backend`.
5.  **Environment Variables**: Add the following keys from your `.env` file:
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_KEY`
    - `GROQ_API_KEY`
    - `VIRUSTOTAL_API_KEY`
    - `URLSCAN_API_KEY`
    - `ALLOWED_ORIGINS`: Set this to your frontend URL (e.g., `https://phantomcheck.vercel.app`).
6.  **Health Check Path**: Set to `/health`.

## 2. Frontend Deployment (Vercel or Netlify)

Vercel is the easiest place to deploy the React frontend.

1.  **Create a New Project** on Vercel.
2.  **Connect your GitHub Repository**.
3.  **Root Directory**: Set to `frontend`.
4.  **Framework Preset**: Select `Vite`.
5.  **Environment Variables**:
    - `VITE_API_URL`: Set this to your **Backend URL** (e.g., `https://phantomcheck-backend.onrender.com`).
6.  **Deploy**.

## 3. Database Setup (Supabase)

If you haven't already, ensure your Supabase database is ready:
1.  Go to the **SQL Editor** in your Supabase dashboard.
2.  Paste and run the contents of `supabase_schema.sql` (found in the root of this project).

## 4. Production Checklist

- [ ] Backend is running and `/health` returns `{"status":"ok"}`.
- [ ] Frontend `VITE_API_URL` points to the production backend.
- [ ] Backend `ALLOWED_ORIGINS` includes the production frontend URL.
- [ ] All API keys are present in the cloud environment variables.
