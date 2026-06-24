import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface ParsedCustomer {
  name: string;
  phone: string;
  email: string;
  location: string;
  valid: boolean;
  error?: string;
}

export const ImportCustomersModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedRows, setParsedRows] = useState<ParsedCustomer[]>([]);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleFile = (file: File) => {
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(
        e.target?.result as ArrayBuffer
      );

      const workbook = XLSX.read(data, {
        type: 'array',
      });

      const sheet =
        workbook.Sheets[workbook.SheetNames[0]];

      const rows: any[] =
        XLSX.utils.sheet_to_json(sheet);

      const seenNames = new Set<string>();

      const parsed: ParsedCustomer[] = rows.map(
        (row, index) => {
          const name = String(
            row['Name'] ||
            row['Customer Name'] ||
            row['name'] ||
            ''
          ).trim();

          const phone = String(
            row['Phone'] ||
            row['phone'] ||
            ''
          ).trim();

          const email = String(
            row['Email'] ||
            row['email'] ||
            ''
          ).trim();

          const location = String(
            row['Location'] ||
            row['location'] ||
            ''
          ).trim();

          if (!name) {
            return {
              name,
              phone,
              email,
              location,
              valid: false,
              error: `Row ${index + 2}: Customer name is required`,
            };
          }

          const normalizedName =
            name.toLowerCase();

          if (seenNames.has(normalizedName)) {
            return {
              name,
              phone,
              email,
              location,
              valid: false,
              error: `Row ${index + 2}: Duplicate customer in file`,
            };
          }

          seenNames.add(normalizedName);

          return {
            name,
            phone,
            email,
            location,
            valid: true,
          };
        }
      );

      setParsedRows(parsed);
    };

    reader.readAsArrayBuffer(file);
  };

  const validRows = parsedRows.filter(
    (row) => row.valid
  );

  const invalidRows = parsedRows.filter(
    (row) => !row.valid
  );

  const handleImport = async () => {
    if (validRows.length === 0) return;

    setIsUploading(true);

    try {
      const res = await fetch(
        'https://api.aflows.uk/api/v1/customers/import',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessId: user?.businessId,
            customers: validRows.map((c) => ({
              name: c.name,
              phone: c.phone || null,
              email: c.email || null,
              location: c.location || null,
            })),
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(
          data.message || 'Import failed'
        );
      }

      toast.success(
        `${data.imported || validRows.length} customers imported`
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err.message || 'Import failed'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        Name: 'John Doe',
        Phone: '0712345678',
        Email: 'john@example.com',
        Location: 'Nairobi',
      },
      {
        Name: 'Jane Smith',
        Phone: '0723456789',
        Email: 'jane@example.com',
        Location: 'Westlands',
      },
    ];

    const ws =
      XLSX.utils.json_to_sheet(template);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      'Customers'
    );

    XLSX.writeFile(
      wb,
      'aflows_customers_template.xlsx'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold">
              Import Customers
            </h2>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
            <div>
              <p className="text-sm font-semibold">
                Download Template
              </p>

              <p className="text-xs text-muted-foreground mt-0.5">
                Upload existing customers from
                Excel or CSV.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
          </div>

          {/* Upload */}

          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            onClick={() =>
              fileInputRef.current?.click()
            }
            onDragOver={(e) =>
              e.preventDefault()
            }
            onDrop={(e) => {
              e.preventDefault();

              const file =
                e.dataTransfer.files[0];

              if (file) handleFile(file);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (file) handleFile(file);
              }}
            />

            <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />

            <p className="text-sm font-medium">
              {fileName ||
                'Click or drag customer file here'}
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              .xlsx, .xls, .csv
            </p>
          </div>

          {/* Results */}

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
                  {invalidRows.map(
                    (row, index) => (
                      <p
                        key={index}
                        className="text-xs text-destructive"
                      >
                        {row.error}
                      </p>
                    )
                  )}
                </div>
              )}

              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-muted-foreground font-semibold">
                      <th className="p-3">
                        Name
                      </th>
                      <th className="p-3">
                        Phone
                      </th>
                      <th className="p-3 hidden md:table-cell">
                        Email
                      </th>
                      <th className="p-3 hidden md:table-cell">
                        Location
                      </th>
                      <th className="p-3">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {parsedRows
                      .slice(0, 10)
                      .map((row, index) => (
                        <tr
                          key={index}
                          className={
                            row.valid
                              ? ''
                              : 'bg-destructive/5'
                          }
                        >
                          <td className="p-3 font-medium">
                            {row.name || '—'}
                          </td>

                          <td className="p-3">
                            {row.phone || '—'}
                          </td>

                          <td className="p-3 hidden md:table-cell">
                            {row.email || '—'}
                          </td>

                          <td className="p-3 hidden md:table-cell">
                            {row.location || '—'}
                          </td>

                          <td className="p-3">
                            {row.valid ? (
                              <span className="text-green-600 font-semibold">
                                ✓
                              </span>
                            ) : (
                              <span className="text-destructive font-semibold">
                                ✗
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {parsedRows.length > 10 && (
                  <p className="text-xs text-muted-foreground p-3 border-t border-border">
                    +{' '}
                    {parsedRows.length - 10}{' '}
                    more rows not shown
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0 gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={handleImport}
            disabled={
              validRows.length === 0 ||
              isUploading
            }
          >
            {isUploading
              ? 'Importing...'
              : `Import ${validRows.length} Customers`}
          </Button>
        </div>
      </div>
    </div>
  );
};
