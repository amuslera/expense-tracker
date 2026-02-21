# Expense Tracker - WhatsApp-Powered

## Project Vision

A Spentzy-style expense tracking web app where users can submit expenses via WhatsApp (voice, text, or photos) and view beautiful analytics on a web dashboard.

## Key Features

### 1. WhatsApp Input Interface
- Dedicated WhatsApp group for expense submissions
- Multi-modal input:
  - **Voice messages**: "Gasté $86 en la suscripción de X"
  - **Text messages**: "Almuerzo $45 - comida"
  - **Photos**: Receipt images with OCR extraction
- AI-powered parsing to extract:
  - Amount
  - Category (Bills & Utilities, Food, Transport, etc.)
  - Description
  - Payment method (Cash/Card)
  - Date
- Interactive clarification when info is missing
- Confirmation messages with extracted details

### 2. Web Dashboard (GitHub Pages)
- **This Week View**:
  - Week date range
  - Total spending
  - Transaction count
  - Category breakdown with percentages
  - Month summary
- **Expenses View**:
  - Recent transactions list
  - Edit/Delete capabilities
  - Add manual expense button
  - Category and payment method charts
- **Analytics View**:
  - Spending trends
  - Category comparisons
  - Monthly reports

### 3. Data Architecture
- **Primary Storage**: `/workspace/project/groups/expense-tracker/expenses.json`
- **Web Sync**: Web app fetches from GitHub Pages deployed JSON
- **Schema**:
```json
{
  "transactions": [
    {
      "id": "txn-1234567890",
      "amount": 86.00,
      "currency": "USD",
      "category": "Bills & Utilities",
      "description": "X subscription",
      "paymentMethod": "Card",
      "date": "2026-02-19T18:30:00Z",
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

## Technical Stack

### Backend (WhatsApp Agent)
- NanoClaw WhatsApp integration
- Voice transcription (built-in)
- Image OCR for receipts (Tesseract or Claude vision)
- Natural language processing for expense extraction
- JSON database persistence
- Auto-commit to GitHub for web sync

### Frontend (Web Dashboard)
- Static HTML/CSS/JavaScript
- GitHub Pages deployment
- Chart.js or similar for visualizations
- localStorage for offline caching
- Responsive mobile-first design
- Similar styling to Spentzy (gradients, cards, clean UI)

## Implementation Phases

### Phase 1: WhatsApp Group Setup ✓
- [ ] Register new WhatsApp group "Expense Tracker"
- [ ] Create group-specific CLAUDE.md instructions
- [ ] Set up expenses.json data structure

### Phase 2: Expense Parser Agent
- [ ] Voice message parser (Spanish/English)
- [ ] Text message parser
- [ ] Receipt photo OCR parser
- [ ] Entity extraction (amount, category, method, date)
- [ ] Validation and clarification logic
- [ ] Confirmation message formatting

### Phase 3: Data Management
- [ ] JSON database operations (add, edit, delete)
- [ ] Auto-commit to GitHub on changes
- [ ] Data validation and schema enforcement
- [ ] Category management
- [ ] Export functionality

### Phase 4: Web Dashboard
- [ ] HTML structure (3 pages/views)
- [ ] CSS styling (Spentzy-inspired)
- [ ] JavaScript data fetching and rendering
- [ ] Charts and visualizations
- [ ] This Week view
- [ ] Expenses list view
- [ ] Analytics view
- [ ] Responsive design

### Phase 5: Integration & Polish
- [ ] End-to-end testing
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] GitHub Pages deployment
- [ ] Documentation

## File Structure

```
expense-tracker/
├── web/                          # GitHub Pages site
│   ├── index.html               # This Week view
│   ├── expenses.html            # Expenses list
│   ├── analytics.html           # Analytics
│   ├── css/
│   │   └── main.css            # Spentzy-style design
│   ├── js/
│   │   ├── data.js             # Data fetching/sync
│   │   ├── thisweek.js         # Week view logic
│   │   ├── expenses.js         # Expenses view logic
│   │   ├── analytics.js        # Analytics view logic
│   │   └── charts.js           # Chart rendering
│   └── data/
│       └── expenses.json       # Published expense data
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
└── PROJECT_PLAN.md             # This file

/workspace/project/groups/expense-tracker/
├── CLAUDE.md                    # WhatsApp agent instructions
├── expenses.json               # Master data file
├── categories.json             # Category definitions
└── parsers/
    ├── voice_parser.md         # Voice parsing patterns
    ├── text_parser.md          # Text parsing patterns
    └── receipt_parser.md       # OCR extraction patterns
```

## Next Steps

1. Create WhatsApp group for expense tracking
2. Develop expense parser with pattern matching
3. Build web dashboard with Spentzy-inspired UI
4. Test end-to-end flow
5. Deploy to GitHub Pages

## Example Workflows

### Workflow 1: Voice Expense
```
User: [Voice] "Gasté ochenta y seis dólares en la suscripción de X, pagué con tarjeta"

Agent: ✅ Expense recorded:
• Amount: $86.00
• Category: Bills & Utilities
• Description: X subscription
• Payment: Card
• Date: Feb 19, 2026
```

### Workflow 2: Text Expense
```
User: Almuerzo $45

Agent: Got it! A few questions:
• Category? (Food & Dining, Other)
• Payment method? (Cash, Card)

User: Food, card

Agent: ✅ Expense recorded:
• Amount: $45.00
• Category: Food & Dining
• Description: Almuerzo
• Payment: Card
• Date: Feb 20, 2026
```

### Workflow 3: Receipt Photo
```
User: [Photo of receipt]

Agent: [Extracts from receipt]
✅ Expense recorded:
• Amount: $25.50
• Category: Transportation
• Description: Uber ride
• Payment: Card
• Date: Feb 20, 2026
```

## Success Criteria

- ✅ Can submit expenses via WhatsApp in < 30 seconds
- ✅ 95%+ accuracy in expense extraction
- ✅ Web dashboard updates within 1 minute of submission
- ✅ Beautiful, mobile-responsive UI matching Spentzy aesthetic
- ✅ Support for voice, text, and photo inputs
- ✅ Works offline with localStorage caching
