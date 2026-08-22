import React, { useState, useMemo } from 'react';
import html2pdf from 'html2pdf.js';
import './App.css';

/**
 * StatementData - All statement data in one place.
 * When integrating into a larger project (e.g. dashboard),
 * pass this data as props to the <StatementSheet /> component instead.
 */
const statementData = {
  to: {
    label: 'To',
    title: 'Payable Section',
    company: 'Sulb Al Jazeera Concrete Manufacturing'
  },
  from: {
    label: 'From',
    company: 'HK-Hassan Khamis Bin Mohammad AL Buainain Gen Cont Est.'
  },
  rows: [
    { sl: 1, invoiceNumber: 'GS/MIP/1278', invoiceMonths: 'Jan-26', invoiceDate: '31-01-26', invoiceAmount: '4,409.10', receivedAmount: '0.00', remarks: 'Over Due' },
    { sl: 2, invoiceNumber: 'GS/MIP/88', invoiceMonths: 'Feb-26', invoiceDate: '28-02-26', invoiceAmount: '41,129.75', receivedAmount: '0.00', remarks: 'Over Due' },
    { sl: 3, invoiceNumber: 'GS/MIP/90', invoiceMonths: 'Mar-26', invoiceDate: '31-03-26', invoiceAmount: '36,520.55', receivedAmount: '36,520.55', remarks: 'Paid' },
    { sl: 4, invoiceNumber: 'GS/MIP/93', invoiceMonths: 'Apr-26', invoiceDate: '30-04-26', invoiceAmount: '49,019.90', receivedAmount: '0.00', remarks: 'Over Due' },
    { sl: 5, invoiceNumber: 'GS/MIP/98', invoiceMonths: 'May-26', invoiceDate: '31-05-26', invoiceAmount: '43,633.30', receivedAmount: '0.00', remarks: 'Over Due' },
    { sl: 6, invoiceNumber: 'GS/MIP/101', invoiceMonths: 'Jun-26', invoiceDate: '30-06-26', invoiceAmount: '37,690.10', receivedAmount: '0.00', remarks: 'Over Due' },
    { sl: 7, invoiceNumber: 'GS/MIP/104', invoiceMonths: 'Jul-26', invoiceDate: '30-07-26', invoiceAmount: '28,678.70', receivedAmount: '0.00', remarks: 'Over Due' },
  ],
  signature: {
    name: 'Mohammad Ridoy.',
    title: 'Marketing Manager',
    company: 'Hasan Khamis Bin Mohammad Al Buainain General Contracting Est.',
    mobile: 'Mobile - 0564224811 / 0577041348',
    email: 'Email: info@hassankhamis.com'
  }
};

// ─── Utility Functions ───────────────────────────────────────
const parseNum = (val) => {
  if (val === undefined || val === null) return 0;
  const clean = String(val).replace(/,/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

const formatNum = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

// ─── StatementSheet Component ────────────────────────────────
// This is the core PDF-renderable component.
// For integration into a dashboard project, import and use:
//   <StatementSheet data={statementData} />
function StatementSheet({ data }) {
  const { to, from, rows, signature } = data;

  // Calculate pending amounts and totals
  const { processedRows, totals } = useMemo(() => {
    let totalInv = 0, totalRec = 0, totalPen = 0;

    const processed = rows.map(row => {
      const invVal = parseNum(row.invoiceAmount);
      const recVal = parseNum(row.receivedAmount);
      const pendingVal = invVal - recVal;
      totalInv += invVal;
      totalRec += recVal;
      totalPen += pendingVal;
      return { ...row, pendingAmount: formatNum(pendingVal) };
    });

    return {
      processedRows: processed,
      totals: {
        invoiceAmount: formatNum(totalInv),
        receivedAmount: formatNum(totalRec),
        pendingAmount: formatNum(totalPen)
      }
    };
  }, [rows]);

  return (
    <div className="pdf-sheet" id="pdf-sheet">
      <div className="page-content">
        {/* Header Image */}
        <img src="/header_clean.png" alt="Company Header" className="header-img" />

        {/* To/From Information */}
        <div className="to-from-section">
          <div className="info-row">
            <span className="info-label">{to.label}</span>
            <div className="info-value">
              <span className="info-text info-text-bold">{to.title}</span>
              <span className="info-text info-text-bold">{to.company}</span>
            </div>
          </div>
          <div className="info-row" style={{ marginTop: '2px' }}>
            <span className="info-label">{from.label}</span>
            <div className="info-value">
              <span className="info-text info-text-bold">{from.company}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="statement-table">
            <thead>
              <tr>
                <th className="col-sl">Sl</th>
                <th className="col-invoice">Invoice<br />Number</th>
                <th className="col-months">Invoice<br />Months</th>
                <th className="col-date">Invoice<br />Date</th>
                <th className="col-amount">Invoice<br />Amount</th>
                <th className="col-received">Received<br />Amount</th>
                <th className="col-pending">Pending<br />Amount</th>
                <th className="col-remarks">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {processedRows.map((row, index) => (
                <tr key={index}>
                  <td className="cell-sl">{row.sl}</td>
                  <td className="cell-invoice">{row.invoiceNumber}</td>
                  <td className="cell-months">{row.invoiceMonths}</td>
                  <td className="cell-date">{row.invoiceDate}</td>
                  <td className="cell-amount">{row.invoiceAmount}</td>
                  <td className="cell-received">{row.receivedAmount}</td>
                  <td className="cell-pending">{row.pendingAmount}</td>
                  <td className="cell-remarks">{row.remarks}</td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="total-row">
                <td colSpan={3} className="total-label-cell">Total Amounts</td>
                <td></td>
                <td style={{ textAlign: 'center' }}>{totals.invoiceAmount}</td>
                <td style={{ textAlign: 'center' }}>{totals.receivedAmount}</td>
                <td style={{ textAlign: 'center' }}>{totals.pendingAmount}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature / Contact Area */}
        <div className="signature-section">
          <div className="signature-name">{signature.name}</div>
          <div className="signature-title">{signature.title}</div>
          <div className="signature-company">{signature.company}</div>
          <div className="signature-contact">{signature.mobile}</div>
          <div className="signature-contact">{signature.email}</div>
        </div>

        {/* Footer Image */}
        <img src="/footer_clean.png" alt="Company Footer" className="footer-img" />
      </div>
    </div>
  );
}

// ─── App (Entry Point) ──────────────────────────────────────
// In a larger project, replace this with your dashboard page
// and render <StatementSheet data={...} /> + download logic.
function App() {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = () => {
    setIsExporting(true);

    const element = document.getElementById('pdf-sheet');
    const sheetHeight = element.offsetHeight;

    const opt = {
      margin: 0,
      filename: 'HK_Hassan_Khamis_Statement.pdf',
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: {
        unit: 'pt',
        format: [941.54, sheetHeight],
        orientation: 'portrait'
      }
    };

    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        setIsExporting(false);
      })
      .catch((err) => {
        console.error('PDF generation error:', err);
        setIsExporting(false);
      });
  };

  return (
    <div className="statement-page">
      {/* Floating Download Button */}
      <button
        className="download-btn"
        onClick={handleDownloadPDF}
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <svg className="download-btn-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
            </svg>
            Generating PDF...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download PDF
          </>
        )}
      </button>

      {/* PDF Sheet */}
      <StatementSheet data={statementData} />
    </div>
  );
}

export default App;

// ─── Export for reuse in other projects ──────────────────────
// In your dashboard project, you can import like:
//   import { StatementSheet, statementData } from './StatementSheet';
export { StatementSheet, statementData };
