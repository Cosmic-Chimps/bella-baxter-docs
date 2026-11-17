# Gestiona les aplicacions connectades

> 🌐 **Versió en anglès**: [Manage connected apps](/features/connected-apps-manage)

Una aplicació connectada és una aplicació de tercers a la qual deixes llegir els secrets d'un entorn. Aquesta pàgina és per a dos lectors: una persona a qui una aplicació ha demanat connectar-se, i un propietari o administrador d'una organització. Si construeixes aplicacions, llegeix [Connecta amb Bella Baxter](/ca/features/connected-apps).

## Què pot fer i què no pot fer una aplicació connectada

- **Pot llegir.** Pot llegir els valors dels secrets de l'únic entorn que triïs.
- **No pot canviar res.** No pot crear, canviar ni eliminar un secret.
- **Veu un sol entorn.** Pots acotar-ho encara més a una etiqueta d'àmbit. Una etiqueta d'àmbit és una etiqueta que porta un secret. Amb una etiqueta d'àmbit, l'aplicació veu només els secrets que porten aquesta etiqueta.
- **Mai no rep una API key.** Llegeix a través d'una connexió que pots revocar en qualsevol moment.

## Aprova o rebutja una connexió

Una aplicació inicia una connexió enviant-te a una pàgina de Bella amb el títol **Connecta amb Bella Baxter**. Has d'haver iniciat la sessió a Bella. No es comparteix res fins que tries **Permet**.

### Comprova l'aplicació abans de permetre-la

La pàgina mostra tres dades de l'aplicació:

- **El nom de l'aplicació.**
- **El domini al qual pertany.** Bella ha comprovat que qui desenvolupa l'aplicació controla aquest domini.
- **L'organització que ha registrat l'aplicació.**

Llegeix el domini, no només el nom. Un nom és només text que ha triat el desenvolupador. El domini és el que Bella ha verificat. Si el domini no és el que esperes, tria **Rebutja**.

### Tria què compartir

1. **Organització.** Tria l'organització. Només veus les organitzacions a les quals pertanys.
2. **Projecte.** Tria el projecte.
3. **Entorn.** Tria l'entorn. Només apareixen els entorns que pots llegir.
4. **Etiqueta d'àmbit (opcional).** Escriu una etiqueta per limitar l'aplicació als secrets que la porten. Deixa-la buida per compartir tots els secrets de l'entorn. Fes servir només lletres minúscules, dígits, guionets i guions baixos.
5. **L'accés dura.** Tria quant de temps pot llegir l'aplicació. Passat aquest termini l'aplicació ja no pot llegir. Encara el pots revocar abans. Les opcions són:
   - **Fins que el revoqui**
   - **30 dies**
   - **90 dies**
   - **1 any**
6. Tria **Permet** per connectar l'aplicació, o **Rebutja** per denegar-la.

Si tries **Rebutja**, o tanques la pàgina, no es comparteix res. Després Bella torna el teu navegador a l'aplicació.

### Quan una organització apareix atenuada

Una organització pot aparèixer atenuada, amb un motiu. No la pots triar. Els motius són:

- **Les aplicacions connectades estan desactivades.** Un propietari o administrador ha desactivat les aplicacions connectades en aquella organització.
- **S'exigeixen dispositius registrats.** L'organització exigeix dispositius registrats i una aplicació connectada no en té cap, de manera que les aplicacions no en poden llegir els secrets.
- **L'organització no està activa.**

Si cap organització no està disponible, o cap no té un entorn que puguis llegir, la pàgina diu que no hi ha cap entorn que puguis compartir. Des d'aquesta pàgina no es pot connectar res.

### Missatges de la pàgina d'aprovació

- **"Aquest enllaç ha vençut, ja s'ha fet servir o pertany a una altra persona. Torna a començar des de l'aplicació."** L'enllaç funciona una sola vegada, dura 10 minuts i és per a la persona que havia iniciat la sessió a l'aplicació. Torna a l'aplicació i comença de nou.
- **"Aquesta aplicació no pot acceptar connexions noves en aquest moment. Consulta-ho amb qui la desenvolupa."** L'aplicació no està aprovada (per exemple, està suspesa), o Bella ja no pot verificar el domini del seu desenvolupador. Consulta-ho amb qui la desenvolupa.
- **"No s'ha compartit res. Torna a començar des de l'aplicació."** La pàgina ha acabat sense una connexió. Torna a començar des de l'aplicació.

## Veu i revoca les teves connexions

Obre **El meu perfil** i després la pestanya **Aplicacions connectades**. La pestanya llista totes les connexions que has fet, a totes les teves organitzacions.

