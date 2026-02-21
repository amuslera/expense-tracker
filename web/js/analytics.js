/**
 * Analytics View Controller
 * Renders analytics page with charts, statistics, and insights
 * Coordinates with charts.js for visualization
 */

import { ExpenseData } from './data.js';

class AnalyticsViewController {
  constructor() {
    this.data = new ExpenseData();
    this.currentPeriod = 'month'; // 'week', 'month', 'year'
    this.chartInstances = {};
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount) {
    return `$${Math.abs(amount).toFixed(2)}`;
  }

  /**
   * Get date range based on current period
   */
  getDateRange() {
    const now = new Date();
    let start, end;

    switch (this.currentPeriod) {
      case 'week':
        start = this.getWeekStart(now);
        end = this.getWeekEnd(start);
        break;

      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;

      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;

      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return { start, end };
  }

  /**
   * Get week start (Monday)
   */
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  /**
   * Get week end (Sunday)
   */
  getWeekEnd(weekStart) {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return end;
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
      this.showError('Failed to load analytics data');
      console.error('Error initializing Analytics view:', error);
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
    await this.renderPeriodSelector();
    await this.renderSummaryStats();
    await this.renderCharts();
    await this.renderInsights();
    this.hideLoading();
  }

  /**
   * Render period selector (week/month/year)
   */
  async renderPeriodSelector() {
    const selector = document.querySelector('.period-selector');
    if (!selector) return;

    const periods = [
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' }
    ];

    const buttons = periods.map(period => {
      const activeClass = period.value === this.currentPeriod ? 'active' : '';
      return `
        <button class="period-btn ${activeClass}" data-period="${period.value}">
          ${period.label}
        </button>
      `;
    }).join('');

    selector.innerHTML = buttons;

    // Attach click handlers
    selector.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handlePeriodChange(e));
    });
  }

  /**
   * Render summary statistics
   */
  async renderSummaryStats() {
    const { start, end } = this.getDateRange();
    const stats = await this.calculateStatistics(start, end);

    const container = document.querySelector('.summary-stats');
    if (!container) return;

    const statsHtml = `
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-label">Total Spending</div>
          <div class="stat-value">${this.formatCurrency(stats.totalSpending)}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">Daily Average</div>
          <div class="stat-value">${this.formatCurrency(stats.dailyAverage)}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <div class="stat-label">Top Category</div>
          <div class="stat-value">${stats.topCategory || 'N/A'}</div>
          <div class="stat-subtext">${stats.topCategoryAmount ? this.formatCurrency(stats.topCategoryAmount) : ''}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-label">Transactions</div>
          <div class="stat-value">${stats.transactionCount}</div>
        </div>
      </div>
    `;

    container.innerHTML = statsHtml;
  }

  /**
   * Calculate statistics for the period
   */
  async calculateStatistics(start, end) {
    const transactions = await this.data.getTransactionsByDateRange(start, end);
    const categoryBreakdown = await this.data.getCategoryBreakdown(start, end);

    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Calculate days in period
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const dailyAverage = totalSpending / days;

    // Find top category
    let topCategory = null;
    let topCategoryAmount = 0;

    if (categoryBreakdown.length > 0) {
      const sorted = categoryBreakdown.sort((a, b) => b.amount - a.amount);
      topCategory = sorted[0].name;
      topCategoryAmount = sorted[0].amount;
    }

    return {
      totalSpending,
      dailyAverage,
      topCategory,
      topCategoryAmount,
      transactionCount: transactions.length
    };
  }

  /**
   * Render charts
   */
  async renderCharts() {
    const { start, end } = this.getDateRange();

    // Prepare data for charts
    await this.renderSpendingTrendChart(start, end);
    await this.renderCategoryPieChart(start, end);
    await this.renderPaymentMethodChart(start, end);
  }

  /**
   * Render spending trend chart (line/bar chart)
   */
  async renderSpendingTrendChart(start, end) {
    const canvas = document.getElementById('spendingTrendChart');
    if (!canvas) return;

    const trendData = await this.prepareSpendingTrendData(start, end);

    // Check if charts.js is loaded and has the function
    if (window.ExpenseCharts && window.ExpenseCharts.renderSpendingTrend) {
      this.chartInstances.trend = window.ExpenseCharts.renderSpendingTrend(
        canvas,
        trendData,
        this.currentPeriod
      );
    } else {
      // Fallback rendering
      this.renderFallbackChart(canvas, 'Spending Trend');
    }
  }

  /**
   * Render category pie chart
   */
  async renderCategoryPieChart(start, end) {
    const canvas = document.getElementById('categoryPieChart');
    if (!canvas) return;

    const categoryData = await this.data.getCategoryBreakdown(start, end);

    // Check if charts.js is loaded
    if (window.ExpenseCharts && window.ExpenseCharts.renderCategoryPie) {
      this.chartInstances.category = window.ExpenseCharts.renderCategoryPie(
        canvas,
        categoryData
      );
    } else {
      this.renderFallbackChart(canvas, 'Category Breakdown');
    }
  }

  /**
   * Render payment method chart
   */
  async renderPaymentMethodChart(start, end) {
    const canvas = document.getElementById('paymentMethodChart');
    if (!canvas) return;

    const paymentData = await this.data.getPaymentMethodBreakdown(start, end);

    // Check if charts.js is loaded
    if (window.ExpenseCharts && window.ExpenseCharts.renderPaymentMethodBar) {
      this.chartInstances.payment = window.ExpenseCharts.renderPaymentMethodBar(
        canvas,
        paymentData
      );
    } else {
      this.renderFallbackChart(canvas, 'Payment Methods');
    }
  }

  /**
   * Prepare spending trend data based on period
   */
  async prepareSpendingTrendData(start, end) {
    const transactions = await this.data.getTransactionsByDateRange(start, end);

    let labels = [];
    let data = [];

    if (this.currentPeriod === 'week') {
      // Daily breakdown for week
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      data = new Array(7).fill(0);

      transactions.forEach(t => {
        const day = new Date(t.date).getDay();
        const index = day === 0 ? 6 : day - 1; // Convert to Mon=0, Sun=6
        data[index] += t.amount;
      });

    } else if (this.currentPeriod === 'month') {
      // Weekly breakdown for month
      const weeks = this.getWeeksInMonth(start);
      labels = weeks.map((w, i) => `Week ${i + 1}`);
      data = new Array(weeks.length).fill(0);

      transactions.forEach(t => {
        const date = new Date(t.date);
        const weekIndex = this.getWeekIndexInMonth(date, weeks);
        if (weekIndex >= 0) {
          data[weekIndex] += t.amount;
        }
      });

    } else if (this.currentPeriod === 'year') {
      // Monthly breakdown for year
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = new Array(12).fill(0);

      transactions.forEach(t => {
        const month = new Date(t.date).getMonth();
        data[month] += t.amount;
      });
    }

    return { labels, data };
  }

  /**
   * Get weeks in a month
   */
  getWeeksInMonth(monthStart) {
    const weeks = [];
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    let currentWeekStart = this.getWeekStart(monthStart);

    while (currentWeekStart <= monthEnd) {
      const currentWeekEnd = this.getWeekEnd(currentWeekStart);
      weeks.push({ start: new Date(currentWeekStart), end: currentWeekEnd });
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
  }

  /**
   * Get week index in month
   */
  getWeekIndexInMonth(date, weeks) {
    for (let i = 0; i < weeks.length; i++) {
      if (date >= weeks[i].start && date <= weeks[i].end) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Render fallback chart (when charts.js not available)
   */
  renderFallbackChart(canvas, title) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, canvas.height / 2);
  }

  /**
   * Render insights and recommendations
   */
  async renderInsights() {
    const { start, end } = this.getDateRange();
    const insights = await this.generateInsights(start, end);

    const container = document.querySelector('.insights-section');
    if (!container) return;

    if (insights.length === 0) {
      container.innerHTML = '<div class="no-insights">No insights available yet</div>';
      return;
    }

    const insightsHtml = insights.map((insight, index) => `
      <div class="insight-card" style="animation-delay: ${index * 0.1}s">
        <div class="insight-icon">${insight.icon}</div>
        <div class="insight-content">
          <div class="insight-title">${insight.title}</div>
          <div class="insight-description">${insight.description}</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>Insights</h2>
      </div>
      <div class="insights-list">
        ${insightsHtml}
      </div>
    `;
  }

  /**
   * Generate insights based on spending patterns
   */
  async generateInsights(start, end) {
    const insights = [];
    const transactions = await this.data.getTransactionsByDateRange(start, end);
    const categoryBreakdown = await this.data.getCategoryBreakdown(start, end);

    if (transactions.length === 0) {
      return insights;
    }

    // Insight 1: Highest spending category
    if (categoryBreakdown.length > 0) {
      const sorted = categoryBreakdown.sort((a, b) => b.amount - a.amount);
      const total = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
      const percentage = (sorted[0].amount / total * 100).toFixed(0);

      insights.push({
        icon: '🏆',
        title: `${sorted[0].name} is your top expense`,
        description: `You spent ${this.formatCurrency(sorted[0].amount)} (${percentage}% of total) on ${sorted[0].name} this ${this.currentPeriod}.`
      });
    }

    // Insight 2: Spending trend
    const previousPeriod = this.getPreviousPeriod(start);
    const previousTransactions = await this.data.getTransactionsByDateRange(
      previousPeriod.start,
      previousPeriod.end
    );

    const currentTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
    const previousTotal = previousTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (previousTotal > 0) {
      const change = ((currentTotal - previousTotal) / previousTotal * 100).toFixed(0);
      const changeAbs = Math.abs(change);

      if (changeAbs > 10) {
        insights.push({
          icon: change > 0 ? '📈' : '📉',
          title: `Spending ${change > 0 ? 'increased' : 'decreased'}`,
          description: `You spent ${changeAbs}% ${change > 0 ? 'more' : 'less'} compared to last ${this.currentPeriod}.`
        });
      }
    }

    // Insight 3: Most frequent category
    const categoryCount = {};
    transactions.forEach(t => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });

    const mostFrequent = Object.keys(categoryCount).reduce((a, b) =>
      categoryCount[a] > categoryCount[b] ? a : b
    );

    insights.push({
      icon: '📊',
      title: `Most frequent: ${mostFrequent}`,
      description: `You made ${categoryCount[mostFrequent]} transaction${categoryCount[mostFrequent] > 1 ? 's' : ''} in ${mostFrequent}.`
    });

    // Insight 4: Average transaction size
    const avgTransaction = currentTotal / transactions.length;
    insights.push({
      icon: '💵',
      title: 'Average transaction',
      description: `Your average expense is ${this.formatCurrency(avgTransaction)} this ${this.currentPeriod}.`
    });

    return insights;
  }

  /**
   * Get previous period date range
   */
  getPreviousPeriod(currentStart) {
    let start, end;

    switch (this.currentPeriod) {
      case 'week':
        start = new Date(currentStart);
        start.setDate(start.getDate() - 7);
        end = new Date(start);
        end.setDate(end.getDate() + 6);
        break;

      case 'month':
        start = new Date(currentStart);
        start.setMonth(start.getMonth() - 1);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        break;

      case 'year':
        start = new Date(currentStart);
        start.setFullYear(start.getFullYear() - 1);
        end = new Date(start.getFullYear(), 11, 31);
        break;
    }

    return { start, end };
  }

  /**
   * Handle period change
   */
  async handlePeriodChange(event) {
    const button = event.currentTarget;
    const period = button.dataset.period;

    if (period === this.currentPeriod) return;

    this.currentPeriod = period;

    // Update active state
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');

    // Re-render
    this.showLoading();
    await this.render();
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
   * Handle add expense
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
   * Handle navigation
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
   * Set active navigation
   */
  setActiveNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.dataset.page === 'analytics.html') {
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

  /**
   * Destroy chart instances (cleanup)
   */
  destroyCharts() {
    Object.values(this.chartInstances).forEach(chart => {
      if (chart && chart.destroy) {
        chart.destroy();
      }
    });
    this.chartInstances = {};
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const controller = new AnalyticsViewController();
  controller.init();

  // Make controller globally accessible
  window.analyticsController = controller;
});

// Cleanup charts on page unload
window.addEventListener('beforeunload', () => {
  if (window.analyticsController) {
    window.analyticsController.destroyCharts();
  }
});
