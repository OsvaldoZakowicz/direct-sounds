// patron adapter
// unifica dos formas distintas de copiar texto detras de una sola interfaz
// asi el resto de la app llama siempre a copiar sin saber cual metodo se uso
export class ClipboardService {
  async copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      // copiar al portapapeles de forma moderna
      await navigator.clipboard.writeText(texto);
      return true;
    }

    return this.#copiarConFallback(texto);
  }

  /**
   * Método de respaldo para copiar texto al portapapeles utilizando
   * `document.execCommand('copy')` cuando la API `navigator.clipboard`
   * no está disponible o falla.
   *
   * @private
   * @param {string} texto - Texto que se copiará al portapapeles.
   * @returns {boolean} `true` si la copia fue exitosa; de lo contrario, `false`.
   */
  #copiarConFallback(texto) {
    const input = document.createElement('textarea');
    input.value = texto;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();

    let resultado = false;
    try {
      resultado = document.execCommand('copy');
    } catch {
      resultado = false;
    }

    document.body.removeChild(input);
    return resultado;
  }
}
