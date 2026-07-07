// patron singleton + observer
// una sola instancia controla el elemento audio de toda la pagina
// asi si el usuario prueba varios sonidos seguidos nunca suenan dos a la vez
// cada tarjeta se suscribe como observador para saber cual esta sonando
export class AudioPlayer {
  // una unica intancia de reproductor de audio en todo momento
  // estatico y privado
  static #instancia = null;

  // construir instancia de reproductor
  constructor() {
    // si ya existe instancia, se retorna
    if (AudioPlayer.#instancia) {
      return AudioPlayer.#instancia;
    }

    // si no existe, nueva
    // elemento <audio> nativo del navegador (la API HTMLAudioElement)
    this.audio = new Audio();

    // idActual guarda que sonido esta sonando en este momento (o null si ninguno).
    this.idActual = null;

    // colección de funciones callback suscritas al reproductor
    // notificadas cuando el estado cambia
    this.observadores = new Set();

    /**
     * Estos son eventos nativos del elemento <audio>. Cuando el sonido termina solo (ended) o se pausa por cualquier motivo (pause), se avisa a todos los observadores que ya no hay nada sonando (null). Esto es importante porque cubre casos donde el sonido termina naturalmente sin que el usuario haga click de nuevo.
     */
    this.audio.addEventListener('ended', () => this.#notificarEstado(null));
    this.audio.addEventListener('pause', () => this.#notificarEstado(null));

    // finalmente se retorna la nueva instancia
    AudioPlayer.#instancia = this;
  }

  // suscribirse al observador
  suscribir(callback) {
    // suscribe
    this.observadores.add(callback);
    // retorna una funcion para desuscribir si fuese necesario
    return () => this.observadores.delete(callback);
  }

  // reproducir sonido
  // id card/sonido y url mapeada a reproducir
  reproducir(id, url) {
    // si toco el mismo que ya esta sonando, lo pauso en vez de reiniciarlo
    if (this.idActual === id && !this.audio.paused) {
      this.audio.pause();
      return;
    }

    this.audio.src = url;
    this.audio.play();
    this.#notificarEstado(id);
  }

  #notificarEstado(idReproduciendo) {
    this.idActual = idReproduciendo;
    for (const observador of this.observadores) {
      observador(idReproduciendo);
    }
  }
}
