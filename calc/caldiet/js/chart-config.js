// Chart configuration and initialization
let macroChart = null;

function initializeMacroChart() {
    const macroCtx = document.getElementById('macroChart').getContext('2d');
    if (macroCtx) {
        macroChart = new Chart(macroCtx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Carbohydrates', 'Fiber'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#4f46e5', '#0ea5e9', '#06b6d4'],
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
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}g`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
}

function updateMacroChart(protein, carbs, fiber) {
    if (!macroChart) {
        console.error('Macro chart not initialized');
        return;
    }
    macroChart.data.datasets[0].data = [protein, carbs, fiber];
    macroChart.update();
}