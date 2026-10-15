# El Guardián Errante · Crónicas de Pozo Alcón

RPG de espadas en pixel art. Siete años después del Colapso, el Guardián defiende su cortijo junto al río Guadalentín, a las afueras de Pozo Alcón (Jaén).

**Jugar:** abre la página de GitHub Pages de este repositorio en Safari (iPhone) o en cualquier navegador del PC.

## Instalar en el iPhone
1. Abre la web en **Safari**.
2. **Compartir → Añadir a pantalla de inicio**.
3. Ábrelo desde el icono y juega en horizontal. Después de la primera vez funciona sin conexión.

## Controles
| Móvil | PC | Acción |
|---|---|---|
| Joystick (mitad izquierda) | WASD / flechas | Moverse |
| Espada | Espacio / J | Combo de espada (mantén pulsado: Torbellino) |
| Rodar | Mayús / X | Esquivar |
| Hab. | H | Árbol de habilidades |
| Usar | E / Enter | Hablar, abrir, examinar |
| Orar | K | Curarse (25 de Fe) |
| Luz | L | Onda sagrada (nivel 3) |
| Hierba | Q | Comer hierbas (+30 vida) |
| Mapa / Menú | M / Esc | Mapa y pausa |

## Contenido de la carpeta
- `index.html` — el juego completo (un solo archivo).
- `manifest.webmanifest`, `sw.js`, `icono-*.png` — lo que lo hace instalable y que funcione sin conexión.
- `descargas/GuardianErrante.exe` — **app para PC (Windows)**. Abre el juego en su propia ventana, siempre con la última versión publicada aquí, y funciona sin conexión después de la primera vez. Usa Edge (que viene con Windows) o Chrome por debajo. La primera vez Windows puede avisar («Windows protegió su PC»): pulsa *Más información* → *Ejecutar de todas formas*.
- `descargas/ElGuardianErrante.jar` — versión Java antigua (ya no se actualiza).
- `codigo/web/` — código fuente de la versión web. Para regenerar el juego: `node build.js` crea `guardian.html`.
- `codigo/java/` — código fuente de la versión Java antigua.
- `codigo/lanzador/` — código del lanzador de Windows (Go).
- `docs/` — lore y misiones secundarias.

## Si cambias el juego
Sube el nuevo `index.html` y en `sw.js` sube el número de `guardian-v5` (a `guardian-v6`, y así sucesivamente), para que los móviles descarguen la versión nueva.
