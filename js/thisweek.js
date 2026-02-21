/**
 * This Week View Controller
 * Renders the main dashboard showing weekly and monthly summaries,
 * spending by category, and quick action buttons
 */

import { ExpenseData } from './data.js';

class ThisWeekViewController {
  constructor() {
    this.data = new ExpenseData();
    this.currentWeekStart = this.getWeekStart(new Date());
    this.currentWeekEnd = this.getWeekEnd(this.currentWeekStart);
  }

  /**
   * Get the start of the week (Monday) for a given date
   */
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  /**
   * Get the end of the week (Sunday) for a given week start
   */
  getWeekEnd(weekStart) {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
  }

  /**
   * Format date range for display
   */
  formatDateRange(start, end) {
    const options = { month: 'short', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', options);
    return `${startStr} - ${endStr}`;
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount) {
    return `$${Math.abs(amount).toFixed(2)}`;
  }

  /**
   * Initialize the view
   */
  async init() {
    try {
      this.showLoading();
      await this.data.init();
      await this.render();
      this.attachEventListeners();
      this.setActiveNavigation();
    } catch (error) {
      this.showError('Failed to load expense data');
      console.error('Error initializing This Week view:', error);
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    const container = document.querySelector('.content-container');
    if (container) {
      container.style.opacity = '0.5';
      container.style.pointerEvents = 'none';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const container = document.querySelector('.content-container');
    if (container) {
      container.style.opacity = '1';
      container.style.pointerEvents = 'auto';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const container = document.querySelector('.content-container');
    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <p>${message}</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }

  /**
   * Render the entire view
   */
  async render() {
    await this.renderWeekHeader();
    await this.renderSummaryCards();
    await this.renderCategoryBreakdown();
    this.hideLoading();
  }

  /**
   * Render week date range in header
   */
  async renderWeekHeader() {
    const header = document.querySelector('.week-header');
    if (!header) return;

    const dateRange = this.formatDateRange(this.currentWeekStart, this.currentWeekEnd);
    header.textContent = dateRange;
  }

  /**
   * Render This Week and This Month summary cards
   */
  async renderSummaryCards() {
    // Get week summary
    const weekSummary = await this.data.getWeeklySummary(this.currentWeekStart);
    const weekCard = document.querySelector('.summary-card.week');
    if (weekCard) {
      this.renderSummaryCard(weekCard, weekSummary, 'This Week');
    }

    // Get month summary
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSummary = await this.data.getMonthlySummary(monthStart);
    const monthCard = document.querySelector('.summary-card.month');
    if (monthCard) {
      this.renderSummaryCard(monthCard, monthSummary, 'This Month');
    }
  }

  /**
   * Render individual summary card
   */
  renderSummaryCard(card, summary, title) {
    const amount = this.formatCurrency(summary.total);
    const count = summary.count;

    card.innerHTML = `
      <div class="card-header">
        <h3>${title}</h3>
      </div>
      <div class="card-body">
        <div class="amount">${amount}</div>
        <div class="transaction-count">${count} transaction${count !== 1 ? 's' : ''}</div>
      </div>
    `;

    // Add animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 50);
  }

  /**
   * Render spending by category breakdown
   */
  async renderCategoryBreakdown() {
    const categoryData = await this.data.getCategoryBreakdown(
      this.currentWeekStart,
      this.currentWeekEnd
    );

    const container = document.querySelector('.category-breakdown');
    if (!container) return;

    if (categoryData.length === 0) {
      this.renderEmptyState(container);
      return;
    }

    // Calculate total for percentages
    const total = categoryData.reduce((sum, cat) => sum + cat.amount, 0);

    // Sort by amount (highest first)
    categoryData.sort((a, b) => b.amount - a.amount);

    // Render category list
    const categoryList = categoryData.map((category, index) => {
      const percentage = total > 0 ? (category.amount / total * 100) : 0;
      const color = category.color || this.getCategoryColor(category.name);

      return `
        <div class="category-item" style="animation-delay: ${index * 0.05}s">
          <div class="category-header">
            <div class="category-info">
              <span class="category-dot" style="background-color: ${color}"></span>
              <span class="category-name">${category.name}</span>
            </div>
            <div class="category-amount">${this.formatCurrency(category.amount)}</div>
          </div>
          <div class="category-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%; background-color: ${color}"></div>
            </div>
            <span class="progress-percentage">${percentage.toFixed(0)}%</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>Spending by Category</h2>
      </div>
      <div class="category-list">
        ${categoryList}
      </div>
    `;
  }

  /**
   * Render empty state when no data
   */
  renderEmptyState(container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No expenses yet</h3>
        <p>Start tracking your spending by adding your first expense</p>
        <button class="btn-primary" onclick="document.querySelector('.fab').click()">
          Add Expense
        </button>
      </div>
    `;
  }

  /**
   * Get color for category (fallback if not in data)
   */
  getCategoryColor(categoryName) {
    const colors = {
      'Food': '#FF6B6B',
      'Transport': '#4ECDC4',
      'Shopping': '#45B7D1',
      'Entertainment': '#FFA07A',
      'Bills': '#98D8C8',
      'Health': '#F7B731',
      'Other': '#95A5A6'
    };
    return colors[categoryName] || '#95A5A6';
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Floating action button
    const fab = document.querySelector('.fab');
    if (fab) {
      fab.addEventListener('click', () => this.handleAddExpense());
    }

    // Bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => this.handleNavigation(e));
    });

    // Previous/Next week navigation (if exists)
    const prevWeek = document.querySelector('.prev-week');
    const nextWeek = document.querySelector('.next-week');

    if (prevWeek) {
      prevWeek.addEventListener('click', () => this.navigateWeek(-1));
    }

    if (nextWeek) {
      nextWeek.addEventListener('click', () => this.navigateWeek(1));
    }
  }

  /**
   * Handle add expense button click
   */
  handleAddExpense() {
    // Check if modal exists
    const modal = document.getElementById('addExpenseModal');
    if (modal) {
      modal.style.display = 'block';
      modal.classList.add('show');
    } else {
      // Navigate to add expense page if modal doesn't exist
      window.location.href = 'add-expense.html';
    }
  }

  /**
   * Handle bottom navigation clicks
   */
  handleNavigation(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const page = target.dataset.page;

    if (page && page !== 'index.html') {
      window.location.href = page;
    }
  }

  /**
   * Set active state on bottom navigation
   */
  setActiveNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.page === 'index.html' || item.dataset.page === '') {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Navigate to previous/next week
   */
  async navigateWeek(direction) {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (direction * 7));
    this.currentWeekEnd = this.getWeekEnd(this.currentWeekStart);

    this.showLoading();
    await this.render();
  }

  /**
   * Refresh data (called when new expense is added)
   */
  async refresh() {
    this.showLoading();
    await this.data.init();
    await this.render();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const controller = new ThisWeekViewController();
  controller.init();

  // Make controller globally accessible for refresh after adding expense
  window.thisWeekController = controller;
});
