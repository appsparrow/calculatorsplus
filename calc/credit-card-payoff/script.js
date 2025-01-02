class CreditCardCalculator {
    constructor() {
        this.initializeEventListeners();
        this.initializeChart();
        this.lastValidInputs = null;
    }

    initializeEventListeners() {
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculate());
        
        // Main inputs validation
        ['balance', 'apr', 'payment'].forEach(id => {
            const input = document.getElementById(id);
            input.addEventListener('input', () => this.validateInput(input));
        });

        // Scenario inputs
        document.getElementById('extraMonthlyInput').addEventListener('input', (e) => {
            if (this.lastValidInputs) {
                this.recalculateScenario('extra', parseFloat(e.target.value));
            }
        });

        document.getElementById('lumpSumInput').addEventListener('input', (e) => {
            if (this.lastValidInputs) {
                this.recalculateScenario('lump', parseFloat(e.target.value));
            }
        });
    }

    validateInput(input) {
        const value = parseFloat(input.value);
        if (isNaN(value) || value < 0) {
            input.classList.add('error');
            return false;
        }
        input.classList.remove('error');
        return true;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatMonths(totalMonths) {
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;
        if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
        if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
        return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    }

    calculateAmortization(balance, annualRate, monthlyPayment) {
        const monthlyRate = annualRate / 100 / 12;
        let currentBalance = balance;
        let month = 0;
        let totalInterest = 0;
        const schedule = [];

        // Validate minimum payment
        const minPayment = (balance * monthlyRate) + 1;
        if (monthlyPayment < minPayment) {
            throw new Error(`Monthly payment must be at least ${this.formatCurrency(minPayment)} to make progress on the debt.`);
        }

        while (currentBalance > 0 && month < 360) {
            const monthlyInterest = currentBalance * monthlyRate;
            const principalPayment = Math.min(monthlyPayment - monthlyInterest, currentBalance);
            
            totalInterest += monthlyInterest;
            currentBalance -= principalPayment;
            
            schedule.push({
                month: month + 1,
                balance: Math.max(0, currentBalance),
                interest: monthlyInterest,
                principal: principalPayment
            });
            
            month++;

            if (monthlyPayment <= monthlyInterest) {
                throw new Error("Payment too small to cover monthly interest.");
            }
        }

        return {
            months: month,
            totalInterest: totalInterest,
            totalPaid: balance + totalInterest,
            schedule: schedule
        };
    }

    calculate() {
        try {
            const balance = parseFloat(document.getElementById('balance').value);
            const apr = parseFloat(document.getElementById('apr').value);
            const payment = parseFloat(document.getElementById('payment').value);

            if (!this.validateInputs(balance, apr, payment)) return;

            this.lastValidInputs = { balance, apr, payment };

            const baseResult = this.calculateAmortization(balance, apr, payment);
            this.updateResults(baseResult);
            this.updateChart(baseResult.schedule);
            this.calculateScenarios(balance, apr, payment, baseResult);

        } catch (error) {
            alert(error.message);
        }
    }

    validateInputs(balance, apr, payment) {
        if (isNaN(balance) || balance <= 0) {
            alert('Please enter a valid balance amount.');
            return false;
        }
        if (isNaN(apr) || apr < 0) {
            alert('Please enter a valid APR.');
            return false;
        }
        if (isNaN(payment) || payment <= 0) {
            alert('Please enter a valid monthly payment.');
            return false;
        }
        return true;
    }
    updateResults(result) {
        document.getElementById('timeToPayoff').textContent = this.formatMonths(result.months);
        document.getElementById('totalInterest').textContent = this.formatCurrency(result.totalInterest);
        document.getElementById('totalAmount').textContent = this.formatCurrency(result.totalPaid);

        const payoffDate = new Date();
        payoffDate.setMonth(payoffDate.getMonth() + result.months);
        document.getElementById('payoffDate').textContent = 
            payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    recalculateScenario(type, value) {
        if (!this.lastValidInputs || isNaN(value)) return;

        const { balance, apr, payment } = this.lastValidInputs;
        const baseResult = this.calculateAmortization(balance, apr, payment);

        try {
            if (type === 'extra') {
                const extraPaymentResult = this.calculateAmortization(balance, apr, payment + value);
                this.updateScenarioCard('extraPayment', baseResult, extraPaymentResult);
            } else if (type === 'lump') {
                const reducedBalance = Math.max(0, balance - value);
                const lumpSumResult = reducedBalance > 0 ? 
                    this.calculateAmortization(reducedBalance, apr, payment) :
                    { months: 0, totalInterest: 0, totalPaid: reducedBalance };
                this.updateScenarioCard('lumpSum', baseResult, lumpSumResult);
            }
        } catch (error) {
            if (type === 'extra') {
                this.clearScenarioCard('extraPayment');
            } else if (type === 'lump') {
                this.clearScenarioCard('lumpSum');
            }
        }
    }

    calculateScenarios(balance, apr, payment, baseResult) {
        // Extra monthly payment
        try {
            const extraAmount = parseFloat(document.getElementById('extraMonthlyInput').value) || 0;
            const extraPaymentResult = this.calculateAmortization(balance, apr, payment + extraAmount);
            this.updateScenarioCard('extraPayment', baseResult, extraPaymentResult);
        } catch (error) {
            this.clearScenarioCard('extraPayment');
        }

        // One-time lump sum payment
        try {
            const lumpSum = parseFloat(document.getElementById('lumpSumInput').value) || 0;
            const reducedBalance = Math.max(0, balance - lumpSum);
            const lumpSumResult = reducedBalance > 0 ? 
                this.calculateAmortization(reducedBalance, apr, payment) :
                { months: 0, totalInterest: 0, totalPaid: reducedBalance };
            this.updateScenarioCard('lumpSum', baseResult, lumpSumResult);
        } catch (error) {
            this.clearScenarioCard('lumpSum');
        }

        // 10% higher payments
        try {
            const increasedResult = this.calculateAmortization(balance, apr, payment * 1.1);
            this.updateScenarioCard('increasePayment', baseResult, increasedResult);
        } catch (error) {
            this.clearScenarioCard('increasePayment');
        }

        // Two-year payoff
        try {
            const twoYearPayment = this.calculatePaymentForTerm(balance, apr, 24);
            const twoYearResult = this.calculateAmortization(balance, apr, twoYearPayment);
            this.updateTwoYearScenario(twoYearPayment, twoYearResult);
        } catch (error) {
            this.clearTwoYearScenario();
        }

        // Balance transfer
        try {
            const transferPayment = Math.ceil(balance / 18);
            const transferResult = this.calculateAmortization(balance, 0, transferPayment);
            this.updateTransferScenario(transferPayment, baseResult, transferResult);
        } catch (error) {
            this.clearTransferScenario();
        }
    }

    calculatePaymentForTerm(balance, apr, months) {
        const monthlyRate = apr / 100 / 12;
        if (monthlyRate === 0) return balance / months;
        return balance * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
               (Math.pow(1 + monthlyRate, months) - 1);
    }

    updateScenarioCard(scenarioId, baseResult, newResult) {
        const element = document.getElementById(scenarioId);
        if (!element) return; // Exit if element doesn't exist

        const timeSpan = element.querySelector('.time');
        const savingsSpan = element.querySelector('.savings');
        const monthsSpan = element.querySelector('.months');

        if (!timeSpan || !savingsSpan || !monthsSpan) return; // Exit if spans don't exist

        const monthsSaved = baseResult.months - newResult.months;
        const interestSaved = baseResult.totalInterest - newResult.totalInterest;

        timeSpan.textContent = this.formatMonths(newResult.months);
        savingsSpan.textContent = this.formatCurrency(interestSaved);
        monthsSpan.textContent = `${monthsSaved} month${monthsSaved !== 1 ? 's' : ''}`;
    }

    updateTwoYearScenario(payment, result) {
        const element = document.getElementById('twoYearPayoff');
        if (!element) return;

        const paymentSpan = element.querySelector('.payment');
        const interestSpan = element.querySelector('.interest');

        if (!paymentSpan || !interestSpan) return;

        paymentSpan.textContent = this.formatCurrency(payment);
        interestSpan.textContent = this.formatCurrency(result.totalInterest);
    }

    updateTransferScenario(payment, baseResult, transferResult) {
        const element = document.getElementById('balanceTransfer');
        if (!element) return;

        const paymentSpan = element.querySelector('.payment');
        const savingsSpan = element.querySelector('.savings');

        if (!paymentSpan || !savingsSpan) return;

        paymentSpan.textContent = this.formatCurrency(payment);
        savingsSpan.textContent = 
            this.formatCurrency(baseResult.totalInterest - transferResult.totalInterest);
    }

    clearScenarioCard(scenarioId) {
        const element = document.getElementById(scenarioId);
        if (!element) return;

        const timeSpan = element.querySelector('.time');
        const savingsSpan = element.querySelector('.savings');
        const monthsSpan = element.querySelector('.months');

        if (timeSpan) timeSpan.textContent = '-';
        if (savingsSpan) savingsSpan.textContent = '-';
        if (monthsSpan) monthsSpan.textContent = '-';
    }

    clearTwoYearScenario() {
        const element = document.getElementById('twoYearPayoff');
        if (!element) return;

        const paymentSpan = element.querySelector('.payment');
        const interestSpan = element.querySelector('.interest');

        if (paymentSpan) paymentSpan.textContent = '-';
        if (interestSpan) interestSpan.textContent = '-';
    }

    clearTransferScenario() {
        const element = document.getElementById('balanceTransfer');
        if (!element) return;

        const paymentSpan = element.querySelector('.payment');
        const savingsSpan = element.querySelector('.savings');

        if (paymentSpan) paymentSpan.textContent = '-';
        if (savingsSpan) savingsSpan.textContent = '-';
    }
    
    initializeChart() {
        const trace = {
            x: [0],
            y: [0],
            mode: 'lines',
            name: 'Balance',
            line: { color: '#2196F3' }
        };

        const layout = {
            title: 'Balance Over Time',
            xaxis: { title: 'Months' },
            yaxis: { 
                title: 'Balance ($)',
                tickformat: '$,.0f'
            },
            showlegend: false
        };

        Plotly.newPlot('payoffChart', [trace], layout);
    }

    updateChart(schedule) {
        const trace = {
            x: schedule.map(entry => entry.month),
            y: schedule.map(entry => entry.balance),
            mode: 'lines',
            name: 'Balance',
            line: { color: '#2196F3' }
        };

        const layout = {
            title: 'Balance Over Time',
            xaxis: { title: 'Months' },
            yaxis: { 
                title: 'Balance ($)',
                tickformat: '$,.0f'
            },
            showlegend: false
        };

        Plotly.newPlot('payoffChart', [trace], layout);
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CreditCardCalculator();
});