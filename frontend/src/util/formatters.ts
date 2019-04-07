export function makeBackendUrl(path: string) {
  return `${process.env.BACKEND_URL || ''}${path}`;
}

export function blobToString(blob: Blob, format: 'hex' | 'base64'): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          const str = Buffer.from(reader.result as string, 'binary').toString(format)
          resolve(str);
        } else {
          reject(new Error('File could not be read'));
        }
      });
      reader.readAsBinaryString(blob);
    } catch(err) {
      reject(err);
    }
  });
}