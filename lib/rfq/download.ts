/** RFC 6266 Content-Disposition value that always forces a download and
 * never lets a customer-supplied filename inject header syntax: an ASCII
 * fallback with quotes/backslashes/control chars replaced, plus the exact
 * name as an RFC 5987 `filename*` parameter. */
export function contentDispositionAttachment(fileName: string): string {
  const ascii = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_").slice(-180) || "download";
  const encoded = encodeURIComponent(fileName).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
