function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

const downloadImage = ( dataURL ) => {
  console.log('save image 실행');

  const [mimeType, base64Data] = dataURL.split(';base64,');
// Blob 생성
  const blob = base64ToBlob(base64Data, mimeType);

  // 파일 이름 생성
  // const fileName = originalFileName.replace(/\.[^/.]+$/, "") + "-edit.png";

  const url = URL.createObjectURL(blob);
  console.log(url);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'edit.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default downloadImage;