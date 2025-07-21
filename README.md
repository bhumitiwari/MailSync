MailSync 🧠
Sync, Summarize, Act
MailSync is a smart email assistant that transforms your email chaos into actionable insights. It connects to your Gmail account, uses the Gemini AI to summarize recent emails, and helps you build a persistent to-do list from the actions it discovers.

Live Demo URL: https://mail-sync-ten.vercel.app/
⚠️ Important Note: As of now, Google is blocking new users from signing in because this application has not yet completed Google's official verification process. To test the application, you will need to clone the repository, set it up with your own API keys, and add your Google account as a "Test User" in the Google Cloud Console.

About The Project
This application was built to solve the problem of email overload. Instead of manually sifting through dozens of emails every day, MailSync provides:

Automatic Daily Sync: On your first visit of the day, the app automatically fetches and analyzes your recent emails.

AI-Powered Summaries: Each email from your primary inbox is individually summarized, showing the sender and a concise summary.

Actionable Insights: The AI identifies potential to-do items from your emails, such as tasks, meeting requests, or registrations.

Interactive To-Do List: You can select which suggested actions to add to a persistent to-do list that is saved to a database.

Modern, Animated UI: A beautiful and responsive interface built with Tailwind CSS and Framer Motion, featuring a dynamic 3D background.

Built With
This project leverages a modern, full-stack tech stack:

Next.js - React Framework

React - Frontend Library

Tailwind CSS - Utility-First CSS Framework

Framer Motion - Animation Library

Three.js - 3D Graphics Library

NextAuth.js - Authentication

MongoDB Atlas - Database

Google Gemini API - AI for Summarization

Gmail API - Email Fetching

Vercel - Deployment
