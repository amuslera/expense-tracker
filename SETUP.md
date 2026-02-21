# Expense Tracker Setup Guide

## Project Status

✅ Project plan created
✅ WhatsApp agent instructions written
✅ Data structure initialized
⏳ WhatsApp group registration (needs to be done)
⏳ Web dashboard development (ready to start)
⏳ GitHub Pages deployment (after dashboard is built)

## What's Done

1. **Project Structure**: Created `/workspace/group/expense-tracker/` with web, docs, and data folders
2. **Agent Instructions**: Created `/workspace/project/groups/expense-tracker/CLAUDE.md` with full expense parsing logic
3. **Data Schema**: Created `expenses.json` with transaction structure
4. **Project Plan**: Comprehensive plan in `PROJECT_PLAN.md`

## Next Steps

### Step 1: Register WhatsApp Group

You need to create a WhatsApp group called "Expense Tracker" (or similar), then we'll register it:

```
When ready, tell me the group name and I'll:
1. Find the group JID from available_groups.json
2. Register it in registered_groups.json
3. Test the expense submission flow
```

### Step 2: Build Web Dashboard

We'll spin up agents to build:
- **UI/CSS Agent**: Spentzy-inspired design system
- **Data Agent**: Fetching and state management
- **Charts Agent**: Visualizations and analytics
- **Pages Agent**: This Week, Expenses, Analytics views

### Step 3: Deploy to GitHub Pages

Once the dashboard is ready:
1. Create GitHub repository `expense-tracker`
2. Push web folder to main branch
3. Enable GitHub Pages
4. Configure custom domain (optional)

## Architecture Overview

```
┌─────────────────┐
│  WhatsApp User  │
└────────┬────────┘
         │ Voice/Text/Photo
         ↓
┌─────────────────────┐
│  NanoClaw Agent     │  ← You are here
│  (Expense Parser)   │
└────────┬────────────┘
         │ Extracts data
         ↓
┌─────────────────────┐
│  expenses.json      │
│  (Master Database)  │
└────────┬────────────┘
         │ Auto-commit
         ↓
┌─────────────────────┐
│  GitHub Repository  │
│  (expense-tracker)  │
└────────┬────────────┘
         │ GitHub Pages
         ↓
┌─────────────────────┐
│  Web Dashboard      │
│  (Static Site)      │
└─────────────────────┘
```

## File Structure

```
/workspace/group/expense-tracker/
├── web/                          # Web dashboard (to be built)
│   ├── index.html
│   ├── expenses.html
│   ├── analytics.html
│   ├── css/main.css
│   ├── js/
│   └── data/expenses.json       # Synced from master
├── docs/
├── PROJECT_PLAN.md
└── SETUP.md                      # This file

/workspace/project/groups/expense-tracker/
├── CLAUDE.md                     # ✅ WhatsApp agent instructions
└── expenses.json                # ✅ Master expense database
```

## Ready to Proceed?

Let me know when you:
1. Create the WhatsApp group, and I'll register it
2. Want to start building the web dashboard (I'll spin up agents)
3. Have any questions about the architecture
