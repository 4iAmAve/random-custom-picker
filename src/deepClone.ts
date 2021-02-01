export function deepClone<T>(value: T): T {
  // return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
