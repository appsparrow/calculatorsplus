// Utility function to load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component from ${componentPath}:`, error);
    }
}

// Load all components when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header-component', '/components/header.html');
    loadComponent('footer-component', '/components/footer.html');
    loadComponent('feature-req-component', '/components/feature-req.html');
});