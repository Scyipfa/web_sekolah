import ExcelJS from 'exceljs';

function stamp() {
  const d = new Date(Date.now() + 7 * 3600 * 1000); // WIB
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}_${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
}

export async function xlsxResponse(prefix, headers, rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  ws.addRow(headers).font = { bold: true };
  rows.forEach((r) => ws.addRow(r));
  ws.columns.forEach((col, i) => {
    const max = Math.max(String(headers[i]).length, ...rows.map((r) => String(r[i] ?? '').length));
    col.width = Math.min(60, max + 2);
  });
  const buf = await wb.xlsx.writeBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${prefix}_${stamp()}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
