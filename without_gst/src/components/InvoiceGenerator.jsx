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
    const halfWidth = (pageWidth - margin * 3) / 2;
    const tableStartY = 65;

    const copyLabels = [
      "Original Buyer's Copy",
      "Original Seller's Copy"
    ];

    for (let copyIndex = 0; copyIndex < 2; copyIndex++) {
      const xOffset = margin + copyIndex * (halfWidth + margin);

      // Add Copy Labels
      doc.setFontSize(10);
      doc.setFont('cambria');
      doc.text(copyLabels[copyIndex], xOffset + halfWidth - 5, 10, { align: 'right' });

      // Add Title
      doc.setFontSize(20);
      doc.text('ANMOL ENTERPRISE', xOffset + halfWidth / 2, 24, { align: 'center' });
      doc.setFontSize(10);
      doc.text('INVOICE', xOffset + halfWidth / 2, 17, { align: 'center' });
      doc.setFontSize(11);
      doc.text('78/1 Christopher Road, Kolkata : 700046', xOffset + halfWidth / 2, 29, { align: 'center' });

      // Supplier Info
      doc.setFontSize(8);
      doc.text(`MOBILE: 8583043989(ANIKET)`, xOffset + margin, 34);
      doc.text(`MOBILE: 9331271486(ALOK)`, xOffset + margin + 95, 34);

      // Invoice Details
      doc.line(xOffset + margin, 38, xOffset + halfWidth, 38);
      doc.text(`Invoice No: ${data.invoiceNo}`, xOffset + margin, 42);
      doc.text(`Invoice Date: ${formatDateToDDMMYYYY(data.invoiceDate)}`, xOffset + margin + 70, 42);

      // Receiver Details
      doc.line(xOffset + margin, 44, xOffset + halfWidth, 44);
      doc.setFontSize(9);
      doc.text('DETAILS OF RECEIVER [BILLED TO PARTY]', xOffset + halfWidth / 2, 48, { align: 'center' });
      doc.line(xOffset + margin, 50, xOffset + halfWidth, 50);
      doc.setFontSize(8);
      doc.text(`NAME: ${data.receiverName.toUpperCase()}`, xOffset + margin, 54);
      doc.text(`ADDRESS: ${data.receiverAddress.toUpperCase()}`, xOffset + margin, 58);
      doc.text(`MOBILE NUMBER: ${data.receiverMobileNumber}`, xOffset + margin, 62);

      // Table
      const tableColumn = ['S.NO', 'DESCRIPTION', 'QNTY', 'RATE', 'AMOUNT (Rs)'];
      let tableRows = data.items.map((item, index) => {
        const amount = (item.quantity * item.rate).toFixed(2);
        return [
          index + 1,
          item.description,
          item.quantity,
          item.rate,
          amount
        ];
      });

      while (tableRows.length < 20) {
        tableRows.push(['', '', '', '', '']);
      }

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 1,
          halign: 'center',
          lineColor: [0, 0, 0],
          minCellHeight: 4
        },
        headStyles: {
          fillColor: copyIndex === 0 ? [0, 176, 252] : [255, 193, 7],
          textColor: 255,
          halign: "center"
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 75 },
          2: { cellWidth: 15 },
          3: { cellWidth: 15 },
          4: { cellWidth: 20 }
        },
        margin: { left: xOffset + margin },
        tableWidth: halfWidth - margin,
      });

      // Calculate total
      let totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toFixed(2);

      const finalY = doc.lastAutoTable.finalY;
      
      doc.setFontSize(12);
      doc.text(`TOTAL AMOUNT: Rs. ${totalAmount}`, xOffset + halfWidth - 10, finalY + 6, { align: 'right' });
      
      doc.setFontSize(8);
      doc.text('AUTHORISED SIGNATORY', xOffset + halfWidth - 5, pageHeight - margin, { align: 'right' });
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