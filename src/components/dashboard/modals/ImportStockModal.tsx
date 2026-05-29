import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Upload, X, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ParsedRow {
  name: string;
  stock: number;
  cost_price: number;
  selling_price: number;
  low_stock_threshold: number;
  valid: boolean;
  error?: string;
}

export const ImportStockModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { user, accessToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      const parsed: ParsedRow[] = rows.map((row, i) => {
        const name = String(row['Product Name'] || row['name'] || '').trim();
        const stock = Number(row['Stock'] || row['stock'] || 0);
        const cost_price = Number(row['Cost Price'] || row['cost_price'] || 0);
        const selling_price = Number(row['Selling Price'] || row['selling_price'] || 0);
        const low_stock_threshold = Number(row['Low Stock Threshold'] || row['low_stock_threshold'] || 5);

        if (!name) {
          return { name, stock, cost_price, selling_price, low_stock_threshold, valid: false, error: `Row ${i + 2}: Product name is required` };
        }
        if (isNaN(stock) || stock < 0) {
          return { name, stock, cost_price, selling_price, low_stock_threshold, valid: false, error: `Row ${i + 2}: Invalid stock quantity` };
        }

        return { name, stock, cost_price, selling_price, low_stock_threshold, valid: true };
      });

      setParsedRows(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const validRows = parsedRows.filter(r => r.valid);
  const invalidRows = parsedRows.filter(r => !r.valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setIsUploading(true);

    try {
      const res = await fetch('https://api.aflows.uk/api/v1/inventory/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          business_id: user?.businessId,
          items: validRows.map(r => ({
            name: r.name,
            stock: r.stock,
            cost_price: r.cost_price,
            selling_price: r.selling_price,
            low_stock_threshold: r.low_stock_threshold,
          })),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      toast.success(`${validRows.length} products imported successfully`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Product Name': 'Example Product',
        'Stock': 100,
        'Cost Price': 500,
        'Selling Price': 800,
        'Low Stock Threshold': 10,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'aflows_inventory_template.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold">Import Stock from Excel</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Template download */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
            <div>
              <p className="text-sm font-semibold">Download Template</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Use this template to ensure your data imports correctly
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
          </div>

          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              {fileName || 'Click or drag your Excel file here'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls, or .csv</p>
          </div>

          {/* Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {validRows.length} valid
                </span>
                {invalidRows.length > 0 && (
                  <span className="flex items-center gap-1.5 text-destructive font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {invalidRows.length} errors
                  </span>
                )}
              </div>

              {invalidRows.length > 0 && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-1">
                  {invalidRows.map((r, i) => (
                    <p key={i} className="text-xs text-destructive">{r.error}</p>
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-muted-foreground font-semibold">
                      <th className="p-3">Product</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3">Cost</th>
                      <th className="p-3">Selling</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedRows.slice(0, 10).map((row, i) => (
                      <tr key={i} className={row.valid ? '' : 'bg-destructive/5'}>
                        <td className="p-3 font-medium">{row.name || '—'}</td>
                        <td className="p-3">{row.stock}</td>
                        <td className="p-3">{row.cost_price}</td>
                        <td className="p-3">{row.selling_price}</td>
                        <td className="p-3">
                          {row.valid
                            ? <span className="text-green-600 font-semibold">✓</span>
                            : <span className="text-destructive font-semibold">✗</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRows.length > 10 && (
                  <p className="text-xs text-muted-foreground p-3 border-t border-border">
                    + {parsedRows.length - 10} more rows not shown
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0 gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleImport}
            disabled={validRows.length === 0 || isUploading}
          >
            {isUploading ? 'Importing...' : `Import ${validRows.length} Products`}
          </Button>
        </div>
      </div>
    </div>
  );
};
