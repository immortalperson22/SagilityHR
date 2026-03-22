import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Upload, FileText, ExternalLink } from 'lucide-react';

interface PdfFixEditorProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'pre_employment' | 'policy';
  onUpload: (file: File) => Promise<void>;
  currentUrl?: string | null;
}

const SEJDA_URL = 'https://www.sejda.com/pdf-fill';

export default function PdfFixEditor({
  isOpen,
  onClose,
  documentType,
  onUpload,
  currentUrl
}: PdfFixEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
      onClose();
    } catch (err) {
      setError('Failed to upload file');
    }
    setUploading(false);
  };

  const documentName = documentType === 'pre_employment' 
    ? 'Pre-Employment Document' 
    : 'Policy Rules & Information';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fix {documentName}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Step 1:</strong> Use Sejda to edit your PDF
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.open(SEJDA_URL, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Open Sejda PDF Editor
            </Button>
          </div>

          {currentUrl && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Current file:</strong> uploaded
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(currentUrl, '_blank')}
              >
                <FileText className="w-4 h-4 mr-1" />
                View Current
              </Button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              <strong>Step 2:</strong> Upload Fixed PDF
            </label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {file.name}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1" />
                  Upload Fixed PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
