import { SoundRepository } from './services/sound-repository.js';
import { AudioPlayer } from './services/audio-player.js';
import { ClipboardService } from './services/clipboard-service.js';
import { ToastNotifier } from './services/toast-notifier.js';
import { SoundCardFactory } from './factories/sound-card-factory.js';

// reemplazar por la url real del proyecto de supabase
const SUPABASE_BASE_URL = 'https://zqywfkwcxedhmzqudiph.supabase.co';

function iniciar() {
  // acceso a sonidos, retorna con url de reproduccion
  const repositorio = new SoundRepository(SUPABASE_BASE_URL);
  // reproductor de sonidos nativo del navegador
  const audioPlayer = new AudioPlayer();

  const clipboardService = new ClipboardService();
  const toastNotifier = new ToastNotifier(document.querySelector('#toast'));

  // fabrica de cards
  const factory = new SoundCardFactory({
    audioPlayer,
    clipboardService,
    toastNotifier,
  });

  const contenedorGrid = document.querySelector('#grid-sonidos');

  // obtener todos mapea la url de reproduccion para cada sonido
  const sonidos = repositorio.obtenerTodos();

  // usando document fragment creamos un card de sonido
  // por cada sonido a mostrar
  const fragmento = document.createDocumentFragment();
  for (const sonido of sonidos) {
    fragmento.appendChild(factory.crear(sonido));
  }

  // agregamos al grid todas las cards de sonido a la vez
  contenedorGrid.appendChild(fragmento);
}

// cuando el DOM cargo, iniciar app
document.addEventListener('DOMContentLoaded', iniciar);
