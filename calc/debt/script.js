// Utility functions
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function formatPercent(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
}

// Debt management class
class DebtManager {
    constructor() {
        this.debts = [];
        this.extraPayment = 0;
        this.strategy = 'avalanche';
    }

    addDebt(name, balance, rate, payment) {
        this.debts.push({ name, balance, rate, payment });
    }

    sortDebts() {
        this.debts.sort((a, b) => {
            if (this.strategy === 'avalanche') {
                return b.rate - a.rate;
            }
            return a.balance - b.balance;
        });
    }

    calculatePayoff(extraPayment = 0) {
        let months = 0;
        let totalInterest = 0;
        const payoffData = {
            months: [],
            balances: [],
            principalPaid: 0,
            interestPaid: 0
        };

        const remainingDebts = this.debts.map(debt => ({ ...debt }));
        let initialBalance = remainingDebts.reduce((sum, debt) => sum + debt.balance, 0);
        
        payoffData.months.push(0);
        payoffData.balances.push(initialBalance);

        while (remainingDebts.some(debt => debt.balance > 0) && months < 1200) {
            months++;
            let monthlyExtra = extraPayment;
            let monthlyPrincipal = 0;
            let monthlyInterest = 0;

            remainingDebts.forEach(debt => {
                if (debt.balance <= 0) return;

                // Calculate interest
                const interest = (debt.rate / 100 / 12) * debt.balance;
                monthlyInterest += interest;
                totalInterest += interest;
                debt.balance += interest;

                // Calculate payment
                const payment = Math.min(debt.balance, debt.payment + monthlyExtra);
                monthlyPrincipal += payment - interest;
                debt.balance -= payment;
                monthlyExtra = Math.max(0, monthlyExtra - (payment - debt.payment));
            });

            payoffData.principalPaid += monthlyPrincipal;
            payoffData.interestPaid += monthlyInterest;
            
            const currentBalance = remainingDebts.reduce((sum, debt) => 
                sum + Math.max(0, debt.balance), 0);
            
            payoffData.months.push(months);
            payoffData.balances.push(currentBalance);
        }

        return {
            months,
            totalInterest,
            payoffData
        };
    }

    calculateConsolidation(totalBalance, newRate, term) {
        const monthlyRate = newRate / 100 / 12;
        const numPayments = term * 12;
        
        const payment = totalBalance * 
            (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
            (Math.pow(1 + monthlyRate, numPayments) - 1);
        
        const totalCost = payment * numPayments;
        const totalInterest = totalCost - totalBalance;

        return {
            payment,
            totalInterest
        };
    }
}

// UI Controller
class UIController {
    constructor() {
        this.debtManager = new DebtManager();
        this.setupEventListeners();
        this.initializePlotly();
    }

    setupEventListeners() {
        // Add Debt Button
        document.getElementById('addDebtBtn').addEventListener('click', () => this.addDebtField());

        // Calculate Button
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateAll());

        // Strategy Selection
        document.getElementById('strategy').addEventListener('change', (e) => {
            this.debtManager.strategy = e.target.value;
        });

        // Remove Debt Button Delegation
        document.getElementById('debtList').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-debt')) {
                e.target.closest('.debt-item').remove();
            }
        });
    }

    addDebtField() {
        const debtList = document.getElementById('debtList');
        const debtItem = document.createElement('div');
        debtItem.className = 'debt-item';
        debtItem.innerHTML = `
            <input type="text" class="debt-name" placeholder="e.g., Credit Card 1">
            <input type="number" class="debt-balance" placeholder="0" min="0">
            <input type="number" class="debt-rate" placeholder="0" min="0" max="100" step="0.1">
            <input type="number" class="debt-payment" placeholder="0" min="0">
            <button class="remove-debt">×</button>
        `;
        debtList.appendChild(debtItem);
    }

    // Continue with Part 2...
    
    collectDebtData() {
    const debts = [];
    document.querySelectorAll('.debt-item').forEach(item => {
        const name = item.querySelector('.debt-name').value || 'Unnamed Debt';
        const balance = parseFloat(item.querySelector('.debt-balance').value) || 0;
        const rate = parseFloat(item.querySelector('.debt-rate').value) || 0;
        const payment = parseFloat(item.querySelector('.debt-payment').value) || 0;

        if (balance > 0 && payment > 0) {
            debts.push({ name, balance, rate, payment });
        }
    });
    return debts;
}

validateInputs(debts) {
    if (debts.length === 0) {
        alert('Please add at least one debt with valid values.');
        return false;
    }

    for (const debt of debts) {
        const minPayment = (debt.balance * (debt.rate/100/12)) + 1;
        if (debt.payment < minPayment) {
            alert(`Minimum payment for ${debt.name} must be at least ${formatCurrency(minPayment)} to cover interest and some principal.`);
            return false;
        }
    }

    return true;
}

