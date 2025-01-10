// diet-table.js

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDietTable();
});

function initializeDietTable() {
    // Add click events to macro cards
    const proteinCard = document.getElementById('proteinCard');
    const carbCard = document.getElementById('carbCard');
    const fiberCard = document.getElementById('fiberCard');

    if (proteinCard) {
        proteinCard.addEventListener('click', () => showDietOptionsForMacro('protein'));
    }
    if (carbCard) {
        carbCard.addEventListener('click', () => showDietOptionsForMacro('carbs'));
    }
    if (fiberCard) {
        fiberCard.addEventListener('click', () => showDietOptionsForMacro('fiber'));
    }
}

async function loadDietOptions() {
    try {
        const response = await fetch('data/diet-options.json');
        const data = await response.json();
        // Make sure we're accessing the 'foods' array from the JSON
        return data.foods || [];
    } catch (error) {
        console.error('Error loading diet options:', error);
        // Fallback data in case JSON fetch fails
        return [
            {
                name: "Chicken Breast",
                type: "Non-Vegetarian",
                protein: 31,
                carbs: 0,
                fiber: 0
            },
            // Add more fallback items as needed
        ];
    }
}

async function showDietOptionsForMacro(clickedMacro) {
    try {
        const dietOptions = await loadDietOptions();
        
        // Verify dietOptions is an array
        if (!Array.isArray(dietOptions)) {
            console.error('Diet options is not an array:', dietOptions);
            return;
        }

        const dietPlanBody = document.getElementById('dietPlanBody');
        if (!dietPlanBody) {
            console.error('Diet plan table body not found');
            return;
        }

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
    } catch (error) {
        console.error('Error displaying diet options:', error);
    }
}