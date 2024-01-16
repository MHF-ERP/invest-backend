export function firstOrMany(id: Id) {
  return id ? 'findFirst' : 'findMany';
}
