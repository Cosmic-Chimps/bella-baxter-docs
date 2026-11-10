# Qué hace revocar un dispositivo y cómo rotar sus claves

> 🌐 **English version**: [What revoking a device does, and rotating its keys](/features/device-revocation)

Revocar un [dispositivo registrado](/features/e2ee-zke#registered-devices) lo deja sin acceso. No hace
que la máquina olvide. Esta página explica qué hace la revocación, qué agrega rotar las claves del
dispositivo y qué no puede hacer ninguna de las dos.

---

## Qué hace la revocación

- **El acceso se detiene en la siguiente petición.** No hay ninguna caché que esperar. Un dispositivo
  revocado es rechazado en cuanto vuelve a preguntar.
- **El conocimiento no se detiene.** El dispositivo conserva las claves que recibió en lecturas
  anteriores. Con esas claves y una copia del texto cifrado almacenado (una copia de seguridad, acceso
  directo al almacén de secretos) puede abrir lo que ya tiene.

La revocación detiene el acceso, no el conocimiento.

---

## Qué hace rotar las claves

La rotación pone cada proyecto afectado en una **clave nueva** y **vuelve a sellar sus valores** con ella.
Cuando la ejecución termina, las claves que tiene el dispositivo no abren ningún valor actual de esos
proyectos, ni ninguno que se escriba después.

- **Se ofrece al revocar.** El diálogo de revocación de la consola y `bella auth devices revoke` muestran
  los proyectos para los que el dispositivo recibió claves y ofrecen "revocar y rotar". Revocar sin más
  sigue siendo posible.
- **O después.** Un dispositivo revocado se puede rotar en cualquier momento, también uno revocado antes
  de que esto existiera. Una rotación que no se ejecutó queda pendiente y figura en la lista hasta que
  alguien la ejecute.
- **Las lecturas siguen funcionando.** El resto del equipo sigue leyendo secretos mientras cambian las
  claves. El resellado se ejecuta en segundo plano y la página de dispositivos de la consola muestra su
  progreso.

Revocar nunca depende de rotar. Si la rotación no puede empezar, el dispositivo queda revocado igualmente.

---

## Qué no hace la rotación

::: warning Léalo antes de confiar en la rotación
- **El dispositivo conserva lo que ya leyó.** La rotación no hace que una máquina olvide un valor que ya
  vio. **Rote esos secretos** (la contraseña de la base de datos, el token de la API) en su origen.
- **Las versiones anteriores conservan su sellado original.** Las versiones antiguas de un secreto siguen
  selladas con la clave con la que se escribieron, así que la clave antigua todavía las abre. Si eso
  importa, destruya esas versiones.
- **Los registros de la organización no se rotan.** Las credenciales de proveedores, los secretos de
  webhooks y notificaciones, y los ajustes de flujos de auditoría y alertas siguen bajo la clave de la
  organización. Rotar esa clave es otro trabajo. Un dispositivo que leyó antes de que existieran las claves
  por entorno puede tener además la propia clave de la organización.
:::

Una ejecución que no pudo volver a sellar todo lo dice y nombra lo que dejó. Trátela como incompleta, no
como terminada.

---

## Qué proyectos se rotan

Los proyectos salen del **registro de accesos**: los proyectos para los que el dispositivo recibió claves.

Si alguno de ellos usaba la clave de la organización (no tenía una propia), se incluye también **cada
proyecto que usa esa clave**, porque una lectura de uno de ellos entregaba la propia clave de la
organización. A un proyecto sin clave propia se le da una.

La vista previa es **según el registro de accesos**. Lista lo que el registro muestra que el dispositivo
recibió, no lo que habría podido leer. Un registro que no se puede leer nunca se informa como "nada que
rotar". La rotación se rechaza hasta que se pueda leer.

Un dispositivo que nunca recibió una clave no tiene nada que rotar, y el diálogo lo dice.

---

## Quién puede ejecutar una rotación

- **Los propietarios y administradores de la organización** pueden rotar todos los proyectos afectados.
- **Los gestores de un proyecto** pueden rotar su propio proyecto. Ven la rotación pendiente en el
  proyecto, porque la página de dispositivos solo les muestra sus propios dispositivos.
- **Un miembro que revoca su propio dispositivo** puede no poder rotarlo. La revocación se hace igualmente
  y la rotación queda **pendiente** para las personas anteriores.

Quien no sea propietario ni administrador ve por su nombre los proyectos que leyó su dispositivo. Los
proyectos incluidos solo porque comparten la clave de la organización se le muestran como un número.

---

## Desde la CLI

```sh
bella auth devices revoke <dispositivo> --rotate
```

`<dispositivo>` es el id del dispositivo o su huella `SHA256:`. El comando muestra primero los proyectos,
revoca y después inicia la rotación. Sin `--rotate` lo pregunta, en un terminal. `--yes` omite todas las
preguntas y **no** implica `--rotate`.

Para rotar un dispositivo revocado antes, ejecute el mismo comando con `--rotate`. Revocar un dispositivo
ya revocado no es un error.

`-o json` imprime un único documento JSON con la vista previa y la ejecución, y nunca pregunta. Consulte la
[referencia de la CLI](/es/cli/).

---

## Véase también

- [Cifrado de conocimiento cero](/features/e2ee-zke)
- [Proyectos](/es/features/projects)
