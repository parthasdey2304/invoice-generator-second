import jsPDF from 'jspdf';
import 'jspdf-autotable';

function formatDateToDDMMYYYY(date) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

const roundOffValue = (value) => {
  const paise = value * 100;
  const fractionalPart = paise % 100;
  return fractionalPart >= 50 ? Math.ceil(value) : Math.floor(value);
};

const Invoice = ({ data }) => {
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      format: 'a4',
      unit: 'mm'
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 5;
    const halfWidth = (pageWidth - margin * 3) / 2; // Adjust for full width
    const tableStartY = 85; // Adjusted to use vertical space efficiently

    const copyLabels = [
      "Original Buyer's Copy",
      "Original Buyer's Copy",
      "Original Seller's Copy",
      "Original Transport's Copy",
    ];

    for (let pageIndex = 0; pageIndex < 2; pageIndex++) {
      if (pageIndex > 0) doc.addPage();

      for (let copyIndex = 0; copyIndex < 2; copyIndex++) {
        const xOffset = margin + copyIndex * (halfWidth + margin);
        const currentIndex = pageIndex * 2 + copyIndex;

        // Add Copy Labels
        doc.setFontSize(10);
        doc.setFont('helvetica');
        doc.text(copyLabels[currentIndex], xOffset + halfWidth - 5, 10, { align: 'right' });

        // Add Title
        doc.setFontSize(14);
        doc.text('ALISHA ENTERPRISE', xOffset + halfWidth / 2, 18, { align: 'center' });
        doc.setFontSize(10);
        doc.text('TAX INVOICE', xOffset + halfWidth / 2, 12, { align: 'center' });
        doc.setFontSize(9);
        doc.text('PROPRIETOR: PUSHPA SHAW', xOffset + halfWidth / 2, 24, { align: 'center' });
        doc.text('25/c RADHANATH CHOWDHURY ROAD KOLKATA -700015', xOffset + halfWidth / 2, 28, { align: 'center' });

        // Supplier Info
        doc.setFontSize(8);
        doc.text(`GST IN: 19AKWPS4940B1ZO`, xOffset + margin, 34);
        doc.text('EMAIL: alokshaw9318@gmail.com', xOffset + margin + 45, 34);
        doc.text(`MOBILE: 9331271486`, xOffset + margin + 95, 34);

        // Invoice Details
        doc.line(xOffset + margin, 38, xOffset + halfWidth, 38);
        doc.text(`Invoice No: ${data.invoiceNo}`, xOffset + margin, 42);
        doc.text(`Invoice Date: ${formatDateToDDMMYYYY(data.invoiceDate)}`, xOffset + margin, 46);
        doc.text('State: WEST BENGAL  Code- 19', xOffset + margin, 50);
        doc.text(`Transport Name: ${data.transportName.toUpperCase()}`, xOffset + margin + 70, 42);
        doc.text(`G.C.N./R.R.NO: ${data.gcn}`, xOffset + margin + 70, 46);
        doc.text(`Place of Supply: ${data.placeOfSupply.toUpperCase()}`, xOffset + margin + 70, 50);

        // Receiver Details
        doc.line(xOffset + margin, 52, xOffset + halfWidth, 52);
        doc.setFontSize(9);
        doc.text('DETAILS OF RECEIVER [BILLED TO PARTY]', xOffset + halfWidth / 2, 56, { align: 'center' });
        doc.line(xOffset + margin, 58, xOffset + halfWidth, 58);
        doc.setFontSize(8);
        doc.text(`NAME: ${data.receiverName.toUpperCase()}`, xOffset + margin, 62);
        doc.text(`ADDRESS: ${data.receiverAddress.toUpperCase()}`, xOffset + margin, 66);
        doc.text(`GST IN: ${data.receiverGST}`, xOffset + margin, 70);
        doc.text(`STATE: ${data.receiverState.toUpperCase()}`, xOffset + margin, 74);
        doc.text(`CODE: ${data.receiverCode}`, xOffset + margin + 40, 74);
        doc.text(`MOBILE NUMBER: ${data.receiverMobileNumber}`, xOffset + margin, 78); // Fixed overlapping

        // Table
        const tableColumn = ['S.NO', 'DESCRIPTION', 'HSN CODE', 'QNTY', 'RATE', 'AMOUNT (Rs)', 'PAISE'];
        let tableRows = data.items.map((item, index) => {
          const amount = (item.quantity * item.rate).toFixed(2).split('.');
          return [
            index + 1,
            item.description,
            item.hsnCode,
            item.quantity,
            item.rate,
            amount[0],
            amount[1]
          ];
        });

        while (tableRows.length < 10) {
          tableRows.push(['', '', '', '', '', '', '']);
        }

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: tableStartY,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 2,
            halign: 'center',
            lineColor: [0, 0, 0]
          },
          headStyles: {
            fillColor: [0, 176, 252],
            textColor: 255,
            halign: "center"
          },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 45 }, // Widened description column
            2: { cellWidth: 20 },
            3: { cellWidth: 15 },
            4: { cellWidth: 15 },
            5: { cellWidth: 18 },
            6: { cellWidth: 12 },
          },
          margin: { left: xOffset + margin },
          tableWidth: halfWidth - margin,
        });

        // Calculate total
        let totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2);

        const finalY = doc.lastAutoTable.finalY;
        doc.text(`BAGS: ${data.numberOfBags}`, xOffset + margin, finalY + 5);
        doc.text(`TOTAL AMOUNT: Rs. ${totalAmount}`, xOffset + halfWidth - 5, finalY + 5, { align: 'right' });

        doc.text('AUTHORISED SIGNATORY', xOffset + halfWidth - 5, pageHeight - margin, { align: 'right' });
      }
    }

    // Save the PDF
    doc.save(`${data.invoiceNo}_${data.receiverName}.pdf`);
  };

  return (
    <div className=''>
      <button onClick={generatePDF} className="px-4 py-2 bg-blue-500 text-white rounded-md fixed bottom-4 right-4">
        Generate PDF
      </button>
    </div>
  );
};

export default Invoice;
