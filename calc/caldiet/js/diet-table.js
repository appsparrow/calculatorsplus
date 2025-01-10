// Diet table functionality
async function loadDietOptions() {
    try {
        const response = await fetch('data/diet-options.json');
        const dietOptions = await response.json();
        return dietOptions;
    } catch (error) {
        console.error('Error loading diet options:', error);
        return [];
    }
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

// Event Listeners for macro cards
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('proteinCard').addEventListener('click', () => showDietOptionsForMacro('protein'));
    document.getElementById('carbCard').addEventListener('click', () => showDietOptionsForMacro('carbs'));
    document.getElementById('fiberCard').addEventListener('click', () => showDietOptionsForMacro('fiber'));
});