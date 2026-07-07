import { SOUNDS } from '../data/sounds.js';

// patron repository
// centraliza el acceso a los datos de sonidos y la construccion de su url publica
// si el dia de manana los datos pasan de un array estatico a una tabla de supabase
// solo se modifica esta clase, el resto de la app no se entera del cambio
export class SoundRepository {
  // el repositorio necesita la url al proyecto "Project URL"
  constructor(supabaseBaseUrl) {
    this.supabaseBaseUrl = supabaseBaseUrl.replace(/\/$/, '');
  }

  // traer todos los sonidos
  obtenerTodos() {
    return SOUNDS.map((sonido) => this.#mapearConUrl(sonido));
  }

  // buscar un sonido por su id
  obtenerPorId(id) {
    const sonido = SOUNDS.find((item) => item.id === id);
    return sonido ? this.#mapearConUrl(sonido) : null;
  }

  // metodo privado, contruye las url directas al bucket de supabase
  // el bucket es de acceso publico, por eso son urls asi
  #mapearConUrl(sonido) {
    return {
      ...sonido,
      publicUrl: `${this.supabaseBaseUrl}/storage/v1/object/public/sounds/${sonido.fileName}`,
    };
  }
}
