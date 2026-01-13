export const mockUrl = (path: string, queryParams: Record<string, any> = {}) => {
  const url = new URL(`http://localhost${path}`);
  for (const [k, v] of Object.entries(queryParams)) {
    url.searchParams.set(k, String(v));
  }
  return url;
};

export const asc = (col: string) => (a: Record<string, unknown>, b: Record<string, unknown>) => {
  const colA = a[col];
  const colB = b[col];

  if (colA === colB) return 0;

  if (colA == null) return -1;
  if (colB == null) return 1;

  if (colA < colB) return -1;
  return 1;
};

export const desc = (col: string) => (a: Record<string, unknown>, b: Record<string, unknown>) =>
  -asc(col)(a, b);
