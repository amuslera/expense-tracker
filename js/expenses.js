/**
 * Expenses View Controller
 * Renders the expenses page with category breakdown, payment methods,
 * and recent transactions list with edit/delete capabilities
 */

import { ExpenseData } from './data.js';

class ExpensesViewController {
  constructor() {
    this.data = new ExpenseData();
    this.currentMonth = new Date();
    this.showAllTransactions = false;
    this.transactionLimit = 10;
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount) {
    return `$${Math.abs(amount).toFixed(2)}`;
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Format date for grouping (without year if current year)
   */
  formatDateHeader(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Check if current year
    const options = date.getFullYear() === today.getFullYear()
      ? { month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'long', day: 'numeric' };

    return date.toLocaleDateString('en-US', options);
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
      console.error('Error initializing Expenses view:', error);
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
    await this.renderCategoryBreakdown();
    await this.renderPaymentMethods();
    await this.renderRecentTransactions();
    this.hideLoading();
  }

  /**
   * Render spending by category
   */
  async renderCategoryBreakdown() {
    const monthStart = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const monthEnd = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    const categoryData = await this.data.getCategoryBreakdown(monthStart, monthEnd);
    const container = document.querySelector('.category-breakdown');

    if (!container) return;

    if (categoryData.length === 0) {
      container.innerHTML = '<div class="empty-message">No expenses this month</div>';
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
   * Render payment method breakdown
   */
  async renderPaymentMethods() {
    const monthStart = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const monthEnd = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    const paymentData = await this.data.getPaymentMethodBreakdown(monthStart, monthEnd);
    const container = document.querySelector('.payment-methods');

    if (!container) return;

    // Calculate total for percentages
    const total = paymentData.reduce((sum, pm) => sum + pm.amount, 0);

    // Create payment method cards
    const paymentCards = paymentData.map(payment => {
      const percentage = total > 0 ? (payment.amount / total * 100) : 0;
      const icon = payment.method === 'Cash' ? '💵' : '💳';

      return `
        <div class="payment-card">
          <div class="payment-header">
            <span class="payment-icon">${icon}</span>
            <span class="payment-name">${payment.method}</span>
          </div>
          <div class="payment-amount">${this.formatCurrency(payment.amount)}</div>
          <div class="payment-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="progress-percentage">${percentage.toFixed(0)}%</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>Payment Methods</h2>
      </div>
      <div class="payment-list">
        ${paymentCards}
      </div>
    `;
  }

  /**
   * Render recent transactions list
   */
  async renderRecentTransactions() {
    const limit = this.showAllTransactions ? undefined : this.transactionLimit;
    const transactions = await this.data.getRecentTransactions(limit);

    const container = document.querySelector('.recent-transactions');
    if (!container) return;

    if (transactions.length === 0) {
      this.renderEmptyState(container);
      return;
    }

    // Group transactions by date
    const grouped = this.groupTransactionsByDate(transactions);

    // Render grouped transactions
    const transactionHtml = Object.keys(grouped).map(dateKey => {
      const date = new Date(dateKey);
      const dateTransactions = grouped[dateKey];

      const transactionCards = dateTransactions.map(transaction => {
        const color = transaction.color || this.getCategoryColor(transaction.category);

        return `
          <div class="transaction-card" data-id="${transaction.id}">
            <div class="transaction-icon" style="background-color: ${color}20">
              <span class="category-dot" style="background-color: ${color}"></span>
            </div>
            <div class="transaction-details">
              <div class="transaction-category">${transaction.category}</div>
              <div class="transaction-description">${transaction.description || 'No description'}</div>
              <div class="transaction-meta">
                ${transaction.paymentMethod} • ${new Date(transaction.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
            <div class="transaction-amount">${this.formatCurrency(transaction.amount)}</div>
            <div class="transaction-actions">
              <button class="btn-icon edit-btn" data-id="${transaction.id}" title="Edit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon delete-btn" data-id="${transaction.id}" title="Delete">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="transaction-group">
          <div class="date-separator">${this.formatDateHeader(date)}</div>
          ${transactionCards}
        </div>
      `;
    }).join('');

    // Build the full HTML
    const viewAllButton = !this.showAllTransactions && transactions.length >= this.transactionLimit
      ? `<button class="btn-secondary view-all-btn">View All Transactions</button>`
      : '';

    container.innerHTML = `
      <div class="section-header">
        <h2>Recent Transactions</h2>
      </div>
      <div class="transactions-list">
        ${transactionHtml}
      </div>
      ${viewAllButton}
    `;

    // Attach event listeners to transaction actions
    this.attachTransactionListeners();
  }

  /**
   * Group transactions by date
   */
  groupTransactionsByDate(transactions) {
    const grouped = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateKey = date.toDateString();

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(transaction);
    });

    return grouped;
  }

  /**
   * Render empty state
   */
  renderEmptyState(container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No transactions yet</h3>
        <p>Your expense history will appear here</p>
      </div>
    `;
  }

  /**
   * Get color for category
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
  }

  /**
   * Attach listeners to transaction edit/delete buttons
   */
  attachTransactionListeners() {
    // Edit buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleEditTransaction(e));
    });

    // Delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleDeleteTransaction(e));
    });

    // View All button
    const viewAllBtn = document.querySelector('.view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => this.handleViewAll());
    }
  }

  /**
   * Handle add expense button
   */
  handleAddExpense() {
    const modal = document.getElementById('addExpenseModal');
    if (modal) {
      modal.style.display = 'block';
      modal.classList.add('show');
    } else {
      window.location.href = 'add-expense.html';
    }
  }

  /**
   * Handle edit transaction
   */
  async handleEditTransaction(event) {
    const button = event.currentTarget;
    const transactionId = button.dataset.id;

    try {
      const transaction = await this.data.getTransactionById(transactionId);

      // Check if edit modal exists
      const modal = document.getElementById('editExpenseModal');
      if (modal) {
        this.populateEditModal(modal, transaction);
        modal.style.display = 'block';
        modal.classList.add('show');
      } else {
        // Store in sessionStorage and navigate to edit page
        sessionStorage.setItem('editTransaction', JSON.stringify(transaction));
        window.location.href = 'edit-expense.html';
      }
    } catch (error) {
      alert('Failed to load transaction details');
      console.error('Error loading transaction:', error);
    }
  }

  /**
   * Populate edit modal with transaction data
   */
  populateEditModal(modal, transaction) {
    modal.querySelector('#editAmount').value = transaction.amount;
    modal.querySelector('#editCategory').value = transaction.category;
    modal.querySelector('#editDescription').value = transaction.description || '';
    modal.querySelector('#editPaymentMethod').value = transaction.paymentMethod;
    modal.querySelector('#editDate').value = new Date(transaction.date).toISOString().split('T')[0];
    modal.dataset.transactionId = transaction.id;
  }

  /**
   * Handle delete transaction
   */
  async handleDeleteTransaction(event) {
    const button = event.currentTarget;
    const transactionId = button.dataset.id;

    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to delete this transaction?');

    if (!confirmed) return;

    try {
      // Add deleting animation
      const card = button.closest('.transaction-card');
      card.style.opacity = '0.5';
      card.style.pointerEvents = 'none';

      await this.data.deleteTransaction(transactionId);

      // Remove card with animation
      card.style.transform = 'translateX(-100%)';
      card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';

      setTimeout(async () => {
        await this.refresh();
      }, 300);

    } catch (error) {
      alert('Failed to delete transaction');
      console.error('Error deleting transaction:', error);

      // Restore card state
      const card = button.closest('.transaction-card');
      card.style.opacity = '1';
      card.style.pointerEvents = 'auto';
    }
  }

  /**
   * Handle View All button
   */
  handleViewAll() {
    this.showAllTransactions = true;
    this.renderRecentTransactions();
  }

  /**
   * Handle bottom navigation
   */
  handleNavigation(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const page = target.dataset.page;

    if (page) {
      window.location.href = page;
    }
  }

  /**
   * Set active navigation state
   */
  setActiveNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.page === 'expenses.html') {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Refresh the view
   */
  async refresh() {
    this.showLoading();
    await this.data.init();
    await this.render();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const controller = new ExpensesViewController();
  controller.init();

  // Make controller globally accessible
  window.expensesController = controller;
});
