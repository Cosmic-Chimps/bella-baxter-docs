# SPIFFE y cifrado de conocimiento cero

> 🌐 **English version**: [SPIFFE and zero-knowledge encryption](/features/spiffe-ec2#spiffe-and-zero-knowledge-encryption)

En una organización que [exige el cifrado de conocimiento cero (ZKE)](/features/e2ee-zke#zke-enforcement), una carga de trabajo que entra con un SVID obtiene un lease que puede leer **metadatos y hashes**, y **no puede leer los valores de los secretos**. Es intencional.

**Qué funciona**

- Atestar la carga de trabajo y recibir su SVID X.509 o JWT.
- Cambiar el SVID por un lease.
- Leer con ese lease los metadatos y los hashes de los secretos, por ejemplo para saber si un secreto cambió.

**Qué no funciona**

- Leer el valor de un secreto, o cualquier respuesta que lo contenga. La petición se rechaza con `403` y el código de problema `zke-required`. Para un lease de SPIFFE el mensaje dice que puede leer metadatos y hashes pero no valores; no pide ejecutar `bella auth setup`, porque una carga de trabajo no puede hacerlo.

**Por qué.** La exigencia entrega un valor solo a quien tiene una clave de dispositivo registrada. Un lease se emite a partir de un SVID y no registra ninguna clave de dispositivo, así que no hay clave a la que Bella pueda entregarle el valor.

**Qué usar en su lugar.** Una carga de trabajo que necesite valores debe usar una credencial con una clave de dispositivo registrada: una [API key](/es/features/api-keys) creada bajo exigencia junto con su clave pública, o un inicio de sesión [sin claves](/features/keyless#_3-tenants-that-require-registered-devices), que asocia una clave de dispositivo a la clave que emite.

La pestaña SPIFFE del entorno, en la consola, muestra el mismo aviso cuando la organización exige ZKE.
