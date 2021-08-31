
export const saveFile = (fileName: string, blobParts: BlobPart[], mimeType: string) => {
    let blob = new Blob(blobParts, {type: mimeType});
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
};