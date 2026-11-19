<?php
// XLSX — generator file .xlsx murni PHP (tanpa Composer/ZipArchive).
// Menghasilkan ZIP store-method (uncompressed) berisi OOXML minimal.
// Penggunaan:
//   XLSX::download('data_siswa.xlsx', ['Kolom1','Kolom2'], [[a,b],[c,d]]);

class XLSX
{
    // $headers: array judul kolom; $rows: array of array (sel).
    public static function download(string $filename, array $headers, array $rows): void
    {
        $files = self::buildParts($headers, $rows);
        $zip   = self::zipStore($files);

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Length: ' . strlen($zip));
        header('Cache-Control: no-store, no-cache, must-revalidate');
        echo $zip;
        exit;
    }

    // ---------------- Bagian XML OOXML ----------------
    private static function buildParts(array $headers, array $rows): array
    {
        $sheet = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<sheetData>'
            . self::rowXml(1, $headers, true);

        $r = 2;
        foreach ($rows as $row) {
            $sheet .= self::rowXml($r++, $row, false);
        }
        $sheet .= '</sheetData></worksheet>';

        return [
            '[Content_Types].xml' =>
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
                . '<Default Extension="xml" ContentType="application/xml"/>'
                . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
                . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
                . '</Types>',
            '_rels/.rels' =>
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
                . '</Relationships>',
            'xl/workbook.xml' =>
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
                . 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
                . '<sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>',
            'xl/_rels/workbook.xml.rels' =>
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
                . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
                . '</Relationships>',
            'xl/styles.xml' =>
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
                . '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>'
                . '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
                . '<fills count="1"><fill><patternFill/></fill></fills>'
                . '<borders count="1"><border/></borders>'
                . '<cellStyleXfs count="1"><xf/></cellStyleXfs>'
                . '<cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs>'
                . '</styleSheet>',
            'xl/worksheets/sheet1.xml' => $sheet,
        ];
    }

    private static function rowXml(int $r, array $cells, bool $header): string
    {
        $xml = '<row r="' . $r . '">';
        foreach (array_values($cells) as $i => $v) {
            $ref = self::colLetter($i) . $r;
            $style = $header ? ' s="1"' : '';
            if (is_numeric($v) && !is_string($v)) {
                $xml .= '<c r="' . $ref . '"' . $style . '><v>' . $v . '</v></c>';
            } else {
                $xml .= '<c r="' . $ref . '" t="inlineStr"' . $style . '><is><t xml:space="preserve">'
                    . self::esc((string)$v) . '</t></is></c>';
            }
        }
        return $xml . '</row>';
    }

    private static function colLetter(int $i): string
    {
        $s = '';
        for ($n = $i; $n >= 0; $n = intdiv($n, 26) - 1) {
            $s = chr(65 + ($n % 26)) . $s;
        }
        return $s;
    }

    private static function esc(string $s): string
    {
        return htmlspecialchars($s, ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    // ---------------- ZIP (store method, tanpa kompresi) ----------------
    private static function zipStore(array $files): string
    {
        $out = '';
        $central = '';
        $offset = 0;

        [$dtime, $ddate] = self::dosTime();

        foreach ($files as $name => $data) {
            $crc  = crc32($data);
            $size = strlen($data);
            $nlen = strlen($name);

            // Local file header
            $local = pack('VvvvvvVVVvv',
                0x04034b50, // signature
                20,         // version needed
                0,          // flags
                0,          // method: store
                $dtime, $ddate,
                $crc, $size, $size,
                $nlen, 0    // name len, extra len
            ) . $name;

            $out .= $local . $data;

            // Central directory entry
            $central .= pack('VvvvvvvVVVvvvvvVV',
                0x02014b50, // signature
                20,         // version made by
                20,         // version needed
                0,          // flags
                0,          // method
                $dtime, $ddate,
                $crc, $size, $size,
                $nlen, 0, 0, 0, 0, // name, extra, comment, disk, internal attr
                0,          // external attr
                $offset     // local header offset
            ) . $name;

            $offset += strlen($local) + $size;
        }

        $cdSize = strlen($central);
        $out .= $central;
        $out .= pack('VvvvvVVv',
            0x06054b50, // EOCD signature
            0, 0,       // disk numbers
            count($files), count($files),
            $cdSize, $offset,
            0           // comment len
        );

        return $out;
    }

    private static function dosTime(): array
    {
        $t = time();
        $dtime = ((int)date('H', $t) << 11) | ((int)date('i', $t) << 5) | ((int)date('s', $t) >> 1);
        $ddate = (((int)date('Y', $t) - 1980) << 9) | ((int)date('n', $t) << 5) | (int)date('j', $t);
        return [$dtime, $ddate];
    }
}
