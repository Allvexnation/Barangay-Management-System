function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

async function printBusinessClearance(clearance, selectedOfficial = null, systemInfo = null, officials = []) {
    const official = selectedOfficial || officials.find(o => o.position === 'Punong Barangay') || officials[0];
    const signatoryName = official ? official.fullName : 'Punong Barangay';
    const signatoryPosition = official ? official.position : 'Punong Barangay';

    const barangayName = systemInfo?.barangayName || 'Pio del Pilar';
    const city = systemInfo?.city || 'Makati';
    const province = systemInfo?.province || 'Metro Manila';

    const fullLocation = `Barangay ${barangayName}, ${city}, ${province}`;

    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Business Clearance</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; }
                .header p { margin: 5px 0; }
                .header h2 { margin: 10px 0; }
                .header h3 { margin: 10px 0; }
                .details { margin: 20px 0; }
                .details dt { font-weight: bold; display: inline-block; width: 150px; }
                .details dd { display: inline-block; border-bottom: 1px solid black; width: 300px; }
                .content { text-align: justify; margin: 20px 0; }
                .signature { text-align: right; margin-top: 40px; }
                .signature-wrapper { display: inline-block; text-align: center; width: 200px; }
                .signature-line { border-bottom: 2px solid black; margin-bottom: 5px; }
                .signature-position { text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <p>Republic of the Philippines</p>
                <p>${city}</p>
                <h2>Barangay ${barangayName}</h2>
                <h3>Barangay Business Clearance</h3>
            </div>
            <div class="details">
                <dl>
                    <dt>Owner Name:</dt>
                    <dd>${clearance.ownerName}</dd>
                </dl>
                <dl>
                    <dt>Business Name:</dt>
                    <dd>${clearance.businessName}</dd>
                </dl>
                <dl>
                    <dt>Kind of Business:</dt>
                    <dd>${clearance.businessType}</dd>
                </dl>
                <dl>
                    <dt>TIN:</dt>
                    <dd>${clearance.tin}</dd>
                </dl>
                <dl>
                    <dt>OR #:</dt>
                    <dd>${clearance.orNo}</dd>
                </dl>
                <dl>
                    <dt>Date Issued:</dt>
                    <dd>${new Date(clearance.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</dd>
                </dl>
                <dl>
                    <dt>Issued at:</dt>
                    <dd>${fullLocation}</dd>
                </dl>
            </div>
            <div class="content">
                <p class="ml-8">
                    This CERTIFICATION is issued upon the request of the above-named person in connection with his/her application for <b>Business Permit</b>.
                </p>
                <p class="ml-8">ISSUED this <b><u>${new Date(clearance.createdAt).getDate()}${getOrdinalSuffix(new Date(clearance.createdAt).getDate())}</u></b> day of <b><u>${new Date(clearance.createdAt).toLocaleString('default', { month: 'long' })} ${new Date(clearance.createdAt).getFullYear()}</u></b> at ${fullLocation}.</p>
            </div>
            <div class="signature">
                <div class="signature-wrapper">
                    <div class="signature-line">${signatoryName}</div>
                    <div class="signature-position">${signatoryPosition}</div>
                </div>
            </div>
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
}

export { printBusinessClearance, getOrdinalSuffix };
