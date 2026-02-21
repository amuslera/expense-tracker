/**
 * Spentzy Expense Tracker - Charts Module
 * Beautiful data visualizations using Chart.js
 */

(function() {
    'use strict';

    // Color palette for categories
    const CATEGORY_COLORS = {
        'Bills & Utilities': '#4F7CFF',
        'Food & Dining': '#10B981',
        'Transportation': '#F59E0B',
        'Shopping': '#EC4899',
        'Entertainment': '#8B5CF6',
        'Health': '#EF4444',
        'Other': '#6B7280'
    };

    // Payment method colors
    const PAYMENT_COLORS = {
        'Card': '#4F7CFF',
        'Cash': '#6B7280'
    };

    // Chart instances storage
    let chartInstances = {
        weeklyTrend: null,
        categoryBreakdown: null,
        paymentMethod: null,
        monthlyTrend: null
    };

    // Default Chart.js configuration
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    Chart.defaults.color = '#64748B';
    Chart.defaults.borderColor = '#E2E8F0';

    /**
     * Format currency for tooltips and labels
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Initialize Weekly Spending Trend Line Chart
     */
    function initWeeklyTrend(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (chartInstances.weeklyTrend) {
            chartInstances.weeklyTrend.destroy();
        }

        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const amounts = data || [0, 0, 0, 0, 0, 0, 0];

        chartInstances.weeklyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Spending',
                    data: amounts,
                    borderColor: '#4F7CFF',
                    backgroundColor: function(context) {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(79, 124, 255, 0.2)');
                        gradient.addColorStop(1, 'rgba(79, 124, 255, 0)');
                        return gradient;
                    },
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#4F7CFF',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: '#4F7CFF',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        borderColor: '#4F7CFF',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return 'Spent: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#F1F5F9',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            },
                            color: '#64748B',
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#64748B',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        return chartInstances.weeklyTrend;
    }

    /**
     * Initialize Category Breakdown Donut Chart
     */
    function initCategoryBreakdown(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (chartInstances.categoryBreakdown) {
            chartInstances.categoryBreakdown.destroy();
        }

        const categories = data?.categories || [];
        const amounts = data?.amounts || [];
        const colors = categories.map(cat => CATEGORY_COLORS[cat] || CATEGORY_COLORS['Other']);

        const total = amounts.reduce((sum, val) => sum + val, 0);

        chartInstances.categoryBreakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderColor: '#fff',
                    borderWidth: 3,
                    hoverOffset: 10,
                    hoverBorderColor: '#fff',
                    hoverBorderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 12
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        return {
                                            text: `${label} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return [
                                    `Amount: ${formatCurrency(value)}`,
                                    `Percentage: ${percentage}%`
                                ];
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1200,
                    easing: 'easeInOutQuart'
                }
            },
            plugins: [{
                id: 'centerText',
                beforeDraw: function(chart) {
                    const width = chart.width;
                    const height = chart.height;
                    const ctx = chart.ctx;
                    ctx.restore();

                    const fontSize = (height / 200).toFixed(2);
                    ctx.font = `bold ${fontSize}em Inter, sans-serif`;
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#0F172A';

                    const totalText = formatCurrency(total);
                    const textX = Math.round((width - ctx.measureText(totalText).width) / 2);
                    const textY = height / 2 - 10;

                    ctx.fillText(totalText, textX, textY);

                    // Subtitle
                    ctx.font = `${fontSize * 0.5}em Inter, sans-serif`;
                    ctx.fillStyle = '#64748B';
                    const subtitleText = 'Total Spent';
                    const subtitleX = Math.round((width - ctx.measureText(subtitleText).width) / 2);
                    ctx.fillText(subtitleText, subtitleX, textY + 25);

                    ctx.save();
                }
            }]
        });

        return chartInstances.categoryBreakdown;
    }

    /**
     * Initialize Payment Method Horizontal Bar Chart
     */
    function initPaymentMethod(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (chartInstances.paymentMethod) {
            chartInstances.paymentMethod.destroy();
        }

        const cardAmount = data?.card || 0;
        const cashAmount = data?.cash || 0;
        const total = cardAmount + cashAmount;

        const cardPercentage = total > 0 ? ((cardAmount / total) * 100).toFixed(1) : 0;
        const cashPercentage = total > 0 ? ((cashAmount / total) * 100).toFixed(1) : 0;

        chartInstances.paymentMethod = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Card', 'Cash'],
                datasets: [{
                    label: 'Amount',
                    data: [cardAmount, cashAmount],
                    backgroundColor: [PAYMENT_COLORS.Card, PAYMENT_COLORS.Cash],
                    borderRadius: 8,
                    barThickness: 40,
                    hoverBackgroundColor: ['#3B5FCC', '#4B5563']
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2.5,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.x;
                                const percentage = context.dataIndex === 0 ? cardPercentage : cashPercentage;
                                return [
                                    `Amount: ${formatCurrency(value)}`,
                                    `Percentage: ${percentage}%`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: '#F1F5F9',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            },
                            color: '#64748B',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#0F172A',
                            font: {
                                size: 13,
                                weight: '500'
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        return chartInstances.paymentMethod;
    }

    /**
     * Initialize Monthly Trend Bar Chart
     */
    function initMonthlyTrend(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (chartInstances.monthlyTrend) {
            chartInstances.monthlyTrend.destroy();
        }

        const labels = data?.labels || [];
        const amounts = data?.amounts || [];
        const currentMonthIndex = data?.currentMonthIndex || labels.length - 1;

        // Create background colors array (highlight current month)
        const backgroundColors = amounts.map((_, index) =>
            index === currentMonthIndex ? '#4F7CFF' : '#94A3B8'
        );

        chartInstances.monthlyTrend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly Spending',
                    data: amounts,
                    backgroundColor: backgroundColors,
                    borderRadius: 8,
                    barThickness: 45,
                    hoverBackgroundColor: '#3B5FCC'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        borderColor: '#4F7CFF',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return 'Total: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#F1F5F9',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            },
                            color: '#64748B',
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#64748B',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        return chartInstances.monthlyTrend;
    }

    /**
     * Update all charts with new data
     */
    function updateAll(analyticsData) {
        if (!analyticsData) return;

        // Update weekly trend
        if (analyticsData.weeklyTrend) {
            initWeeklyTrend('weeklyTrendChart', analyticsData.weeklyTrend);
        }

        // Update category breakdown
        if (analyticsData.categoryBreakdown) {
            initCategoryBreakdown('categoryBreakdownChart', analyticsData.categoryBreakdown);
        }

        // Update payment method
        if (analyticsData.paymentMethod) {
            initPaymentMethod('paymentMethodChart', analyticsData.paymentMethod);
        }

        // Update monthly trend
        if (analyticsData.monthlyTrend) {
            initMonthlyTrend('monthlyTrendChart', analyticsData.monthlyTrend);
        }
    }

    /**
     * Destroy all chart instances
     */
    function destroyAll() {
        Object.values(chartInstances).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        chartInstances = {
            weeklyTrend: null,
            categoryBreakdown: null,
            paymentMethod: null,
            monthlyTrend: null
        };
    }

    /**
     * Get chart instance by name
     */
    function getChart(name) {
        return chartInstances[name] || null;
    }

    /**
     * Check if Chart.js is loaded
     */
    function isChartJsLoaded() {
        return typeof Chart !== 'undefined';
    }

    // Export to global scope
    window.ExpenseCharts = {
        initWeeklyTrend: initWeeklyTrend,
        initCategoryBreakdown: initCategoryBreakdown,
        initPaymentMethod: initPaymentMethod,
        initMonthlyTrend: initMonthlyTrend,
        updateAll: updateAll,
        destroyAll: destroyAll,
        getChart: getChart,
        isChartJsLoaded: isChartJsLoaded,
        CATEGORY_COLORS: CATEGORY_COLORS,
        PAYMENT_COLORS: PAYMENT_COLORS
    };

    // Auto-initialize if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('ExpenseCharts module loaded');
        });
    } else {
        console.log('ExpenseCharts module loaded');
    }

})();
