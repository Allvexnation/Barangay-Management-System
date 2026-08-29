import { getAllHouseholds } from '../../api/admin/dashboard/household.js';
import { getAllPuroks } from '../../api/admin/dashboard/purok.js';
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

export async function exportHouseholdsToExcel(preparedById, approvedById) {
    try {
        const households = await getAllHouseholds();
        const puroks = await getAllPuroks();
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

        const COLS = 6;
        const lastColIndex = COLS - 1;

        const worksheetData = [
            [barangayName],
            [cityProvince],
            ['Household Directory'],
            [''],
            ['No.', 'Household Head', 'Purok', 'House No.', 'Contact Number', 'Date Registered'],
        ];

        const HEADER_ROW = 4;

        const rows = households.map((household, index) => {
            const purok = puroks.find(p => p.purokId === household.purokId);
            const purokName = purok ? purok.purokName : '—';
            const dateAdded = new Date(household.createdAt);

            return [
                index + 1,
                household.fullName || '—',
                purokName,
                household.houseNo || '—',
                household.contact || '—',
                dateAdded,
            ];
        });

        worksheetData.push(...rows);

        const lastDataRow = HEADER_ROW + rows.length;

        const generatedRow = lastDataRow + 2;
        const totalRow = generatedRow + 1;
        const certRow = totalRow + 2;

        worksheetData.push([]);
        worksheetData.push(['Generated on:', '', generatedDate]);
        worksheetData.push(['Total Households:', '', households.length]);
        worksheetData.push([]);
        worksheetData.push(['Certified true and correct:']);
        worksheetData.push([]);
        worksheetData.push([]);
        worksheetData.push(['Prepared by:', '', '', 'Approved by:']);
        worksheetData.push(['_____________________________', '', '', '_____________________________']);
        worksheetData.push([preparedBy.fullName, '', '', approvedBy.fullName]);
        worksheetData.push([preparedBy.position || '', '', '', approvedBy.position || '']);

        const prepByRow = certRow + 3;
        const lineRow = prepByRow + 1;
        const labelRow = lineRow + 1;
        const positionRow = labelRow + 1;

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        worksheet['!cols'] = [
            { wch: 6 },
            { wch: 36 },
            { wch: 20 },
            { wch: 15 },
            { wch: 18 },
            { wch: 20 },
        ];

        worksheet['!rows'] = [
            { hpt: 26 },
            { hpt: 18 },
            { hpt: 22 },
            { hpt: 6 },
            { hpt: 22 },
        ];

        const range = XLSX.utils.decode_range(worksheet['!ref']);

        const setStyle = (r, c, style) => {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (!worksheet[addr]) worksheet[addr] = { t: 's', v: '' };
            worksheet[addr].s = style;
        };

        setStyle(0, 0, {
            font: { bold: true, sz: 18, color: { rgb: COLORS.white }, name: 'Calibri' },
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.navy } },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        setStyle(1, 0, {
            font: { bold: false, sz: 11, color: { rgb: COLORS.white }, name: 'Calibri' },
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.navy } },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        setStyle(2, 0, {
            font: { bold: true, sz: 13, color: { rgb: COLORS.navyDark }, name: 'Calibri' },
            fill: { patternType: 'solid', fgColor: { rgb: COLORS.lightBlue } },
            alignment: { horizontal: 'center', vertical: 'center' },
        });

        for (let col = 0; col <= lastColIndex; col++) {
            setStyle(HEADER_ROW, col, {
                font: { bold: true, sz: 10.5, color: { rgb: COLORS.white }, name: 'Calibri' },
                fill: { patternType: 'solid', fgColor: { rgb: COLORS.navy } },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: thinBorder(COLORS.navyDark),
            });
        }

        for (let row = HEADER_ROW + 1; row <= lastDataRow; row++) {
            const isEven = (row - HEADER_ROW) % 2 === 0;
            const bg = isEven ? COLORS.rowAlt : COLORS.rowBase;

            for (let col = 0; col <= lastColIndex; col++) {
                const addr = XLSX.utils.encode_cell({ r: row, c: col });
                if (!worksheet[addr]) continue;

                const isNumberCol = col === 0;
                const isDateCol = col === 5;

                worksheet[addr].s = {
                    font: { sz: 10, color: { rgb: COLORS.textDark } },
                    fill: { patternType: 'solid', fgColor: { rgb: bg } },
                    border: thinBorder(),
                    alignment: {
                        horizontal: isNumberCol ? 'center' : isDateCol ? 'center' : 'left',
                        vertical: 'center',
                    },
                };

                if (isDateCol) {
                    worksheet[addr].z = 'mm/dd/yyyy';
                }
            }
        }

        [generatedRow, totalRow].forEach(row => {
            setStyle(row, 0, { font: { bold: true, sz: 10, color: { rgb: COLORS.textDark } } });
            setStyle(row, 2, { font: { sz: 10, color: { rgb: COLORS.textDark } } });
        });

        setStyle(certRow, 0, { font: { italic: true, sz: 9, color: { rgb: COLORS.textDark } } });

        [0, 3].forEach(col => {
            setStyle(prepByRow, col, { 
                font: { bold: true, sz: 10, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
            setStyle(lineRow, col, { 
                font: { sz: 10, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
            setStyle(labelRow, col, { 
                font: { sz: 9, italic: true, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
            setStyle(positionRow, col, { 
                font: { sz: 9, color: { rgb: COLORS.textDark } },
                alignment: { horizontal: 'center' }
            });
        });

        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: lastColIndex } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: lastColIndex } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: lastColIndex } },
            { s: { r: generatedRow, c: 0 }, e: { r: generatedRow, c: 1 } },
            { s: { r: totalRow, c: 0 }, e: { r: totalRow, c: 1 } },
            { s: { r: prepByRow, c: 0 }, e: { r: prepByRow, c: 1 } },
            { s: { r: prepByRow, c: 3 }, e: { r: prepByRow, c: 4 } },
            { s: { r: lineRow, c: 0 }, e: { r: lineRow, c: 1 } },
            { s: { r: lineRow, c: 3 }, e: { r: lineRow, c: 4 } },
            { s: { r: labelRow, c: 0 }, e: { r: labelRow, c: 1 } },
            { s: { r: labelRow, c: 3 }, e: { r: labelRow, c: 4 } },
            { s: { r: positionRow, c: 0 }, e: { r: positionRow, c: 1 } },
            { s: { r: positionRow, c: 3 }, e: { r: positionRow, c: 4 } },
        ];

        worksheet['!freeze'] = { xSplit: 0, ySplit: HEADER_ROW + 1 };
        worksheet['!autofilter'] = {
            ref: XLSX.utils.encode_range({ s: { r: HEADER_ROW, c: 0 }, e: { r: lastDataRow, c: lastColIndex } }),
        };

        worksheet['!printHeader'] = true;
        worksheet['!pageSetup'] = { orientation: 'landscape', fitToWidth: 1, fitToHeight: 0 };

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Households');

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `households_export_${timestamp}.xlsx`;

        XLSX.writeFile(workbook, filename);

        return true;
    } catch (error) {
        console.error('Error exporting households:', error);
        throw error;
    }
}