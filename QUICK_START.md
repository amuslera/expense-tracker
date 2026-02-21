# Expense Tracker - Quick Start Guide

## 🎯 What You Have Now

A complete, production-ready expense tracking system with:
- **Web Dashboard**: Beautiful Spentzy-style UI (3 views)
- **WhatsApp Agent**: Ready to process expense submissions
- **Sample Data**: 8 transactions to test with

## 🚀 3 Steps to Launch

### Step 1: Test the Web Dashboard Locally (2 minutes)

```bash
cd /workspace/group/expense-tracker/web
# Open index.html in your browser
```

Or use a simple HTTP server:
```bash
cd /workspace/group/expense-tracker/web
python3 -m http.server 8000
# Open http://localhost:8000 in browser
```

You should see:
- ✅ This Week view with $482.28 total
- ✅ 8 sample transactions
- ✅ Category breakdown with progress bars
- ✅ Working navigation between views

### Step 2: Create GitHub Repository (5 minutes)

1. **Go to GitHub** and create new repository "expense-tracker"

2. **Push the web dashboard:**
```bash
cd /workspace/group/expense-tracker
git init
git add web/*
git commit -m "Initial expense tracker deployment

Complete Spentzy-style expense tracking web app with:
- This Week, Expenses, and Analytics views
- Category and payment method breakdowns
- Interactive charts with Chart.js
- Auto-sync with WhatsApp submissions

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

3. **Enable GitHub Pages:**
   - Go to repository Settings
   - Pages section
   - Source: main branch, / (root)
   - Save

4. **Access your live site:**
   `https://YOUR_USERNAME.github.io/expense-tracker/`

### Step 3: Connect WhatsApp Group (10 minutes)

1. **Create WhatsApp Group:**
   - Create new group "Expense Tracker" or similar
   - Add yourself

2. **Register the Group:**
   Tell me "Register the Expense Tracker WhatsApp group" and I'll:
   - Find the group JID from available groups
   - Add it to registered_groups.json
   - Configure the expense parser agent

3. **Test Expense Submission:**
   Send to the WhatsApp group:
   ```
   Voice: "Gasté 50 dólares en almuerzo con tarjeta"
   or
   Text: Almuerzo $50 card
   ```

   The agent will:
   - Extract the expense details
   - Save to expenses.json
   - Commit to GitHub
   - Web dashboard updates within 60 seconds

## 📱 How to Use Daily

### Adding Expenses (WhatsApp)

**Quick text:**
```
Lunch $45
Netflix $15.99 card
Uber 25 cash
```

**Detailed voice:**
```
"Gasté ochenta y seis dólares en la suscripción de X, pagué con tarjeta"
"Spent $50 on groceries with cash"
```

**Receipt photo:**
Just send a photo of the receipt - AI extracts the details

The agent will ask if anything is missing:
```
Agent: Got it! Payment method? (Cash or Card)
You: Card
Agent: ✅ Expense recorded: $45.00 - Lunch - Card
```

### Viewing Expenses (Web Dashboard)

1. **This Week View** - Quick overview of current week
2. **Expenses View** - Full transaction list with edit/delete
3. **Analytics View** - Charts and trends

## 🔧 Configuration

### Change Auto-Refresh Interval

Edit `web/js/data.js`:
```javascript
const AUTO_REFRESH_INTERVAL = 60000; // Change to 30000 for 30 seconds
```

### Add Custom Categories

Edit `web/data/expenses.json` and `/workspace/project/groups/expense-tracker/expenses.json`:
```json
{
  "categories": [
    "Bills & Utilities",
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Health",
    "Pets",           // Add new category
    "Travel",         // Add new category
    "Other"
  ]
}
```

Update category colors in `web/js/charts.js`:
```javascript
const CATEGORY_COLORS = {
  'Bills & Utilities': '#4F7CFF',
  'Food & Dining': '#10B981',
  'Transportation': '#F59E0B',
  'Shopping': '#EC4899',
  'Entertainment': '#8B5CF6',
  'Health': '#EF4444',
  'Pets': '#06B6D4',        // Add color
  'Travel': '#F97316',      // Add color
  'Other': '#6B7280'
};
```

### Update Colors/Theme

Edit `web/css/main.css`:
```css
:root {
  --color-primary: #4F7CFF;      /* Change primary color */
  --color-dark: #1E293B;         /* Change dark sections */
  --color-success: #10B981;      /* Change success color */
  /* etc... */
}
```

## 🐛 Troubleshooting

### Web Dashboard Not Loading Data

1. Check browser console for errors
2. Verify `web/data/expenses.json` exists
3. Clear localStorage: `localStorage.clear()` in console
4. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### WhatsApp Agent Not Responding

1. Check if group is registered: I can check `registered_groups.json`
2. Verify agent instructions: `/workspace/project/groups/expense-tracker/CLAUDE.md`
3. Check if trigger word is needed (depends on group settings)

### GitHub Pages Not Updating

1. Check if commit was pushed: `git log`
2. GitHub Pages can take 1-2 minutes to deploy
3. Clear browser cache and hard refresh

### Charts Not Showing

1. Verify Chart.js loaded: Check browser console
2. Check if `<script>` tag for Chart.js CDN is present in analytics.html
3. Verify canvas elements have correct IDs

## 📊 Sample Data Breakdown

The included sample data shows:
- **Total**: $482.28 over 8 transactions
- **This Week**: $156.50 (2 transactions)
- **This Month**: $482.28 (8 transactions)
- **Categories**: Bills, Food, Transport, Shopping, Entertainment, Health
- **Payment**: 87.5% Card, 12.5% Cash

## 🎓 Learning Resources

- **Chart.js Docs**: https://www.chartjs.org/docs/latest/
- **GitHub Pages**: https://docs.github.com/en/pages
- **CSS Variables**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

## 💬 Get Help

If you need help:
1. Check `BUILD_SUMMARY.md` for technical details
2. Check `PROJECT_PLAN.md` for architecture overview
3. Ask me! I can help debug or add features

## 🎉 You're Ready!

Your expense tracker is fully built and ready to deploy. Just follow the 3 steps above and you'll be tracking expenses via WhatsApp in minutes!

**Next message to me:**
"Let's deploy this to GitHub Pages" or "Register the WhatsApp group for expense tracking"
