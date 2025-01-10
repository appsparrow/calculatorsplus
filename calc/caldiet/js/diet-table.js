// diet-table.js
document.addEventListener('DOMContentLoaded', function() {
    // Load diet options from JSON
    loadDietOptions().then(initializeDietTable);
});

async function loadDietOptions() {
    try {
        const response = await fetch('data/diet-options.json');
        const data = await response.json();
        return data.foods;
    } catch (error) {
        console.error('Error loading diet options:', error);
        return [];
    }
}

function initializeDietTable() {
    // Add event listeners to buttons
    document.getElementById('proteinBtn').addEventListener('click', () => showDietOptionsForMacro('protein'));
    document.getElementById('carbBtn').addEventListener('click', () => showDietOptionsForMacro('carbs'));
    document.getElementById('fiberBtn').addEventListener('click', () => showDietOptionsForMacro('fiber'));
}

async function showDietOptionsForMacro(clickedMacro) {
    const dietOptions = await loadDietOptions();
    const dietPlanBody = document.getElementById('dietPlanBody');
    dietPlanBody.innerHTML = '';

    let sortedOptions = [...dietOptions];
    if (clickedMacro === 'protein') {
        sortedOptions.sort((a, b) => b.protein - a.protein);
    } else if (clickedMacro === 'carbs') {
        sortedOptions.sort((a, b) => b.carbs - a.carbs);
    } else if (clickedMacro === 'fiber') {
        sortedOptions.sort((a, b) => b.fiber - a.fiber);
    }

    sortedOptions.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.protein}</td>
            <td>${item.carbs}</td>
            <td>${item.fiber}</td>
        `;
        dietPlanBody.appendChild(row);
    });
}