import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { uploadBusinessFile } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  FileUp,
  Upload,
  FileText,
  Receipt,
  Building,
  FileSpreadsheet,
  Shield,
  BarChart,
  Image,
  File,
  Check,
  X,
} from 'lucide-react';

const fileCategories = [
  { value: 'invoice', label: 'Invoices', icon: FileText },
  { value: 'receipt', label: 'Receipts', icon: Receipt },
  { value: 'sales_record', label: 'Sales Records', icon: FileSpreadsheet },
  { value: 'expense_record', label: 'Expense Records', icon: FileSpreadsheet },
  { value: 'bank_statement', label: 'Bank Statements', icon: Building },
  { value: 'mpesa_statement', label: 'M-Pesa Statements', icon: Building },
  { value: 'contract', label: 'Contracts', icon: FileText },
  { value: 'license', label: 'Licenses & Certificates', icon: Shield },
  { value: 'tax_document', label: 'Tax Documents', icon: FileText },
  { value: 'regulatory', label: 'Regulatory Documents', icon: Shield },
  { value: 'report', label: 'Reports', icon: BarChart },
  { value: 'export', label: 'Exports', icon: FileSpreadsheet },
  { value: 'image', label: 'Images', icon: Image },
  { value: 'other', label: 'Other / Miscellaneous', icon: File },
];

// Mock uploaded files
const uploadedFiles = [
  { id: 1, name: 'Invoice_March_2024.pdf', type: 'invoice', size: '245 KB', date: '2024-01-20' },
  { id: 2, name: 'Bank_Statement_Q1.pdf', type: 'bank_statement', size: '1.2 MB', date: '2024-01-19' },
  { id: 3, name: 'MPesa_Statement.pdf', type: 'mpesa_statement', size: '892 KB', date: '2024-01-18' },
  { id: 4, name: 'Business_License.pdf', type: 'license', size: '156 KB', date: '2024-01-15' },
];

export const UploadsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };


  const handleUpload = async () => {
  if (!selectedFile || !selectedCategory || !token) {
    toast.error('Please select a file and category');
    return;
  }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileType', selectedCategory);
      formData.append('business_id', selectedBusiness.id); // from your state
      formData.append('user_id', loggedInUser.id);         // from your auth context
      formData.append('file_name', selectedFile.name);
  
      const response = await fetch('/upload-business-file', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      const data = await response.json();
  
      if (data.success) {
        toast.success('File uploaded successfully!');
        setUploadSuccess(true);
        setSelectedFile(null);
        setSelectedCategory('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setIsLoading(false);
    }
  };


  const getCategoryIcon = (type: string) => {
    const category = fileCategories.find((c) => c.value === type);
    return category?.icon || File;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">File Uploads</h1>
        <p className="text-muted-foreground">Upload and organize your business documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-primary" />
                Upload New File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Type Selection */}
              <div>
                <Label className="mb-2 block">File Category *</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type first" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <category.icon className="w-4 h-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  You must select a file category before uploading
                </p>
              </div>

              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  selectedCategory
                    ? 'border-primary/50 bg-primary/5 cursor-pointer hover:border-primary'
                    : 'border-border bg-secondary/30 cursor-not-allowed opacity-60'
                }`}
                onClick={() => selectedCategory && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={!selectedCategory}
                />
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-medium text-foreground mb-1">
                  {selectedFile ? selectedFile.name : 'Click to select a file'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory
                    ? 'Supported formats: PDF, JPG, PNG, DOC, XLS'
                    : 'Select a category first'}
                </p>
                {selectedFile && (
                  <p className="text-sm text-primary mt-2">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                variant="hero"
                className="w-full"
                disabled={!selectedFile || !selectedCategory || isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Upload File
                    <Upload className="w-4 h-4" />
                  </>
                )}
              </Button>

              {uploadSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-success/10 rounded-lg border border-success/20 flex items-center gap-2"
                >
                  <Check className="w-5 h-5 text-success" />
                  <span className="text-success font-medium">File uploaded successfully!</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {uploadedFiles.map((file) => {
                  const Icon = getCategoryIcon(file.type);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.size} • {file.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* File Categories */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Supported Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {fileCategories.slice(0, 8).map((category) => (
                  <div
                    key={category.value}
                    className="flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground"
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
