"use client";

import { AppData, CATEGORY_COLORS, Category } from "./store";

function fmt(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export async function exportMonthPdf(data: AppData, month: string) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const [year, mon] = month.split("-");
  const monthLabel = new Date(parseInt(year), parseInt(mon) - 1).toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const monthCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const expenses = data.expenses.filter((e) => e.date.startsWith(month));
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalSalary = data.carlosSalary + data.stefaneSalary;
  const balance = totalSalary - totalExpenses;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Background
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageW, 297, "F");

  // Header bar
  doc.setFillColor(30, 58, 95);
  doc.roundedRect(14, 10, pageW - 28, 28, 4, 4, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("SonecaGastos", 22, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(147, 197, 253);
  doc.text(`Relatório — ${monthCapitalized}`, 22, 30);

  // Summary cards
  const cards = [
    { label: "Renda Total", value: fmt(totalSalary), color: [59, 130, 246] as [number, number, number] },
    { label: "Total Gastos", value: fmt(totalExpenses), color: [239, 68, 68] as [number, number, number] },
    { label: "Saldo Final", value: fmt(Math.abs(balance)), color: balance >= 0 ? [34, 197, 94] as [number, number, number] : [239, 68, 68] as [number, number, number] },
  ];

  const cardW = (pageW - 28 - 8) / 3;
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 4);
    const y = 44;
    doc.setFillColor(20, 20, 30);
    doc.roundedRect(x, y, cardW, 22, 3, 3, "F");
    doc.setDrawColor(...card.color);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardW, 22, 3, 3, "S");

    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.setFont("helvetica", "normal");
    doc.text(card.label, x + 4, y + 7);

    doc.setFontSize(11);
    doc.setTextColor(...card.color);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + 4, y + 16);
  });

  // Salaries row
  doc.setFillColor(20, 20, 30);
  doc.roundedRect(14, 70, (pageW - 28 - 4) / 2, 14, 3, 3, "F");
  doc.roundedRect(14 + (pageW - 28 - 4) / 2 + 4, 70, (pageW - 28 - 4) / 2, 14, 3, 3, "F");

  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.setFont("helvetica", "normal");
  doc.text("Carlos", 18, 76);
  doc.text("Stefane", 18 + (pageW - 28 - 4) / 2 + 4, 76);

  doc.setFontSize(9);
  doc.setTextColor(96, 165, 250);
  doc.setFont("helvetica", "bold");
  doc.text(fmt(data.carlosSalary), 18, 81);

  doc.setTextColor(74, 222, 128);
  doc.text(fmt(data.stefaneSalary), 18 + (pageW - 28 - 4) / 2 + 4, 81);

  // Expenses table
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
      body: expenses.map((e) => {
        const d = new Date(e.date + "T00:00:00");
        return [
          d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          e.description,
          e.category,
          e.person,
          fmt(e.amount),
        ];
      }),
      foot: [["", "", "", "Total", fmt(totalExpenses)]],
      styles: {
        fillColor: [20, 20, 30],
        textColor: [229, 231, 235],
        fontSize: 8,
        cellPadding: 3,
        lineColor: [40, 40, 55],
        lineWidth: 0.3,
      },
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [147, 197, 253],
        fontStyle: "bold",
        fontSize: 8,
      },
      footStyles: {
        fillColor: [15, 15, 25],
        textColor: [239, 68, 68],
        fontStyle: "bold",
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 16 },
        4: { halign: "right", textColor: [239, 68, 68] },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const cat = data.cell.raw as string;
          const hex = CATEGORY_COLORS[cat as Category] || "#6b7280";
          const [r, g, b] = hexToRgb(hex);
          data.cell.styles.textColor = [r, g, b];
        }
      },
      alternateRowStyles: { fillColor: [25, 25, 38] },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 240;
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} • SonecaGastos`,
    pageW / 2,
    Math.min(finalY + 10, 285),
    { align: "center" }
  );

  doc.save(`sonecagastos-${month}.pdf`);
}
