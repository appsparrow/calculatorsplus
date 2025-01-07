  // Feature Request Form functionality
  document.addEventListener('DOMContentLoaded', function () {
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

        try {
            // Send data to PHP script
            const response = await fetch('/save-feature-request.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Reset form and close sidebar
                featureForm.reset();
                document.getElementById('calculator').value = 'Calorie Calculator';
                sidebar.classList.remove('active');
                alert('Feature request submitted successfully!');
            } else {
                throw new Error(result.message || 'Failed to submit feature request');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit feature request. Please try again later.');
        }
    });
});