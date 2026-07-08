import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cargarEnv } from './env-loader.js';
import { SupabaseStorageUploader } from './supabase-storage-uploader.js';

const directorioScript = dirname(fileURLToPath(import.meta.url));

// un año de cache, expresado como directiva valida de http
// los sonidos no cambian una vez subidos asi que immutable tiene sentido
const CACHE_CONTROL_UN_ANIO = 'public, max-age=31536000, immutable';

// carpeta donde estan los mp3, se puede pasar como argumento o usar la carpeta actual
// ejemplo: node scripts/upload-sounds.js /ruta/a/mis/sonidos
const carpetaSonidos = process.argv[2] ?? process.cwd();

cargarEnv(join(directorioScript, '.env'));

const uploader = new SupabaseStorageUploader({
  baseUrl: process.env.SUPABASE_URL,
  bucket: 'sounds',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en scripts/.env',
    );
  }

  const archivos = readdirSync(carpetaSonidos).filter((nombre) =>
    nombre.toLowerCase().endsWith('.mp3'),
  );

  if (archivos.length === 0) {
    console.log(`no se encontraron archivos mp3 en ${carpetaSonidos}`);
    return;
  }

  console.log(
    `subiendo ${archivos.length} archivo(s) desde ${carpetaSonidos}\n`,
  );

  for (const nombreArchivo of archivos) {
    const rutaCompleta = join(carpetaSonidos, nombreArchivo);
    const buffer = readFileSync(rutaCompleta);

    try {
      await uploader.subir({
        buffer,
        fileName: nombreArchivo,
        contentType: 'audio/mpeg',
        cacheControl: CACHE_CONTROL_UN_ANIO,
      });
      console.log(`ok  ${nombreArchivo}`);
    } catch (error) {
      console.error(`error  ${nombreArchivo}  ${error.message}`);
    }
  }

  console.log('\nlisto');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
