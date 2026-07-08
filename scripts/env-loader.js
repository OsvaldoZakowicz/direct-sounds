import { readFileSync, existsSync } from 'node:fs';

// carga variables desde un archivo .env sin necesitar el paquete dotenv
// formato esperado clave=valor una por linea, ignora lineas vacias o con #
export function cargarEnv(ruta) {
  if (!existsSync(ruta)) {
    throw new Error(`no se encontro el archivo de entorno en ${ruta}`);
  }

  const contenido = readFileSync(ruta, 'utf-8');

  for (const linea of contenido.split('\n')) {
    const limpia = linea.trim();

    if (limpia === '' || limpia.startsWith('#')) {
      continue;
    }

    const indiceIgual = limpia.indexOf('=');
    if (indiceIgual === -1) {
      continue;
    }

    const clave = limpia.slice(0, indiceIgual).trim();
    const valor = limpia.slice(indiceIgual + 1).trim();

    process.env[clave] = valor;
  }
}
