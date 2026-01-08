// Hidden Admin Trigger Logic
document.addEventListener('keydown', (e) => {
    // Check for Shift + L (Login)
    if (e.shiftKey && e.key.toUpperCase() === 'L') {
        window.location.href = 'admin.html';
    }
});

// Optional: Add a hidden point at the very bottom of the footer
document.addEventListener('DOMContentLoaded', () => {
    const footers = document.querySelectorAll('footer');
    footers.forEach(footer => {
        const dot = document.createElement('span');
        dot.innerHTML = '.';
        dot.style.opacity = '0.01'; // Almost invisible
        dot.style.cursor = 'default';
        dot.style.position = 'absolute';
        dot.style.bottom = '10px';
        dot.style.right = '10px';
        dot.onclick = () => window.location.href = 'admin.html';
        footer.style.position = 'relative'; // Ensure relative for absolute positioning
        footer.appendChild(dot);
    });
});
