import { getAllIndividualClearances } from '../../api/admin/dashboard/clearance.js';
import { getAllBusinessClearances } from '../../api/admin/dashboard/clearance.js';
import { getOfficialById } from '../../api/admin/dashboard/officials.js';

const COLORS = {
    navy: 'FF1B3358',
    navyDark: 'FF0F1F38',
    lightBlue: 'FFAFDCF5',
    white: 'FFFFFFFF',
    textDark: 'FF1F2933',
    rowAlt: 'FFF3F5F8',
    rowBase: 'FFFFFFFF',
    borderSoft: 'FFD8DEE6',
};

const thinBorder = (color = COLORS.borderSoft) => ({
    top: { style: 'thin', color: { rgb: color } },
    bottom: { style: 'thin', color: { rgb: color } },
    left: { style: 'thin', color: { rgb: color } },
    right: { style: 'thin', color: { rgb: color } },
});

export async function exportClearancesToExcel(preparedById, approvedById) {
    try {
        const individualClearances = await getAllIndividualClearances();
        const businessClearances = await getAllBusinessClearances();
        const preparedBy = await getOfficialById(preparedById);
        const approvedBy = await getOfficialById(approvedById);

        const workbook = XLSX.utils.book_new();

        const barangayName = 'Barangay Pio del Pilar';
        const cityProvince = 'Makati City, Metro Manila';
        const generatedDate = new Date().toLocaleString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const individualCols = 6;
        const individualLastColIndex = individualCols - 1;

        const individualWorksheetData = [
            [barangayName],
            [cityProvince],
            ['Individual Clearance Directory'],
            [''],
            ['No.', 'Applicant Name', 'Purpose / Certificate', 'OR Number', 'Contact Number', 'Date Issued'],
        ];

        const individualHeaderRow = 4;

        const individualRows = individualClearances.map((clearance, index) => {
            const dateIssued = new Date(clearance.createdAt);

            return [
                index + 1,
                clearance.fullName || '—',
                clearance.purpose || '—',
                clearance.orNumber || '—',
                clearance.contact || '—',
                dateIssued,
            ];
        });

        individualWorksheetData.push(...individualRows);

        const individualLastDataRow = individualHeaderRow + individualRows.length;

        const individualGeneratedRow = individualLastDataRow + 2;
        const individualTotalRow = individualGeneratedRow + 1;
        const individualCertRow = individualTotalRow + 2;

        individualWorksheetData.push([]);
        individualWorksheetData.push(['Generated on:', '', generatedDate]);
        individualWorksheetData.push(['Total Clearances:', '', individualClearances.length]);
        individualWorksheetData.push([]);
        individualWorksheetData.push(['Certified true and correct:']);
        individualWorksheetData.push([]);
        individualWorksheetData.push([]);
        individualWorksheetData.push(['Prepared by:', '', '', 'Approved by:']);
        individualWorksheetData.push(['_____________________________', '', '', '_____________________________']);
        individualWorksheetData.push([preparedBy.fullName, '', '', approvedBy.fullName]);
        individualWorksheetData.push([preparedBy.position || '', '', '', approvedBy.position || '']);

        const individualPrepByRow = individualCertRow + 3;
        const individualLineRow = individualPrepByRow + 1;
        const individualLabelRow = individualLineRow + 1;
        const individualPositionRow = individualLabelRow + 1;

        const individualWorksheet = XLSX.utils.aoa_to_sheet(individualWorksheetData);

        individualWorksheet['!cols'] = [
            { wch: 6 },
            { wch: 36 },
            { wch: 30 },
            { wch: 15 },
            { wch: 18 },
            { wch: 20 },
        ];

        individualWorksheet['!rows'] = [
            { hpt: 26 },
            { hpt: 18 },
            { hpt: 22 },
            { hpt: 6 },
            { hpt: 22 },
        ];

        const setIndividualStyle = (r, c, style) => {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (!individualWorksheet[addr]) individualWorksheet[addr] = { t: 's', v: '' };
            individualWorksheet[addr].s = style;
        };

        setIndividualStyle(0, 0, {
            font: { bold: true, sz: 18, color: { rgb: COLORS.white }, name: 'Calibri' },
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.navy } },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        setIndividualStyle(1, 0, {
            font: { bold: false, sz: 11, color: { rgb: COLORS.white }, name: 'Calibri' },
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.navy } },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        setIndividualStyle(2, 0, {
            font: { bold: true, sz: 13, color: { rgb: COLORS.navyDark }, name: 'Calibri' },
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.lightBlue } },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        for (let col = 0; col <= individualLastColIndex; col++) {
            setIndividualStyle(individualHeaderRow, col, {
                font: { bold: true, sz: 10.5, color: { rgb: COLORS.white }, name: 'Calibri' },
                fill: { patternType: 'solid', fgColor: { rgb: COLORS.navy } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: thinBorder(COLORS.navyDark),
            });
        }

        for (let row = individualHeaderRow + 1; row <= individualLastDataRow; row++) {
            const isEven = (row - individualHeaderRow) % 2 === 0;
            const bg = isEven ? COLORS.rowAlt : COLORS.rowBase;

            for (let col = 0; col <= individualLastColIndex; col++) {
                const addr = XLSX.utils.encode_cell({ r: row, c: col });
                if (!individualWorksheet[addr]) continue;

                const isNumberCol = col === 0;
                const isDateCol = col === 5;

                individualWorksheet[addr].s = {
                    font: { sz: 10, color: { rgb: COLORS.textDark } },
                    fill: { patternType: 'solid', fgColor: { rgb: bg } },
                    border: thinBorder(),
                    alignment: {
                        horizontal: isNumberCol ? 'center' : isDateCol ? 'center' : 'left',
                        vertical: 'center',
                    },
                };

                if (isDateCol) {
                    individualWorksheet[addr].z = 'mm/dd/yyyy';
                }
            }
        }

        [individualGeneratedRow, individualTotalRow].forEach(row => {
            setIndividualStyle(row, 0, { font: { bold: true, sz: 10, color: { rgb: COLORS.textDark } } });
            setIndividualStyle(row, 2, { font: { sz: 10, color: { rgb: COLORS.textDark } } });
        });

        setIndividualStyle(individualCertRow, 0, { font: { italic: true, sz: 9, color: { rgb: COLORS.textDark } } });

        [0, 3].forEach(col => {
            setIndividualStyle(individualPrepByRow, col, { 
                font: { bold: true, sz: 10, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
            setIndividualStyle(individualLineRow, col, { 
                font: { sz: 10, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
            setIndividualStyle(individualLabelRow, col, { 
                font: { sz: 9, italic: true, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
            setIndividualStyle(individualPositionRow, col, { 
                font: { sz: 9, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
        });

        individualWorksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: individualLastColIndex } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: individualLastColIndex } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: individualLastColIndex } },
            { s: { r: individualGeneratedRow, c: 0 }, e: { r: individualGeneratedRow, c: 1 } },
            { s: { r: individualTotalRow, c: 0 }, e: { r: individualTotalRow, c: 1 } },
            { s: { r: individualPrepByRow, c: 0 }, e: { r: individualPrepByRow, c: 1 } },
            { s: { r: individualPrepByRow, c: 3 }, e: { r: individualPrepByRow, c: 5 } },
            { s: { r: individualLineRow, c: 0 }, e: { r: individualLineRow, c: 1 } },
            { s: { r: individualLineRow, c: 3 }, e: { r: individualLineRow, c: 5 } },
            { s: { r: individualLabelRow, c: 0 }, e: { r: individualLabelRow, c: 1 } },
            { s: { r: individualLabelRow, c: 3 }, e: { r: individualLabelRow, c: 5 } },
            { s: { r: individualPositionRow, c: 0 }, e: { r: individualPositionRow, c: 1 } },
            { s: { r: individualPositionRow, c: 3 }, e: { r: individualPositionRow, c: 5 } },
        ];

        individualWorksheet['!freeze'] = { xSplit: 0, ySplit: individualHeaderRow + 1 };
        individualWorksheet['!autofilter'] = {
            ref: XLSX.utils.encode_range({ s: { r: individualHeaderRow, c: 0 }, e: { r: individualLastDataRow, c: individualLastColIndex } }),
        };

        individualWorksheet['!printHeader'] = true;
        individualWorksheet['!pageSetup'] = { orientation: 'landscape', fitToWidth: 1, fitToHeight: 0 };

        XLSX.utils.book_append_sheet(workbook, individualWorksheet, 'Individual Clearances');

        const businessCols = 6;
        const businessLastColIndex = businessCols - 1;

        const businessWorksheetData = [
            [barangayName],
            [cityProvince],
            ['Business Clearance Directory'],
            [''],
            ['No.', 'Business Name', 'Owner Name', 'Business Type', 'OR Number', 'Date Issued'],
        ];

        const businessHeaderRow = 4;

        const businessRows = businessClearances.map((clearance, index) => {
            const dateIssued = new Date(clearance.createdAt);

            return [
                index + 1,
                clearance.businessName || '—',
                clearance.ownerName || '—',
                clearance.businessType || '—',
                clearance.orNumber || '—',
                dateIssued,
            ];
        });

        businessWorksheetData.push(...businessRows);

        const businessLastDataRow = businessHeaderRow + businessRows.length;

        const businessGeneratedRow = businessLastDataRow + 2;
        const businessTotalRow = businessGeneratedRow + 1;
        const businessCertRow = businessTotalRow + 2;

        businessWorksheetData.push([]);
        businessWorksheetData.push(['Generated on:', '', generatedDate]);
        businessWorksheetData.push(['Total Clearances:', '', businessClearances.length]);
        businessWorksheetData.push([]);
        businessWorksheetData.push(['Certified true and correct:']);
        businessWorksheetData.push([]);
        businessWorksheetData.push([]);
        businessWorksheetData.push(['Prepared by:', '', '', 'Approved by:']);
        businessWorksheetData.push(['_____________________________', '', '', '_____________________________']);
        businessWorksheetData.push([preparedBy.fullName, '', '', approvedBy.fullName]);
        businessWorksheetData.push([preparedBy.position || '', '', '', approvedBy.position || '']);

        const businessPrepByRow = businessCertRow + 3;
        const businessLineRow = businessPrepByRow + 1;
        const businessLabelRow = businessLineRow + 1;
        const businessPositionRow = businessLabelRow + 1;

        const businessWorksheet = XLSX.utils.aoa_to_sheet(businessWorksheetData);

        businessWorksheet['!cols'] = [
            { wch: 6 },
            { wch: 30 },
            { wch: 30 },
            { wch: 25 },
            { wch: 15 },
            { wch: 20 },
        ];

        businessWorksheet['!rows'] = [
            { hpt: 26 },
            { hpt: 18 },
            { hpt: 22 },
            { hpt: 6 },
            { hpt: 22 },
        ];

        const setBusinessStyle = (r, c, style) => {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (!businessWorksheet[addr]) businessWorksheet[addr] = { t: 's', v: '' };
            businessWorksheet[addr].s = style;
        };

        setBusinessStyle(0, 0, {
            font: { bold: true, sz: 18, color: { rgb: COLORS.white }, name: 'Calibri' },
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.navy } },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        setBusinessStyle(1, 0, {
            font: { bold: false, sz: 11, color: { rgb: COLORS.white }, name: 'Calibri' },
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.navy } },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        setBusinessStyle(2, 0, {
            font: { bold: true, sz: 13, color: { rgb: COLORS.navyDark }, name: 'Calibri' },
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.lightBlue } },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        for (let col = 0; col <= businessLastColIndex; col++) {
            setBusinessStyle(businessHeaderRow, col, {
                font: { bold: true, sz: 10.5, color: { rgb: COLORS.white }, name: 'Calibri' },
                fill: { patternType: 'solid', fgColor: { rgb: COLORS.navy } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: thinBorder(COLORS.navyDark),
            });
        }

        for (let row = businessHeaderRow + 1; row <= businessLastDataRow; row++) {
            const isEven = (row - businessHeaderRow) % 2 === 0;
            const bg = isEven ? COLORS.rowAlt : COLORS.rowBase;

            for (let col = 0; col <= businessLastColIndex; col++) {
                const addr = XLSX.utils.encode_cell({ r: row, c: col });
                if (!businessWorksheet[addr]) continue;

                const isNumberCol = col === 0;
                const isDateCol = col === 5;

                businessWorksheet[addr].s = {
                    font: { sz: 10, color: { rgb: COLORS.textDark } },
                    fill: { patternType: 'solid', fgColor: { rgb: bg } },
                    border: thinBorder(),
                    alignment: {
                        horizontal: isNumberCol ? 'center' : isDateCol ? 'center' : 'left',
                        vertical: 'center',
                    },
                };

                if (isDateCol) {
                    businessWorksheet[addr].z = 'mm/dd/yyyy';
                }
            }
        }

        [businessGeneratedRow, businessTotalRow].forEach(row => {
            setBusinessStyle(row, 0, { font: { bold: true, sz: 10, color: { rgb: COLORS.textDark } } });
            setBusinessStyle(row, 2, { font: { sz: 10, color: { rgb: COLORS.textDark } } });
        });

        setBusinessStyle(businessCertRow, 0, { font: { italic: true, sz: 9, color: { rgb: COLORS.textDark } } });

        [0, 3].forEach(col => {
            setBusinessStyle(businessPrepByRow, col, { 
                font: { bold: true, sz: 10, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
            setBusinessStyle(businessLineRow, col, { 
                font: { sz: 10, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
            setBusinessStyle(businessLabelRow, col, { 
                font: { sz: 9, italic: true, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
            setBusinessStyle(businessPositionRow, col, { 
                font: { sz: 9, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
        });

        businessWorksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: businessLastColIndex } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: businessLastColIndex } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: businessLastColIndex } },
            { s: { r: businessGeneratedRow, c: 0 }, e: { r: businessGeneratedRow, c: 1 } },
            { s: { r: businessTotalRow, c: 0 }, e: { r: businessTotalRow, c: 1 } },
            { s: { r: businessPrepByRow, c: 0 }, e: { r: businessPrepByRow, c: 1 } },
            { s: { r: businessPrepByRow, c: 3 }, e: { r: businessPrepByRow, c: 5 } },
            { s: { r: businessLineRow, c: 0 }, e: { r: businessLineRow, c: 1 } },
            { s: { r: businessLineRow, c: 3 }, e: { r: businessLineRow, c: 5 } },
            { s: { r: businessLabelRow, c: 0 }, e: { r: businessLabelRow, c: 1 } },
            { s: { r: businessLabelRow, c: 3 }, e: { r: businessLabelRow, c: 5 } },
            { s: { r: businessPositionRow, c: 0 }, e: { r: businessPositionRow, c: 1 } },
            { s: { r: businessPositionRow, c: 3 }, e: { r: businessPositionRow, c: 5 } },
        ];

        businessWorksheet['!freeze'] = { xSplit: 0, ySplit: businessHeaderRow + 1 };
        businessWorksheet['!autofilter'] = {
            ref: XLSX.utils.encode_range({ s: { r: businessHeaderRow, c: 0 }, e: { r: businessLastDataRow, c: businessLastColIndex } }),
        };

        businessWorksheet['!printHeader'] = true;
        businessWorksheet['!pageSetup'] = { orientation: 'landscape', fitToWidth: 1, fitToHeight: 0 };

        XLSX.utils.book_append_sheet(workbook, businessWorksheet, 'Business Clearances');

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `clearances_export_${timestamp}.xlsx`;

        XLSX.writeFile(workbook, filename);

        return true;
    } catch (error) {
        console.error('Error exporting clearances:', error);
        throw error;
    }
}
