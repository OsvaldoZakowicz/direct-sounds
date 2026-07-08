// patron adapter
// envuelve las particularidades de la rest api de supabase storage
// (headers, formato de la url, autenticacion) detras de un metodo simple: subir
export class SupabaseStorageUploader {
  constructor({ baseUrl, bucket, serviceRoleKey }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.bucket = bucket;
    this.serviceRoleKey = serviceRoleKey;
  }

  async subir({ buffer, fileName, contentType, cacheControl }) {
    const endpoint = `${this.baseUrl}/storage/v1/object/${this.bucket}/${fileName}`;

    const respuesta = await fetch(endpoint, {
      method: 'POST',
      headers: {
        apikey: this.serviceRoleKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        'Content-Type': contentType,
        'cache-control': cacheControl,
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      throw new Error(
        `fallo al subir ${fileName}: ${respuesta.status} ${detalle}`,
      );
    }

    return respuesta.json();
  }
}
