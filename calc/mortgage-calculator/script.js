// Utility function to format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Function to validate inputs
function validateInputs(values) {
    const { homePrice, downPayment, interestRate, loanTerm } = values;
    
    if (homePrice <= 0) {
        alert('Home price must be greater than 0');
        return false;
    }
    if (downPayment < 0 || downPayment >= homePrice) {
        alert('Down payment must be between 0 and home price');
        return false;
    }
    if (interestRate <= 0 || interestRate >= 30) {
        alert('Interest rate must be between 0 and 30');
        return false;
    }
    if (loanTerm <= 0 || loanTerm > 50) {
        alert('Loan term must be between 1 and 50 years');
        return false;
    }
    return true;
}

// Main calculation function
function calculateMortgage() {
    // Get input values
    const values = {
        homePrice: parseFloat(document.getElementById('homePrice').value) || 0,
        downPayment: parseFloat(document.getElementById('downPayment').value) || 0,
        interestRate: parseFloat(document.getElementById('interestRate').value) || 0,
        loanTerm: parseFloat(document.getElementById('loanTerm').value) || 0,
        propertyTax: parseFloat(document.getElementById('propertyTax').value) || 0,
        insurance: parseFloat(document.getElementById('insurance').value) || 0
    };

    // Validate inputs
    if (!validateInputs(values)) {
        return;
    }

    try {
        // Calculate loan amount
        const loanAmount = values.homePrice - values.downPayment;
        
        // Calculate monthly interest rate
        const monthlyRate = (values.interestRate / 100) / 12;
        
        // Calculate number of payments
        const numberOfPayments = values.loanTerm * 12;

        // Calculate monthly P&I payment using the mortgage payment formula
        const monthlyPI = loanAmount * 
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        // Calculate monthly tax and insurance
        const monthlyTax = values.propertyTax / 12;
        const monthlyInsurance = values.insurance / 12;

        // Calculate total monthly payment (PITI)
        const monthlyPITI = monthlyPI + monthlyTax + monthlyInsurance;

        // Calculate total interest
        const totalInterest = (monthlyPI * numberOfPayments) - loanAmount;

        // Calculate total cost
        const totalCost = (monthlyPITI * numberOfPayments) + values.downPayment;

        // Update results
        document.getElementById('monthlyPI').textContent = formatCurrency(monthlyPI);
        document.getElementById('monthlyPITI').textContent = formatCurrency(monthlyPITI);
        document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
        document.getElementById('totalCost').textContent = formatCurrency(totalCost);

        // Create payment breakdown chart
        createChart(loanAmount, totalInterest, values.propertyTax, values.insurance, values.loanTerm);
    } catch (error) {
        console.error('Calculation error:', error);
        alert('An error occurred during calculation. Please check your inputs.');
    }
}

// Function to create the payment breakdown chart
function createChart(principal, totalInterest, annualTax, annualInsurance, term) {
    const taxInsurance = (annualTax + annualInsurance) * term;
    
    const data = [{
        values: [principal, totalInterest, taxInsurance],
        labels: ['Principal', 'Interest', 'Tax & Insurance'],
        type: 'pie',
        hole: 0.4,
        marker: {
            colors: ['#2196F3', '#FF9800', '#4CAF50']
        }
    }];

    const layout = {
        title: 'Total Payment Breakdown',
        height: 400,
        showlegend: true
    };

    Plotly.newPlot('paymentChart', data, layout);
}

// Add event listeners to all inputs
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculateMortgage);
    });

    // Initial calculation
    calculateMortgage();
});