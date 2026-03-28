export function encodeCursor(value: string): string {
  return Buffer.from(value).toString("base64url");
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, "base64url").toString("utf-8");
}

export function buildCursor(id: string, createdAt: Date): string {
  return encodeCursor(`${createdAt.toISOString()}:${id}`);
}

export function parseCursor(cursor: string): { createdAt: Date; id: string } {
  const decoded = decodeCursor(cursor);
  const colonIdx = decoded.indexOf(":");
  const dateStr = decoded.substring(0, colonIdx);
  const id = decoded.substring(colonIdx + 1);
  return { createdAt: new Date(dateStr), id };
}
