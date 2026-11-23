# Política de soporte

::: warning Marcador de posición
Esta página es un marcador de posición. Explica cómo se relaciona una clave de licencia con las versiones de una instalación auto-alojada, que es como funciona el producto. **Qué versiones reciben parches, y durante cuánto tiempo, es la política de soporte, y esa política todavía está por escribir.** No planifiques en torno a la sección marcada más abajo hasta que se complete.
:::

## Cómo se relaciona una clave de licencia con las versiones

Bella Baxter se publica en **líneas de versión**. Una línea es una versión menor: `1.1`, `1.2`, etcétera. Su primera publicación es `X.Y.0`, y las siguientes de la misma línea son parches: `X.Y.1`, `X.Y.2`.

Una clave de licencia para una instalación auto-alojada lleva una fecha, `upgrades_until`.

- Una clave cubre **toda línea cuya primera publicación (`X.Y.0`) es igual o anterior a esa fecha**. Una línea publicada por primera vez después de la fecha no está cubierta.
- Una línea cubierta sigue cubierta: cada parche de ella que publiquemos funciona con los módulos con licencia activados, sea cuando sea que se publique el parche.
- Una línea que la clave no cubre se instala y funciona igualmente, y todo el núcleo funciona. Solo los módulos con licencia (inicio de sesión único, envío de auditoría a un SIEM y rotación de certificados) funcionan como caducados en ella.
- Una clave renovada adelanta la fecha y cubre las líneas publicadas hasta ella.

Cada versión del bundle auto-alojado indica a qué línea pertenece y la fecha en que esa línea se publicó por primera vez, en un archivo llamado `RELEASE-LINE` dentro del bundle. `bella.sh` lo lee, junto con tu clave, y te avisa antes del arranque si tu clave no cubre la línea. Este aviso es informativo: no bloquea nada.

## Qué líneas reciben parches

Qué líneas reciben parches, y durante cuánto tiempo, es la política de soporte. Un parche para una línea antigua se genera desde la rama de mantenimiento de esa línea, de modo que una corrección de seguridad puede llegar a una línea que ya no es la más reciente.

## Por completar por Negocio

::: info Por completar por Negocio
Esta sección es la política en sí, y se deja vacía a propósito hasta que se decida:

- Cuántas líneas, o cuánto tiempo una línea, reciben parches de seguridad.
- Si alguna línea recibe correcciones que no son de seguridad, y durante cuánto tiempo.
- Qué puede esperar un cliente cuando una línea deja de tener soporte, y con cuánta antelación se anuncia.
- Cómo pide un cliente un parche de una línea que la política no cubre.
:::