calculateAll() {
    const debts = this.collectDebtData();
    if (!this.validateInputs(debts)) return;

    this.debtManager.debts = debts;
    this.debtManager.extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;
    this.debtManager.sortDebts();

    const results = this.debtManager.calculatePayoff(this.debtManager.extraPayment);
    
    this.updateResults(results);
    this.updateCharts(results.payoffData);
    this.calculateScenarios();
}

updateResults(results) {
    const totalDebt = this.debtManager.debts.reduce((sum, debt) => sum + debt.balance, 0);
    
    document.getElementById('totalDebt').textContent = formatCurrency(totalDebt);
    document.getElementById('totalInterest').textContent = formatCurrency(results.totalInterest);
    document.getElementById('monthsToFree').textContent = results.months;

    const debtFreeDate = new Date();
    debtFreeDate.setMonth(debtFreeDate.getMonth() + results.months);
    document.getElementById('debtFreeDate').textContent = 
        debtFreeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

updateCharts(payoffData) {
    // Payoff Timeline Chart
    const trace1 = {
        x: payoffData.months,
        y: payoffData.balances,
        mode: 'lines',
        name: 'Remaining Balance',
        line: { color: '#2196F3' }
    };

    const layout1 = {
        title: 'Debt Payoff Timeline',
        xaxis: { title: 'Months' },
        yaxis: { title: 'Balance ($)' }
    };

    Plotly.newPlot('payoffChart', [trace1], layout1);

    // Payment Breakdown Chart
    const trace2 = {
        values: [payoffData.principalPaid, payoffData.interestPaid],
        labels: ['Principal', 'Interest'],
        type: 'pie',
        hole: 0.4,
        marker: {
            colors: ['#4CAF50', '#FF9800']
        }
    };

    const layout2 = {
        title: 'Payment Breakdown',
        height: 400,
        showlegend: true
    };

    Plotly.newPlot('paymentBreakdownChart', [trace2], layout2);
}

calculateScenarios() {
    // Compare strategies
    const currentStrategy = this.debtManager.strategy;
    this.debtManager.strategy = currentStrategy === 'avalanche' ? 'snowball' : 'avalanche';
    this.debtManager.sortDebts();
    const alternativeResults = this.debtManager.calculatePayoff(this.debtManager.extraPayment);
    this.debtManager.strategy = currentStrategy;
    this.debtManager.sortDebts();

    const currentResults = this.debtManager.calculatePayoff(this.debtManager.extraPayment);
    
    // Update strategy comparison
    document.getElementById('timeDiff').textContent = 
        `${Math.abs(currentResults.months - alternativeResults.months)} months`;
    document.getElementById('interestDiff').textContent = 
        formatCurrency(Math.abs(currentResults.totalInterest - alternativeResults.totalInterest));

    // Calculate extra payment impact
    const doubleExtraResults = this.debtManager.calculatePayoff(this.debtManager.extraPayment * 2);
    document.getElementById('timeSaved').textContent = 
        `${currentResults.months - doubleExtraResults.months} months`;
    document.getElementById('interestSaved').textContent = 
        formatCurrency(currentResults.totalInterest - doubleExtraResults.totalInterest);

    // Calculate consolidation scenario
    const totalBalance = this.debtManager.debts.reduce((sum, debt) => sum + debt.balance, 0);
    const avgRate = this.debtManager.debts.reduce((sum, debt) => sum + debt.rate, 0) / 
        this.debtManager.debts.length;
    const consolidation = this.debtManager.calculateConsolidation(totalBalance, avgRate - 2, 5);
    
    document.getElementById('consolidatedPayment').textContent = formatCurrency(consolidation.payment);
    document.getElementById('potentialSavings').textContent = 
        formatCurrency(currentResults.totalInterest - consolidation.totalInterest);

    // Update payment breakdown
    const totalPayment = this.debtManager.debts.reduce((sum, debt) => sum + debt.payment, 0) + 
        this.debtManager.extraPayment;
    const firstMonthInterest = this.debtManager.debts.reduce((sum, debt) => 
        sum + (debt.rate / 100 / 12) * debt.balance, 0);
    
    document.getElementById('principalPercent').textContent = 
        formatPercent(((totalPayment - firstMonthInterest) / totalPayment * 100));
    document.getElementById('interestPercent').textContent = 
        formatPercent((firstMonthInterest / totalPayment * 100));
}

initializePlotly() {
    // Create empty charts initially
    Plotly.newPlot('payoffChart', [{
        x: [0],
        y: [0],
        mode: 'lines'
    }], {
        title: 'Debt Payoff Timeline',
        xaxis: { title: 'Months' },
        yaxis: { title: 'Balance ($)' }
    });

    Plotly.newPlot('paymentBreakdownChart', [{
        values: [1],
        labels: ['No Data'],
        type: 'pie',
        hole: 0.4
    }], {
        title: 'Payment Breakdown',
        height: 400
    });
}
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
new UIController();
});