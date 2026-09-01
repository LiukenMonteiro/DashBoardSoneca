"use client";

import type { jsPDF as JsPDFType } from "jspdf";
import { AppData, CATEGORY_COLORS, Category } from "./store";

function fmt(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function monthLabel(month: string): string {
  const [y, m] = month.split("-");
  const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

async function createDoc() {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  return { jsPDF, autoTable };
}

function drawHeader(
  doc: JsPDFType,
  pageW: number,
  title: string,
  subtitle: string
) {
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageW, 297, "F");

  doc.setFillColor(30, 58, 95);
  doc.roundedRect(14, 10, pageW - 28, 28, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 22, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(147, 197, 253);
  doc.text(subtitle, 22, 30);
}

function drawSummaryCards(
  doc: JsPDFType,
  pageW: number,
  totalSalary: number,
  totalExpenses: number,
  balance: number,
  yStart: number
) {
  const cards: { label: string; value: string; color: [number, number, number] }[] = [
    { label: "Renda Total", value: fmt(totalSalary), color: [59, 130, 246] },
    { label: "Total Gastos", value: fmt(totalExpenses), color: [239, 68, 68] },
    { label: "Saldo Final", value: fmt(Math.abs(balance)), color: balance >= 0 ? [34, 197, 94] : [239, 68, 68] },
  ];
  const cardW = (pageW - 28 - 8) / 3;
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 4);
    doc.setFillColor(20, 20, 30);
    doc.roundedRect(x, yStart, cardW, 22, 3, 3, "F");
    doc.setDrawColor(...card.color);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, yStart, cardW, 22, 3, 3, "S");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.setFont("helvetica", "normal");
    doc.text(card.label, x + 4, yStart + 7);
    doc.setFontSize(11);
    doc.setTextColor(...card.color);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 4, yStart + 16);
  });
}

