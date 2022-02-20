export function hasOwnProperty<T extends object, P extends PropertyKey>(
  source: T,
  needle: P,
): source is T & Record<P, unknown> {
  return source.hasOwnProperty(needle);
}
