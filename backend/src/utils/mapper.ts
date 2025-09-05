/**
 * Hook de mapeo flexible. Por ahora retorna tal cual.
 * Útil para formatear respuestas uniformes o filtrar campos.
 */
export async function mapResults<T>(data: T): Promise<T> {
  return data;
}