function drawSalaryRow(
  doc: JsPDFType,
  pageW: number,
  carlosSalary: number,
  stefaneMensal: number,
  yStart: number
) {
  const half = (pageW - 28 - 4) / 2;
  doc.setFillColor(20, 20, 30);
  doc.roundedRect(14, yStart, half, 14, 3, 3, "F");
  doc.roundedRect(14 + half + 4, yStart, half, 14, 3, 3, "F");

  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.setFont("helvetica", "normal");
  doc.text("Carlos", 18, yStart + 6);
  doc.text("Stefane (fixo + comissão)", 18 + half + 4, yStart + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(96, 165, 250);
  doc.text(fmt(carlosSalary), 18, yStart + 11);
  doc.setTextColor(74, 222, 128);
  doc.text(fmt(stefaneMensal), 18 + half + 4, yStart + 11);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAutoTableFinalY(doc: any): number {
  return doc.lastAutoTable?.finalY ?? 240;
}

export async function exportMonthPdf(data: AppData, month: string) {
  const { jsPDF, autoTable } = await createDoc();
  const stefaneMensal = (data.stefaneQ1Fixed + data.stefaneQ1Variable) + (data.stefaneQ2Fixed + data.stefaneQ2Variable);
  const totalSalary = data.carlosSalary + stefaneMensal;
  const expenses = data.expenses.filter((e) => e.date.startsWith(month));
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const balance = totalSalary - totalExpenses;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  drawHeader(doc, pageW, "SonecaGastos", `Relatório — ${monthLabel(month)}`);
  drawSummaryCards(doc, pageW, totalSalary, totalExpenses, balance, 44);
  drawSalaryRow(doc, pageW, data.carlosSalary, stefaneMensal, 70);

  if (expenses.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("Nenhum gasto registrado neste mês.", pageW / 2, 105, { align: "center" });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(229, 231, 235);
    doc.setFont("helvetica", "bold");
    doc.text("Lançamentos do Mês", 14, 93);

    autoTable(doc, {
      startY: 96,
      head: [["Data", "Descrição", "Categoria", "Responsável", "Valor"]],
      body: expenses.map((e) => [
        new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        e.description,
        e.category,
        e.person,
        fmt(e.amount),
      ]),
      foot: [["", "", "", "Total", fmt(totalExpenses)]],
      styles: { fillColor: [20, 20, 30], textColor: [229, 231, 235], fontSize: 8, cellPadding: 3, lineColor: [40, 40, 55], lineWidth: 0.3 },
      headStyles: { fillColor: [30, 58, 95], textColor: [147, 197, 253], fontStyle: "bold", fontSize: 8 },
      footStyles: { fillColor: [15, 15, 25], textColor: [239, 68, 68], fontStyle: "bold", fontSize: 9 },
      columnStyles: { 0: { cellWidth: 16 }, 4: { halign: "right", textColor: [239, 68, 68] } },
      didParseCell: (cell) => {
        if (cell.section === "body" && cell.column.index === 2) {
          const [r, g, b] = hexToRgb(CATEGORY_COLORS[cell.cell.raw as Category] || "#6b7280");
          cell.cell.styles.textColor = [r, g, b];
        }
      },
      alternateRowStyles: { fillColor: [25, 25, 38] },
      margin: { left: 14, right: 14 },
    });
  }

  const finalY = getAutoTableFinalY(doc);
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} • SonecaGastos`, pageW / 2, Math.min(finalY + 10, 285), { align: "center" });

  doc.save(`sonecagastos-${month}.pdf`);
}

export async function exportSixMonthsPdf(data: AppData, months: string[], stefaneMensal: number) {
  const { jsPDF, autoTable } = await createDoc();
  const totalSalary = data.carlosSalary + stefaneMensal;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const periodLabel = `${monthLabel(months[0])} a ${monthLabel(months[5])}`;

  drawHeader(doc, pageW, "SonecaGastos", `Extrato — ${periodLabel}`);

  // Resumo global do período
  const allExpenses = data.expenses.filter((e) => months.some((m) => e.date.startsWith(m)));
  const totalExpenses = allExpenses.reduce((s, e) => s + e.amount, 0);
  const totalSalaryPeriod = totalSalary * 6;
  const balance = totalSalaryPeriod - totalExpenses;

  drawSummaryCards(doc, pageW, totalSalaryPeriod, totalExpenses, balance, 44);

  // Linha de salários
  drawSalaryRow(doc, pageW, data.carlosSalary, stefaneMensal, 70);

  let currentY = 90;

  // Tabela por mês
  for (const month of months) {
    const monthExpenses = data.expenses.filter((e) => e.date.startsWith(month));
    const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

    // Verifica espaço na página
    if (currentY > 240) {
      doc.addPage();
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, pageW, 297, "F");
      currentY = 14;
    }

    doc.setFontSize(9);
    doc.setTextColor(147, 197, 253);
    doc.setFont("helvetica", "bold");
    doc.text(monthLabel(month), 14, currentY + 5);

    if (monthExpenses.length === 0) {
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "normal");
      doc.text("Sem lançamentos", 14, currentY + 12);
      currentY += 18;
      continue;
    }

    autoTable(doc, {
      startY: currentY + 8,
      head: [["Data", "Descrição", "Categoria", "Responsável", "Valor"]],
      body: monthExpenses.map((e) => [
        new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        e.description,
        e.category,
        e.person,
        fmt(e.amount),
      ]),
      foot: [["", "", "", "Subtotal", fmt(monthTotal)]],
      styles: { fillColor: [20, 20, 30], textColor: [229, 231, 235], fontSize: 7, cellPadding: 2.5, lineColor: [40, 40, 55], lineWidth: 0.3 },
      headStyles: { fillColor: [30, 58, 95], textColor: [147, 197, 253], fontStyle: "bold", fontSize: 7 },
      footStyles: { fillColor: [15, 15, 25], textColor: [239, 68, 68], fontStyle: "bold", fontSize: 8 },
      columnStyles: { 0: { cellWidth: 14 }, 4: { halign: "right", textColor: [239, 68, 68] } },
      didParseCell: (cell) => {
        if (cell.section === "body" && cell.column.index === 2) {
          const [r, g, b] = hexToRgb(CATEGORY_COLORS[cell.cell.raw as Category] || "#6b7280");
          cell.cell.styles.textColor = [r, g, b];
        }
      },
      alternateRowStyles: { fillColor: [25, 25, 38] },
      margin: { left: 14, right: 14 },
    });

    currentY = getAutoTableFinalY(doc) + 8;
  }

  // Total geral
  if (currentY > 260) {
    doc.addPage();
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, pageW, 297, "F");
    currentY = 14;
  }

  doc.setFillColor(15, 31, 63);
  doc.roundedRect(14, currentY, pageW - 28, 14, 3, 3, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(147, 197, 253);
  doc.text("TOTAL DO PERÍODO", 18, currentY + 9);
  doc.setTextColor(balance >= 0 ? 74 : 239, balance >= 0 ? 222 : 68, balance >= 0 ? 128 : 68);
  doc.text(`Saldo: ${fmt(balance)}`, pageW - 18, currentY + 9, { align: "right" });

  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} • SonecaGastos`, pageW / 2, Math.min(currentY + 24, 290), { align: "center" });

  doc.save(`sonecagastos-6meses.pdf`);
}
