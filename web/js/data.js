/**
 * ExpenseData - Data Layer for Expense Tracker
 * Handles data fetching, processing, caching, and state management
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    DATA_URL: '/data/expenses.json',
    CACHE_KEY: 'expense_tracker_data',
    CACHE_TIMESTAMP_KEY: 'expense_tracker_timestamp',
    REFRESH_INTERVAL: 60000, // 60 seconds
    CACHE_DURATION: 300000, // 5 minutes
  };

  // Global state
  const state = {
    transactions: [],
    categories: [],
    paymentMethods: [],
    lastUpdated: null,
    isLoading: false,
    error: null,
    listeners: [],
  };

  // Auto-refresh timer
  let refreshTimer = null;

  /**
   * Initialize the data layer
   * @returns {Promise<void>}
   */
  async function init() {
    console.log('[ExpenseData] Initializing...');

    try {
      // Try to load from cache first
      const cached = loadFromCache();
      if (cached) {
        console.log('[ExpenseData] Loaded from cache:', {
          transactions: cached.transactions.length,
          age: Date.now() - cached.timestamp
        });
        updateState(cached.data);
      }

      // Fetch fresh data
      await refresh();

      // Start auto-refresh
      startAutoRefresh();

      console.log('[ExpenseData] Initialization complete');
    } catch (error) {
      console.error('[ExpenseData] Initialization failed:', error);
      state.error = error.message;
      notifyListeners();
      throw error;
    }
  }

  /**
   * Fetch and refresh data from server
   * @returns {Promise<void>}
   */
  async function refresh() {
    console.log('[ExpenseData] Refreshing data...');
    state.isLoading = true;
    state.error = null;
    notifyListeners();

    try {
      const response = await fetch(CONFIG.DATA_URL, {
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validate data structure
      validateData(data);

      // Update state
      updateState(data);

      // Cache the data
      saveToCache(data);

      console.log('[ExpenseData] Data refreshed successfully:', {
        transactions: state.transactions.length,
        categories: state.categories.length,
        paymentMethods: state.paymentMethods.length,
      });

      state.isLoading = false;
      notifyListeners();
    } catch (error) {
      console.error('[ExpenseData] Refresh failed:', error);
      state.isLoading = false;
      state.error = error.message;
      notifyListeners();
      throw error;
    }
  }

  /**
   * Validate data structure
   * @param {Object} data - Data to validate
   * @throws {Error} If data is invalid
   */
  function validateData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format: expected object');
    }

    if (!Array.isArray(data.transactions)) {
      throw new Error('Invalid data format: transactions must be array');
    }

    if (!Array.isArray(data.categories)) {
      throw new Error('Invalid data format: categories must be array');
    }

    if (!Array.isArray(data.paymentMethods)) {
      throw new Error('Invalid data format: paymentMethods must be array');
    }

    // Validate each transaction
    data.transactions.forEach((txn, index) => {
      if (!txn.id) {
        throw new Error(`Transaction ${index}: missing id`);
      }
      if (typeof txn.amount !== 'number') {
        throw new Error(`Transaction ${txn.id}: amount must be number`);
      }
      if (!txn.date) {
        throw new Error(`Transaction ${txn.id}: missing date`);
      }
    });
  }

  /**
   * Update global state
   * @param {Object} data - New data
   */
  function updateState(data) {
    state.transactions = data.transactions || [];
    state.categories = data.categories || [];
    state.paymentMethods = data.paymentMethods || [];
    state.lastUpdated = new Date();
    state.error = null;
  }

  /**
   * Load data from localStorage cache
   * @returns {Object|null} Cached data or null
   */
  function loadFromCache() {
    try {
      const cached = localStorage.getItem(CONFIG.CACHE_KEY);
      const timestamp = localStorage.getItem(CONFIG.CACHE_TIMESTAMP_KEY);

      if (!cached || !timestamp) {
        return null;
      }

      const age = Date.now() - parseInt(timestamp, 10);
      if (age > CONFIG.CACHE_DURATION) {
        console.log('[ExpenseData] Cache expired');
        return null;
      }

      return {
        data: JSON.parse(cached),
        timestamp: parseInt(timestamp, 10),
      };
    } catch (error) {
      console.warn('[ExpenseData] Failed to load cache:', error);
      return null;
    }
  }

  /**
   * Save data to localStorage cache
   * @param {Object} data - Data to cache
   */
  function saveToCache(data) {
    try {
      localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CONFIG.CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('[ExpenseData] Failed to save cache:', error);
    }
  }

  /**
   * Start auto-refresh timer
   */
  function startAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }

    refreshTimer = setInterval(() => {
      console.log('[ExpenseData] Auto-refresh triggered');
      refresh().catch(error => {
        console.error('[ExpenseData] Auto-refresh failed:', error);
      });
    }, CONFIG.REFRESH_INTERVAL);

    console.log(`[ExpenseData] Auto-refresh enabled (every ${CONFIG.REFRESH_INTERVAL / 1000}s)`);
  }

  /**
   * Stop auto-refresh timer
   */
  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
      console.log('[ExpenseData] Auto-refresh disabled');
    }
  }

  /**
   * Register a listener for data updates
   * @param {Function} callback - Callback function
   */
  function addListener(callback) {
    if (typeof callback === 'function') {
      state.listeners.push(callback);
    }
  }

  /**
   * Remove a listener
   * @param {Function} callback - Callback function
   */
  function removeListener(callback) {
    const index = state.listeners.indexOf(callback);
    if (index > -1) {
      state.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of state change
   */
  function notifyListeners() {
    state.listeners.forEach(callback => {
      try {
        callback({
          transactions: state.transactions,
          categories: state.categories,
          paymentMethods: state.paymentMethods,
          lastUpdated: state.lastUpdated,
          isLoading: state.isLoading,
          error: state.error,
        });
      } catch (error) {
        console.error('[ExpenseData] Listener error:', error);
      }
    });
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Format amount as currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: USD)
   * @returns {string} Formatted currency string
   */
  function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format date as readable string
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date string
   */
  function formatDate(date) {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  }

  /**
   * Get start and end of week for a given date
   * @param {Date} date - Reference date
   * @returns {Object} {start, end}
   */
  function getWeekRange(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday as start of week

    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Get start and end of month for a given date
   * @param {Date} date - Reference date
   * @returns {Object} {start, end}
   */
  function getMonthRange(date = new Date()) {
    const d = new Date(date);

    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Calculate percentage
   * @param {number} part - Part value
   * @param {number} total - Total value
   * @returns {number} Percentage (0-100)
   */
  function calculatePercentage(part, total) {
    if (total === 0) return 0;
    return (part / total) * 100;
  }

  /**
   * Filter transactions by date range
   * @param {Array} transactions - Transactions to filter
   * @param {Date} start - Start date
   * @param {Date} end - End date
   * @returns {Array} Filtered transactions
   */
  function filterByDateRange(transactions, start, end) {
    return transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= start && txnDate <= end;
    });
  }

  /**
   * Group transactions by category
   * @param {Array} transactions - Transactions to group
   * @returns {Object} Grouped transactions {category: {transactions: [], total: number}}
   */
  function groupByCategory(transactions) {
    const grouped = {};

    transactions.forEach(txn => {
      const category = txn.category || 'Uncategorized';

      if (!grouped[category]) {
        grouped[category] = {
          transactions: [],
          total: 0,
          count: 0,
        };
      }

      grouped[category].transactions.push(txn);
      grouped[category].total += txn.amount;
      grouped[category].count++;
    });

    return grouped;
  }

  /**
   * Group transactions by payment method
   * @param {Array} transactions - Transactions to group
   * @returns {Object} Grouped transactions {method: {transactions: [], total: number}}
   */
  function groupByPaymentMethod(transactions) {
    const grouped = {};

    transactions.forEach(txn => {
      const method = txn.paymentMethod || 'Unknown';

      if (!grouped[method]) {
        grouped[method] = {
          transactions: [],
          total: 0,
          count: 0,
        };
      }

      grouped[method].transactions.push(txn);
      grouped[method].total += txn.amount;
      grouped[method].count++;
    });

    return grouped;
  }

  /**
   * Sort transactions by date (newest first)
   * @param {Array} transactions - Transactions to sort
   * @returns {Array} Sorted transactions
   */
  function sortByDate(transactions) {
    return [...transactions].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }

  // ============================================================================
  // DATA GETTERS
  // ============================================================================

  /**
   * Get all transactions
   * @returns {Array} All transactions
   */
  function getTransactions() {
    return sortByDate(state.transactions);
  }

  /**
   * Get current week summary
   * @returns {Object} Week summary
   */
  function getWeekSummary() {
    const { start, end } = getWeekRange();
    const weekTransactions = filterByDateRange(state.transactions, start, end);
    const total = weekTransactions.reduce((sum, txn) => sum + txn.amount, 0);

    return {
      period: 'This Week',
      start,
      end,
      total,
      count: weekTransactions.length,
      transactions: sortByDate(weekTransactions),
      average: weekTransactions.length > 0 ? total / weekTransactions.length : 0,
    };
  }

  /**
   * Get current month summary
   * @returns {Object} Month summary
   */
  function getMonthSummary() {
    const { start, end } = getMonthRange();
    const monthTransactions = filterByDateRange(state.transactions, start, end);
    const total = monthTransactions.reduce((sum, txn) => sum + txn.amount, 0);

    return {
      period: 'This Month',
      start,
      end,
      total,
      count: monthTransactions.length,
      transactions: sortByDate(monthTransactions),
      average: monthTransactions.length > 0 ? total / monthTransactions.length : 0,
    };
  }

  /**
   * Get all-time summary
   * @returns {Object} All-time summary
   */
  function getAllTimeSummary() {
    const total = state.transactions.reduce((sum, txn) => sum + txn.amount, 0);

    return {
      period: 'All Time',
      total,
      count: state.transactions.length,
      transactions: sortByDate(state.transactions),
      average: state.transactions.length > 0 ? total / state.transactions.length : 0,
    };
  }

  /**
   * Get category breakdown
   * @param {string} period - 'week', 'month', or 'all'
   * @returns {Array} Category breakdown with percentages
   */
  function getCategoryBreakdown(period = 'all') {
    let transactions;

    switch (period) {
      case 'week':
        transactions = getWeekSummary().transactions;
        break;
      case 'month':
        transactions = getMonthSummary().transactions;
        break;
      default:
        transactions = state.transactions;
    }

    const grouped = groupByCategory(transactions);
    const total = Object.values(grouped).reduce((sum, g) => sum + g.total, 0);

    const breakdown = Object.entries(grouped).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: calculatePercentage(data.total, total),
      transactions: sortByDate(data.transactions),
    }));

    // Sort by total descending
    return breakdown.sort((a, b) => b.total - a.total);
  }

  /**
   * Get payment method breakdown
   * @param {string} period - 'week', 'month', or 'all'
   * @returns {Array} Payment method breakdown with percentages
   */
  function getPaymentMethodBreakdown(period = 'all') {
    let transactions;

    switch (period) {
      case 'week':
        transactions = getWeekSummary().transactions;
        break;
      case 'month':
        transactions = getMonthSummary().transactions;
        break;
      default:
        transactions = state.transactions;
    }

    const grouped = groupByPaymentMethod(transactions);
    const total = Object.values(grouped).reduce((sum, g) => sum + g.total, 0);

    const breakdown = Object.entries(grouped).map(([method, data]) => ({
      method,
      total: data.total,
      count: data.count,
      percentage: calculatePercentage(data.total, total),
      transactions: sortByDate(data.transactions),
    }));

    // Sort by total descending
    return breakdown.sort((a, b) => b.total - a.total);
  }

  /**
   * Get current week total
   * @param {Array} transactions - Optional transactions array
   * @returns {number} Total for current week
   */
  function getCurrentWeekTotal(transactions = null) {
    if (!transactions) {
      return getWeekSummary().total;
    }

    const { start, end } = getWeekRange();
    const weekTransactions = filterByDateRange(transactions, start, end);
    return weekTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  }

  /**
   * Get current month total
   * @param {Array} transactions - Optional transactions array
   * @returns {number} Total for current month
   */
  function getCurrentMonthTotal(transactions = null) {
    if (!transactions) {
      return getMonthSummary().total;
    }

    const { start, end } = getMonthRange();
    const monthTransactions = filterByDateRange(transactions, start, end);
    return monthTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  }

  /**
   * Search transactions
   * @param {string} query - Search query
   * @returns {Array} Matching transactions
   */
  function searchTransactions(query) {
    if (!query || query.trim() === '') {
      return getTransactions();
    }

    const q = query.toLowerCase().trim();

    return getTransactions().filter(txn => {
      return (
        txn.description?.toLowerCase().includes(q) ||
        txn.category?.toLowerCase().includes(q) ||
        txn.paymentMethod?.toLowerCase().includes(q) ||
        txn.amount.toString().includes(q)
      );
    });
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  window.ExpenseData = {
    // Initialization
    init,
    refresh,

    // Data getters
    getTransactions,
    getWeekSummary,
    getMonthSummary,
    getAllTimeSummary,
    getCategoryBreakdown,
    getPaymentMethodBreakdown,
    getCurrentWeekTotal,
    getCurrentMonthTotal,
    searchTransactions,

    // Utility functions
    formatCurrency,
    formatDate,
    getWeekRange,
    getMonthRange,
    calculatePercentage,
    groupByCategory,
    groupByPaymentMethod,
    filterByDateRange,
    sortByDate,

    // State management
    addListener,
    removeListener,
    getState: () => ({
      transactions: state.transactions,
      categories: state.categories,
      paymentMethods: state.paymentMethods,
      lastUpdated: state.lastUpdated,
      isLoading: state.isLoading,
      error: state.error,
    }),

    // Control
    startAutoRefresh,
    stopAutoRefresh,
  };

  console.log('[ExpenseData] Module loaded');

})();
