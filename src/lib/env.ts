export function getEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }

  return value;
}