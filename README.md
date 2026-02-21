# Expense Tracker Web Dashboard

A beautiful, Spentzy-inspired expense tracking web application.

## Features

- **This Week View**: Weekly and monthly summaries with category breakdowns
- **Expenses View**: Transaction list with payment method analytics
- **Analytics View**: Charts and visualizations for spending insights
- **WhatsApp Integration**: Submit expenses via WhatsApp messages (voice, text, or photos)

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Charts**: Chart.js v4.4.0
- **Hosting**: GitHub Pages (static site)
- **Data**: JSON file synced from WhatsApp agent

## File Structure

```
web/
├── index.html              # This Week view
├── expenses.html           # Expenses list view
├── analytics.html          # Analytics & charts view
├── css/
│   └── main.css           # Complete design system
├── js/
│   ├── data.js            # Data fetching & state management
│   ├── thisweek.js        # This Week view controller
│   ├── expenses.js        # Expenses view controller
│   ├── analytics.js       # Analytics view controller
│   └── charts.js          # Chart.js visualizations
└── data/
    └── expenses.json      # Expense data (auto-synced from WhatsApp)
```

## Quick Start

### Local Development

1. Open `index.html` in a browser (use Live Server for best experience)
2. The app will load sample data from `data/expenses.json`
3. Navigate between views using bottom navigation

### GitHub Pages Deployment

1. Create a new repository (e.g., `expense-tracker`)
2. Push the `web/` folder contents to the main branch:
   ```bash
   cd /workspace/group/expense-tracker
   git init
   git add web/*
   git commit -m "Initial expense tracker deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
   git push -u origin main
   ```
3. Enable GitHub Pages in repository settings (Source: main branch, / root)
4. Access at: `https://YOUR_USERNAME.github.io/expense-tracker/`

## WhatsApp Integration

The web app is designed to work with a WhatsApp agent that:
1. Receives expense submissions (voice, text, photos)
2. Extracts expense information (amount, category, description, etc.)
3. Saves to `/workspace/project/groups/expense-tracker/expenses.json`
4. Auto-commits to GitHub to update `web/data/expenses.json`
5. Web app auto-refreshes every 60 seconds to show new expenses

## Usage

### Viewing Expenses
- **This Week**: Overview of current week spending with category breakdown
- **Expenses**: Detailed transaction list with edit/delete options
- **Analytics**: Charts showing trends, category distribution, and insights

### Adding Expenses (via WhatsApp)
Send a message to the "Expense Tracker" WhatsApp group:

**Voice**: "Gasté ochenta y seis dólares en la suscripción de X, pagué con tarjeta"

**Text**: "Almuerzo $45 con tarjeta"

**Photo**: Send a receipt image - the AI will extract the details

The agent will:
- Extract the expense information
- Ask for any missing details
- Save to the database
- Confirm with a summary
- Auto-sync to the web app

## Data Format

Expenses are stored in JSON format:

```json
{
  "transactions": [
    {
      "id": "txn-1708531200000",
      "amount": 86.00,
      "currency": "USD",
      "category": "Bills & Utilities",
      "description": "X subscription",
      "paymentMethod": "Card",
      "date": "2026-02-19T18:30:00.000Z",
      "source": "whatsapp-voice",
      "status": "confirmed"
    }
  ],
  "categories": [
    "Bills & Utilities",
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Health",
    "Other"
  ]
}
```

## Customization

### Colors
Edit CSS variables in `css/main.css`:
```css
:root {
  --color-primary: #4F7CFF;
  --color-dark: #1E293B;
  --color-success: #10B981;
  /* ... */
}
```

### Categories
Edit `data/expenses.json` to add/remove categories

### Auto-Refresh Interval
Edit `data.js`:
```javascript
const AUTO_REFRESH_INTERVAL = 60000; // milliseconds
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Android)
- Requires JavaScript enabled

## License

MIT License - Free to use and modify
