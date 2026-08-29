import { getSystemInfo } from '../../api/admin/dashboard/settings/Systeminfo.js';

async function printClearanceList(currentType) {
    const table = document.getElementById('clearanceTable');
    if (!table) return;

    const title = currentType === 'individual' ? 'Individual Clearance List' : 'Barangay Business Tax Clearance List';
    
    const tableClone = table.cloneNode(true);
    const rows = tableClone.querySelectorAll('tr');
    rows.forEach(row => {
        if (row.lastElementChild) {
            row.removeChild(row.lastElementChild);
        }
    });

    let systemInfo = null;
    try {
        systemInfo = await getSystemInfo();
    } catch (error) {
        console.log('Could not load system info, using defaults');
    }

    const barangayName = systemInfo?.barangayName || 'Pio del Pilar';
    const city = systemInfo?.city || 'Makati';
    const logoUrl = systemInfo?.logoUrl || null;

    const createPrintWindow = (logoSrc) => {
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header-container {
                        display: flex;
                        width: 100%;
                        align-items: center;
                        margin-bottom: 20px;
                    }
                    .col-left {
                        width: 16.66%;
                        padding: 0 12px;
                    }
                    .col-center {
                        width: 66.66%;
                        flex-grow: 1;
                        line-height: 1;
                    }
                    .col-right {
                        width: 16.66%;
                    }
                    .logo-container {
                        text-align: center;
                    }
                    .logo-container img {
                        width: 100px;
                        height: 100px;
                        object-fit: contain;
                    }
                    .header-text p {
                        margin: 0;
                        text-align: center;
                    }
                    .header-text .large {
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .header-text .title {
                        font-weight: bold;
                    }
                    hr {
                        margin: 10px 0;
                    }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <div class="header-container">
                    <div class="col-left">
                        <div class="logo-container">
                            <img src="${logoSrc}" alt="Barangay Logo">
                        </div>
                    </div>
                    <div class="col-center header-text">
                        <p>Republic of the Philippines</p>
                        <p>${city}</p>
                        <div style="clear: both;"></div>
                        <p class="large">Barangay ${barangayName}</p>
                        <p class="title">${title}</p>
                    </div>
                    <div class="col-right">
                    </div>
                </div>
                <hr>
                ${tableClone.outerHTML}
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => {
                printWindow.close();
            }, 200);
        }, 500);
    };

    if (logoUrl) {
        fetch(logoUrl)
            .then(response => {
                if (!response.ok) throw new Error('Logo not found');
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = function() {
                    createPrintWindow(reader.result);
                };
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Failed to load logo from system info:', error);
                createPrintWindow('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIExvZ288L3RleHQ+PC9zdmc+');
            });
    } else {
        const possiblePaths = [
            window.location.origin + '/pio-delpilar-logo.jpg',
            window.location.origin + '/public/pio-delpilar-logo.jpg',
            'pio-delpilar-logo.jpg',
            'public/pio-delpilar-logo.jpg'
        ];
        
        let currentPathIndex = 0;
        
        const tryLoadLogo = () => {
            if (currentPathIndex >= possiblePaths.length) {
                console.error('Failed to load logo from all paths');
                createPrintWindow('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIExvZ288L3RleHQ+PC9zdmc+');
                return;
            }
            
            const logoPath = possiblePaths[currentPathIndex];
            console.log(`Attempting to load logo from (${currentPathIndex + 1}/${possiblePaths.length}):`, logoPath);
            
            fetch(logoPath)
                .then(response => {
                    console.log('Logo response status:', response.status);
                    if (!response.ok) throw new Error('Logo not found');
                    return response.blob();
                })
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        console.log('Logo converted to base64 successfully');
                        createPrintWindow(reader.result);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(error => {
                    console.error(`Failed to load logo from ${logoPath}:`, error);
                    currentPathIndex++;
                    tryLoadLogo();
                });
        };
        
        tryLoadLogo();
    }
}

export { printClearanceList };
