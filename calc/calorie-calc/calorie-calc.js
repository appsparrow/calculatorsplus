// Declare macro chart variable globally
let macroChart = null;

// Add click event listener for calculate button
document.getElementById('calculateBtn').addEventListener('click', calculateCalories);

// Initialize macro chart when DOM is loaded
// Add event listener for weight unit changes to update min/max values
document.getElementById('weightUnit').addEventListener('change', function() {
    const weightInput = document.getElementById('weight');
    if (this.value === 'kg') {
        weightInput.min = "20";
        weightInput.max = "227"; // ~500 lbs in kg
        weightInput.value = Math.round(parseFloat(weightInput.value) / 2.205);
    } else {
        weightInput.min = "44"; // ~20 kg in lbs
        weightInput.max = "500";
        weightInput.value = Math.round(parseFloat(weightInput.value) * 2.205);
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
    const weightInput = parseFloat(document.getElementById('weight').value);
    const weightUnit = document.getElementById('weightUnit').value;
    const activity = document.getElementById('activity').value;

    const height = heightFeet * 12 + heightInches;
    
    // Convert weight to kg if needed
    const weightInKg = weightUnit === 'lbs' ? weightInput / 2.205 : weightInput;

    // Calculate BMR
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weightInKg) + (6.25 * (height * 2.54)) - (5 * age) + 5;
    } else {
        bmr = (10 * weightInKg) + (6.25 * (height * 2.54)) - (5 * age) - 161;
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
    const fiber = Math.round((weightUnit === 'lbs' ? weightInput : weightInput * 2.205) * 0.14);

    // Update macronutrient display
    document.getElementById('proteinIntake').textContent = `${protein}g/day`;
    document.getElementById('carbIntake').textContent = `${carbs}g/day`;
    document.getElementById('fiberIntake').textContent = `${fiber}g/day`;

    // Update macro chart
    updateMacroChart(protein, carbs, fiber);
}








