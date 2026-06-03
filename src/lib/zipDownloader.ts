import JSZip from 'jszip';

export const downloadReceiptsAsZip = async (receipts: any[], businessName: string) => {
  const zip = new JSZip();
  const folder = zip.folder('receipts');

  for (const receipt of receipts) {
    try {
      // Fetch the PDF from backend
      const res = await fetch(`https://api.aflows.uk/api/v1/receipts/${receipt.id}/download`);
      if (!res.ok) continue;
      
      const blob = await res.blob();
      const filename = `${receipt.receipt_number || receipt.id}.pdf`;
      folder?.file(filename, blob);
    } catch (err) {
      console.error(`Failed to fetch receipt ${receipt.id}:`, err);
    }
  }

  // Generate and download ZIP
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${businessName}-receipts-${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}.zip`;
  a.click();
  URL.revokeObjectURL(url);
};
