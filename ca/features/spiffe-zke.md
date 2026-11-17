# SPIFFE i dispositius registrats

> 🌐 **Versió en anglès**: [SPIFFE and registered devices](/features/spiffe-ec2#spiffe-and-registered-devices)

En una organització que [exigeix dispositius registrats](/features/e2ee-zke#zke-enforcement), una càrrega de treball que entra amb un SVID obté un lease que pot llegir **metadades i hashes**, i **no pot llegir els valors dels secrets**. És intencional.

**Què funciona**

- Atestar la càrrega de treball i rebre el seu SVID X.509 o JWT.
- Canviar el SVID per un lease.
- Llegir amb aquest lease les metadades i els hashes dels secrets, per exemple per saber si un secret ha canviat.

**Què no funciona**

- Llegir el valor d'un secret, o qualsevol resposta que el contingui. La petició es rebutja amb `403` i el codi de problema `zke-required`. Per a un lease de SPIFFE el missatge diu que pot llegir metadades i hashes però no valors; no demana executar `bella auth setup`, perquè una càrrega de treball no ho pot fer.

**Per què.** Quan s'exigeixen dispositius registrats, Bella lliura un valor només a qui té una clau de dispositiu registrada. Un lease s'emet a partir d'un SVID i no registra cap clau de dispositiu, així que no hi ha cap clau a la qual Bella pugui lliurar el valor.

**Què fer servir en lloc d'això.** Una càrrega de treball que necessiti valors ha de fer servir una credencial amb una clau de dispositiu registrada: una [API key](/features/api-keys) creada mentre s'exigeixen dispositius registrats, juntament amb la seva clau pública, o un inici de sessió [sense claus](/features/keyless#_3-tenants-that-require-registered-devices), que associa una clau de dispositiu a la clau que emet.

La pestanya SPIFFE de l'entorn, a la consola, mostra el mateix avís quan l'organització exigeix dispositius registrats.
