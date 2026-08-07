import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Currency, ExpenseItem, IncomeItem, BudgetItem, InvestmentItem } from '../types';
import { formatCurrency } from './formatters';

interface ExportReportData {
  reportType: string;
  userEmail: string;
  currency: Currency;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  budgets: BudgetItem[];
  investments: InvestmentItem[];
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  savingsRate: string;
}

export function exportToCSV(data: ExportReportData) {
  let csvContent = `DATA REPORT: ${data.reportType.toUpperCase()}\n`;
  csvContent += `Generated On: ${new Date().toLocaleDateString()}\n`;
  csvContent += `User: ${data.userEmail}\n\n`;

  csvContent += `SUMMARY METRICS\n`;
  csvContent += `Total Income,${data.totalIncome}\n`;
  csvContent += `Total Expense,${data.totalExpense}\n`;
  csvContent += `Net Savings,${data.totalSavings}\n`;
  csvContent += `Savings Rate,${data.savingsRate}%\n\n`;

  csvContent += `INCOME BREAKDOWN\nCategory,Source,Amount,Date\n`;
  data.incomes.forEach(i => {
    csvContent += `"${i.category}","${i.source}",${i.amount},"${i.date}"\n`;
  });

  csvContent += `\nEXPENSE BREAKDOWN\nCategory,Title,Amount,Date\n`;
  data.expenses.forEach(e => {
    csvContent += `"${e.category}","${e.title}",${e.amount},"${e.date}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Finance_Report_${data.reportType.toLowerCase()}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: ExportReportData) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Report Type', data.reportType],
    ['User Email', data.userEmail],
    ['Total Income', data.totalIncome],
    ['Total Expense', data.totalExpense],
    ['Net Savings', data.totalSavings],
    ['Savings Rate (%)', `${data.savingsRate}%`]
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  // Income sheet
  const incomeRows = data.incomes.map(i => ({
    Category: i.category,
    Source: i.source,
    Amount: i.amount,
    Date: i.date,
    Notes: i.notes || ''
  }));
  const incomeWs = XLSX.utils.json_to_sheet(incomeRows);
  XLSX.utils.book_append_sheet(wb, incomeWs, 'Incomes');

  // Expenses sheet
  const expenseRows = data.expenses.map(e => ({
    Category: e.category,
    Title: e.title,
    Amount: e.amount,
    Date: e.date,
    Notes: e.notes || ''
  }));
  const expenseWs = XLSX.utils.json_to_sheet(expenseRows);
  XLSX.utils.book_append_sheet(wb, expenseWs, 'Expenses');

  // Investments sheet
  const invRows = data.investments.map(inv => ({
    Name: inv.name,
    Type: inv.type,
    'Amount Invested': inv.amountInvested,
    'Current Value': inv.currentValue,
    'Purchase Date': inv.purchaseDate
  }));
  const invWs = XLSX.utils.json_to_sheet(invRows);
  XLSX.utils.book_append_sheet(wb, invWs, 'Investments');

  XLSX.writeFile(wb, `Financial_Report_${data.reportType.toLowerCase()}_${Date.now()}.xlsx`);
}

export function exportToPDF(data: ExportReportData) {
  const doc = new jsPDF();
  const currency = data.currency;

  // Title & Header
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241); // Indigo
  doc.text('Personal Finance Assistant Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Type: ${data.reportType.toUpperCase()} REPORT  |  Generated: ${new Date().toLocaleDateString()}`, 14, 27);
  doc.text(`User: ${data.userEmail}`, 14, 32);

  // Key Summary Box
  doc.setDrawColor(99, 102, 241);
  doc.setFillColor(245, 247, 255);
  doc.rect(14, 38, 182, 30, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(`Total Income: ${formatCurrency(data.totalIncome, currency)}`, 20, 48);
  doc.text(`Total Expenses: ${formatCurrency(data.totalExpense, currency)}`, 20, 58);

  doc.text(`Net Savings: ${formatCurrency(data.totalSavings, currency)}`, 105, 48);
  doc.text(`Savings Rate: ${data.savingsRate}%`, 105, 58);

  // Income Table
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text('Income Breakdown', 14, 78);

  const incomeTableData = data.incomes.map(i => [
    i.category,
    i.source,
    formatCurrency(i.amount, currency),
    i.date
  ]);

  autoTable(doc, {
    startY: 83,
    head: [['Category', 'Source', 'Amount', 'Date']],
    body: incomeTableData,
    headStyles: { fillColor: [16, 185, 129] }
  });

  // Expense Table
  const finalY = (doc as any).lastAutoTable.finalY || 130;
  doc.setFontSize(13);
  doc.setTextColor(244, 63, 94); // Rose
  doc.text('Expense Breakdown', 14, finalY + 15);

  const expenseTableData = data.expenses.map(e => [
    e.category,
    e.title,
    formatCurrency(e.amount, currency),
    e.date
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Category', 'Title', 'Amount', 'Date']],
    body: expenseTableData,
    headStyles: { fillColor: [244, 63, 94] }
  });

  doc.save(`Finance_Report_${data.reportType.toLowerCase()}_${Date.now()}.pdf`);
}
