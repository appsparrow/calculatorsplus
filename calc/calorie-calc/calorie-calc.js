document.getElementById('calculateBtn').addEventListener('click', calculateCalories);

function calculateCalories() {
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const heightFeet = parseInt(document.getElementById('heightFeet').value);
    const heightInches = parseInt(document.getElementById('heightInches').value);
    const weight = parseInt(document.getElementById('weight').value);
    const activity = document.getElementById('activity').value;

    const height = heightFeet * 12 + heightInches; // Convert height to inches

    // Calculate BMR (Basal Metabolic Rate)
    let bmr;
    if (gender === 'male') {
        bmr = 66 + (6.23 * weight) + (12.7 * height) - (6.8 * age);
    } else {
        bmr = 655 + (4.35 * weight) + (4.7 * height) - (4.7 * age);
    }

    // Adjust BMR based on activity level
    const activityMultiplier = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        'very-active': 1.9
    };
    const tdee = bmr * activityMultiplier[activity]; // Total Daily Energy Expenditure

    // Calculate calorie needs
    const maintain = Math.round(tdee);
    const mildLoss = Math.round(tdee * 0.9);
    const loss = Math.round(tdee * 0.8);
    const extremeLoss = Math.round(tdee * 0.61);

    // Update results
    document.getElementById('maintainCalories').textContent = `${maintain} Calories/day`;
    document.getElementById('mildLossCalories').textContent = `${mildLoss} Calories/day`;
    document.getElementById('lossCalories').textContent = `${loss} Calories/day`;
    document.getElementById('extremeLossCalories').textContent = `${extremeLoss} Calories/day`;

    // Macronutrient breakdown
    const protein = Math.round(maintain * 0.3 / 4); // 30% of calories, 4 cal/gram
    const carbs = Math.round(maintain * 0.5 / 4); // 50% of calories, 4 cal/gram
    const fiber = Math.round(weight * 0.14); // 14g per 1000 calories

    document.getElementById('proteinIntake').textContent = `${protein}g/day`;
    document.getElementById('carbIntake').textContent = `${carbs}g/day`;
    document.getElementById('fiberIntake').textContent = `${fiber}g/day`;

    // Update chart
    updateChart([maintain, mildLoss, loss, extremeLoss]);
}

function updateChart(data) {
    const ctx = document.getElementById('calorieChart').getContext('2d');
    if (window.calorieChart) {
        window.calorieChart.destroy();
    }
    window.calorieChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Maintain', 'Mild Loss', 'Loss', 'Extreme Loss'],
            datasets: [{
                label: 'Calories/day',
                data: data,
                backgroundColor: ['#4f46e5', '#818cf8', '#0ea5e9', '#06b6d4']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}