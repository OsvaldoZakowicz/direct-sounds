// notificador simple para feedback de acciones como copiar el link
// mantiene una sola responsabilidad mostrar y ocultar un mensaje temporal
export class ToastNotifier {
  constructor(elementoContenedor) {
    this.contenedor = elementoContenedor;
    this.temporizador = null;
  }

  mostrar(mensaje) {
    this.contenedor.textContent = mensaje;
    this.contenedor.classList.add('toast--visible');

    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.contenedor.classList.remove('toast--visible');
    }, 2200);
  }
}
