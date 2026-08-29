export function animateTabsOnOpen() {
    const tabContents = document.querySelectorAll('#admin-tabs-container a span, #admin-tabs-container button span, #admin-tabs-container a svg, #admin-tabs-container button svg');
    
    tabContents.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = 'opacity 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 30);
    });
}
