function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

async function printIndividualClearance(clearance, selectedOfficial = null, systemInfo = null, officials = []) {
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
            <title>Individual Clearance</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; }
                .header p { margin: 5px 0; }
                .header h2 { margin: 10px 0; }
                .header h3 { margin: 10px 0; }
                .content { text-align: justify; margin: 20px 0; }
                .signature { text-align: right; margin-top: 40px; }
                .signature-wrapper { display: inline-block; text-align: center; width: 200px; }
                .signature-line { border-bottom: 2px solid black; margin-bottom: 5px; }
                .signature-position { text-align: center; }
                .details { margin-top: 30px; }
                .details dt { font-weight: bold; display: inline; }
                .details dd { display: inline; margin-left: 10px; border-bottom: 1px solid black; }
            </style>
        </head>
        <body>
            <div class="header">
                <p>Republic of the Philippines</p>
                <p>${city}</p>
                <h2>Barangay ${barangayName}</h2>
                <h3>Individual Barangay Clearance</h3>
            </div>
            <div class="content">
                <p class="ml-8">
                    This is to certify that <b><u>${clearance.fullName}, ${clearance.age}</u></b> years old, and a resident of ${fullLocation} is known to be of good moral character and law-abiding citizen in the community.
                </p>
                <p class="ml-8">To certify further, that he/she has no derogatory and/or criminal records filed in this barangay.</p>
                <p class="ml-8">ISSUED this <b><u>${new Date(clearance.createdAt).getDate()}${getOrdinalSuffix(new Date(clearance.createdAt).getDate())}</u></b> day of <b><u>${new Date(clearance.createdAt).toLocaleString('default', { month: 'long' })} ${new Date(clearance.createdAt).getFullYear()}</u></b> at ${fullLocation} upon request of the interested party for whatever legal purposes it may serve.</p>
            </div>
            <div class="signature">
                <div class="signature-wrapper">
                    <div class="signature-line">${signatoryName}</div>
                    <div class="signature-position">${signatoryPosition}</div>
                </div>
            </div>
            <div class="details">
                <dl>
                    <dt>OR #:</dt>
                    <dd>${clearance.orNo}</dd>
                </dl>
                <dl>
                    <dt>Date Issued:</dt>
                    <dd>${new Date(clearance.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</dd>
                </dl>
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

export { printIndividualClearance, getOrdinalSuffix };
