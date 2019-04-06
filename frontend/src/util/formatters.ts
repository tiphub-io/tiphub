export function makeBackendUrl(path: string) {
  return `${process.env.BACKEND_URL || ''}${path}`;
}