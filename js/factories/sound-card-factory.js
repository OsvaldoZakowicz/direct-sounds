// patron factory
// centraliza la construccion del markup de cada tarjeta de sonido
// si cambia el diseno de la tarjeta, se toca un solo lugar
export class SoundCardFactory {
  constructor({ audioPlayer, clipboardService, toastNotifier }) {
    this.audioPlayer = audioPlayer;
    this.clipboardService = clipboardService;
    this.toastNotifier = toastNotifier;
  }

  // metodo crear
  // recibe un sonido (item de sounds.js)
  crear(sonido) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'card';

    // id para cada data-id="" del article
    tarjeta.dataset.id = sonido.id;

    tarjeta.innerHTML = `
      <div class="card__info">
        <h3 class="card__nombre">${sonido.name}</h3>
        <p class="card__meta">${sonido.durationSeconds}s · fuente:
          <a href="${sonido.sourceUrl}" target="_blank" rel="noopener">${sonido.author}</a>
        </p>
      </div>
      <div class="card__acciones">
        <button type="button" class="btn btn--play" aria-label="reproducir ${sonido.name}">
          <span class="btn__ping" aria-hidden="true"></span>
          <i class="ti ti-player-play"></i>
        </button>
        <button type="button" class="btn btn--copy">
          <i class="ti ti-copy"></i>
          copiar link
        </button>
      </div>
    `;

    const botonPlay = tarjeta.querySelector('.btn--play');
    const botonCopiar = tarjeta.querySelector('.btn--copy');
    const icono = botonPlay.querySelector('i');

    botonPlay.addEventListener('click', () => {
      this.audioPlayer.reproducir(sonido.id, sonido.publicUrl);
    });

    botonCopiar.addEventListener('click', async () => {
      const copiado = await this.clipboardService.copiar(sonido.publicUrl);
      this.toastNotifier.mostrar(
        copiado ? 'link copiado' : 'no se pudo copiar, copialo manualmente',
      );
    });

    // esta tarjeta se suscribe como observador del reproductor singleton
    // asi cada tarjeta refleja su propio estado sin pisar a las demas
    this.audioPlayer.suscribir((idReproduciendo) => {
      const estaSonando = idReproduciendo === sonido.id;
      tarjeta.classList.toggle('card--sonando', estaSonando);
      icono.className = estaSonando
        ? 'ti ti-player-pause'
        : 'ti ti-player-play';
    });

    return tarjeta;
  }
}
