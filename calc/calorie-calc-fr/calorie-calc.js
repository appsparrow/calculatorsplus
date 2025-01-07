// Declare macro chart variable globally
let macroChart = null;

// Add click event listener for calculate button
document.getElementById('calculateBtn').addEventListener('click', calculateCalories);

// Initialize macro chart when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const macroCtx = document.getElementById('macroChart').getContext('2d');
    if (macroCtx) {
        macroChart = new Chart(macroCtx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbohydrates', 'Fiber'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#4f46e5',  // Protein color
                        '#0ea5e9',  // Carbohydrates color
                        '#06b6d4'   // Fiber color
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.label}: ${context.raw}g`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
});

// Function to update the macronutrient chart
function updateMacroChart(protein, carbs, fiber) {
    if (!macroChart) {
        console.error('Macro chart not initialized');
        return;
    }
    macroChart.data.datasets[0].data = [protein, carbs, fiber];
    macroChart.update();
}

// Main calculation function
function calculateCalories() {
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const heightFeet = parseInt(document.getElementById('heightFeet').value);
    const heightInches = parseInt(document.getElementById('heightInches').value);
    const weight = parseInt(document.getElementById('weight').value);
    const activity = document.getElementById('activity').value;

    const height = heightFeet * 12 + heightInches;

    // Calculate BMR
    let bmr;
    if (gender === 'male') {
        bmr = (10 * (weight / 2.205)) + (6.25 * (height * 2.54)) - (5 * age) + 5;
    } else {
        bmr = (10 * (weight / 2.205)) + (6.25 * (height * 2.54)) - (5 * age) - 161;
    }

    // Activity multipliers
    const activityMultiplier = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        'very-active': 1.9
    };
    const tdee = bmr * activityMultiplier[activity];

    // Calculate different calorie targets
    const maintain = Math.round(tdee);
    const mildLoss = Math.round(tdee * 0.9);
    const loss = Math.round(tdee * 0.8);
    const extremeLoss = Math.round(tdee * 0.61);

    // Update calorie results
    document.getElementById('maintainCalories').textContent = `${maintain} Calories/day`;
    document.getElementById('mildLossCalories').textContent = `${mildLoss} Calories/day`;
    document.getElementById('lossCalories').textContent = `${loss} Calories/day`;
    document.getElementById('extremeLossCalories').textContent = `${extremeLoss} Calories/day`;

    // Calculate and update macronutrients
    const protein = Math.round(maintain * 0.3 / 4);
    const carbs = Math.round(maintain * 0.5 / 4);
    const fiber = Math.round(weight * 0.14);

    // Update macronutrient display
    document.getElementById('proteinIntake').textContent = `${protein}g/day`;
    document.getElementById('carbIntake').textContent = `${carbs}g/day`;
    document.getElementById('fiberIntake').textContent = `${fiber}g/day`;

    // Update macro chart
    updateMacroChart(protein, carbs, fiber);

}


// Feature Request Form functionality
document.addEventListener('DOMContentLoaded', function() {
    const featureIcon = document.querySelector('.feature-request-icon');
    const sidebar = document.querySelector('.feature-request-sidebar');
    const closeBtn = document.querySelector('.close-sidebar');
    const featureForm = document.getElementById('featureForm');

    // Toggle sidebar
    featureIcon.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Handle form submission
    featureForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            email: document.getElementById('email').value,
            calculator: document.getElementById('calculator').value,
            description: document.getElementById('description').value,
            timestamp: new Date().toISOString()
        };

        // Convert form data to string
        const dataString = JSON.stringify(formData, null, 2);

        // Create a Blob and download it as a text file
        const blob = new Blob([dataString], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feature-request-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Reset form and close sidebar
        featureForm.reset();
        document.getElementById('calculator').value = 'Calorie Calculator';
        sidebar.classList.remove('active');
        alert('Feature request submitted successfully!');
    });
});