| Columna | Què mostra |
|---|---|
| **Aplicació** | El nom de l'aplicació, el seu domini i l'organització que l'ha registrada |
| **Organització** | L'organització de la qual llegeix la connexió |
| **Projecte / entorn** | El que llegeix l'aplicació, amb l'etiqueta d'àmbit si n'hi ha una |
| **Connectada** | La data en què l'has connectada |
| **Últim ús** | Quan ha llegit l'aplicació per última vegada, o **Mai** |
| **Venç** | La data de venciment, o **Sense venciment** |
| **Estat** | **Activa**, **Aturada** o **Revocada** |

Una connexió té un de tres estats:

- **Activa.** L'aplicació pot llegir ara.
- **Aturada.** La connexió existeix, però Bella rebutja per ara les lectures de l'aplicació. La fila diu per què. Una connexió aturada pot tornar a atendre lectures quan acabi la seva causa. Els motius són:
  - L'operador de la plataforma ha suspès l'aplicació.
  - L'organització ara exigeix dispositius registrats.
  - Les aplicacions connectades estan desactivades a l'organització.
  - La persona que l'ha connectada està suspesa.
  - La connexió ha vençut.
  - L'organització està suspesa.
  - La persona que l'ha connectada ja no pot llegir aquest entorn.
  - L'entorn ja no està disponible.
- **Revocada.** La connexió s'ha acabat. La fila diu qui l'ha acabada i quan. Una connexió revocada es queda a la llista 30 dies, perquè vegis el que s'ha tallat. No pot tornar a atendre lectures.

Per revocar una connexió, tria el botó de revocar al final de la seva fila i confirma amb **Revoca**. Una revocació té efecte en la propera lectura de l'aplicació. Per tornar-la a connectar, l'aplicació ho ha de tornar a demanar i una persona ho ha d'aprovar.

## Per a propietaris i administradors

Obre **Configuració** i després la pestanya **Aplicacions connectades**. Només un propietari o administrador de l'organització pot fer servir aquesta pestanya.

### L'interruptor

L'interruptor **Permet aplicacions connectades en aquesta organització** està activat per defecte.

- **Mentre està desactivat,** ningú no pot connectar una aplicació i es rebutja tota lectura per una connexió existent.
- **Quan el tornes a activar,** les connexions existents es reprenen sense demanar permís de nou.

### Totes les connexions de l'organització

Sota l'interruptor, la pestanya llista totes les connexions que han fet els membres de l'organització. Té les mateixes columnes que la llista personal, amb **Connectada per** en lloc d'**Organització**. Veus qui ha connectat cada aplicació. Pots revocar qualsevol connexió, també quan l'interruptor està desactivat. La fila mostra llavors "Revocada per un administrador de l'organització".

### Quan un membre és eliminat, se'n va o és suspès

- **Un membre és eliminat, o se'n va de l'organització.** Bella revoca totes les connexions que ha fet aquest membre.
- **Un membre és suspès.** Bella rebutja les lectures per les seves connexions mentre duri la suspensió. Les connexions apareixen com a **Aturada**, amb el motiu "La persona que l'ha connectada està suspesa". No es revoca res, així que les connexions tornen a funcionar quan es restaura el membre.

## Organitzacions que exigeixen dispositius registrats

Una organització que exigeix dispositius registrats no pot acceptar aplicacions connectades. Una aplicació connectada no té dispositiu registrat, així que no pot llegir secrets que només pot llegir un dispositiu registrat. Els membres no poden connectar una aplicació a aquella organització, i les seves connexions existents apareixen com a **Aturada**.

## Qui paga

Paga el propietari de l'aplicació per cada lectura. Les lectures compten contra la quota d'API de l'organització que ha registrat l'aplicació. Mai no compten contra tu, contra la teva organització, contra la teva assignació ni contra les teves API keys.

## Al log d'auditoria

Cada lectura d'una aplicació connectada és una fila al log d'auditoria de la teva organització. L'actor apareix com a `aplicació: <nom de l'aplicació>`, amb `Connectada per <persona>` a sota. L'acció és `export_all`, igual que quan una persona llegeix tots els secrets d'un entorn.

Una lectura que Bella rebutja, a través d'una connexió que existeix, apareix com a **Lectura d'aplicació connectada rebutjada**. El detall de la fila diu per què.

Aquests esdeveniments no escriuen una fila d'auditoria avui:

- Connectar una aplicació.
- Revocar una connexió.
- Activar o desactivar les aplicacions connectades a l'organització.
- Registrar o canviar una aplicació de desenvolupador.

Si un control teu depèn d'evidència d'aquests esdeveniments, guarda-la fora de Bella per ara. Consulta [Logs d'auditoria](/ca/audit/) per veure els camps d'una fila.

## Vegeu també

- [Connecta amb Bella Baxter](/ca/features/connected-apps), per a desenvolupadors
- [Logs d'auditoria](/ca/audit/)
- [Membres de l'equip](/features/team-members)
