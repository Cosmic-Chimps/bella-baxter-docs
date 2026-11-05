# Què fa revocar un dispositiu i com rotar-ne les claus

> 🌐 **Versió en anglès**: [What revoking a device does, and rotating its keys](/features/device-revocation)

Revocar un [dispositiu registrat](/features/e2ee-zke#registered-devices) el deixa sense accés. No fa que
la màquina oblidi. Aquesta pàgina explica què fa la revocació, què afegeix rotar les claus del dispositiu
i què no pot fer cap de les dues.

---

## Què fa la revocació

- **L'accés s'atura a la petició següent.** No hi ha cap memòria cau que esperar. Un dispositiu revocat és
  rebutjat tan bon punt torna a preguntar.
- **El coneixement no s'atura.** El dispositiu conserva les claus que va rebre en lectures anteriors. Amb
  aquestes claus i una còpia del text xifrat emmagatzemat (una còpia de seguretat, accés directe a
  l'emmagatzematge de secrets) pot obrir el que ja té.

La revocació atura l'accés, no el coneixement.

---

## Què fa rotar les claus

La rotació posa cada projecte afectat en una **clau nova** i **en torna a segellar els valors** amb
aquesta. Quan l'execució acaba, les claus que té el dispositiu no obren cap valor actual d'aquells
projectes, ni cap que s'escrigui després.

- **S'ofereix en revocar.** El diàleg de revocació de la consola i `bella auth devices revoke` mostren els
  projectes per als quals el dispositiu va rebre claus i ofereixen "revocar i rotar". Revocar sense més
  continua sent possible.
- **O més tard.** Un dispositiu revocat es pot rotar en qualsevol moment, també un revocat abans que això
  existís. Una rotació que no s'ha executat queda pendent i figura a la llista fins que algú l'executi.
- **Les lectures continuen funcionant.** La resta de l'equip continua llegint secrets mentre canvien les
  claus. El ressegellat s'executa en segon pla i la pàgina de dispositius de la consola en mostra el
  progrés.

Revocar no depèn mai de rotar. Si la rotació no pot començar, el dispositiu queda revocat igualment.

---

## Què no fa la rotació

::: warning Llegiu-ho abans de fiar-vos de la rotació
- **El dispositiu conserva el que ja va llegir.** La rotació no fa que una màquina oblidi un valor que ja
  ha vist. **Roteu aquests secrets** (la contrasenya de la base de dades, el token de l'API) al seu origen.
- **Les versions anteriors conserven el seu segellat original.** Les versions antigues d'un secret
  continuen segellades amb la clau amb què es van escriure, així que la clau antiga encara les obre. Si
  això importa, destruïu aquestes versions.
- **Els registres de l'organització no es roten.** Les credencials de proveïdors, els secrets de webhooks i
  notificacions, i els ajustos de fluxos d'auditoria i alertes continuen sota la clau de l'organització.
  Rotar aquesta clau és una altra feina. Un dispositiu que va llegir abans que existissin les claus per
  entorn pot tenir a més la clau mateixa de l'organització.
:::

Una execució que no ha pogut tornar a segellar-ho tot ho diu i anomena el que ha deixat. Tracteu-la com a
incompleta, no com a acabada.

---

## Quins projectes es roten

Els projectes surten del **registre d'accessos**: els projectes per als quals el dispositiu va rebre claus.

Si algun d'ells feia servir la clau de l'organització (no en tenia cap de pròpia), s'inclou també **cada
projecte que fa servir aquesta clau**, perquè una lectura d'un d'ells lliurava la clau mateixa de
l'organització. A un projecte sense clau pròpia se li'n dona una.

La vista prèvia és **segons el registre d'accessos**. Llista el que el registre mostra que el dispositiu va
rebre, no el que hauria pogut llegir. Un registre que no es pot llegir no s'informa mai com a "res a
rotar". La rotació es rebutja fins que es pugui llegir.

Un dispositiu que mai no ha rebut cap clau no té res a rotar, i el diàleg ho diu.

---

## Qui pot executar una rotació

- **Els propietaris i administradors de l'organització** poden rotar tots els projectes afectats.
- **Els gestors d'un projecte** poden rotar el seu propi projecte. Veuen la rotació pendent al projecte,
  perquè la pàgina de dispositius només els mostra els seus propis dispositius.
- **Un membre que revoca el seu propi dispositiu** pot no poder rotar-lo. La revocació es fa igualment i la
  rotació queda **pendent** per a les persones anteriors.

Qui no sigui propietari ni administrador veu pel seu nom els projectes que va llegir el seu dispositiu. Els
projectes inclosos només perquè comparteixen la clau de l'organització se li mostren com un nombre.

---

## Des de la CLI

```sh
bella auth devices revoke <dispositiu> --rotate
```

`<dispositiu>` és l'id del dispositiu o la seva empremta `SHA256:`. L'ordre mostra primer els projectes,
revoca i després inicia la rotació. Sense `--rotate` ho pregunta, en un terminal. `--yes` omet totes les
preguntes i **no** implica `--rotate`.

Per rotar un dispositiu revocat abans, executeu la mateixa ordre amb `--rotate`. Revocar un dispositiu ja
revocat no és un error.

`-o json` imprimeix un únic document JSON amb la vista prèvia i l'execució, i no pregunta mai. Consulteu la
[referència de la CLI](/ca/cli/).

---

## Vegeu també

- [Xifratge de coneixement zero](/features/e2ee-zke)
- [Projectes](/features/projects)
