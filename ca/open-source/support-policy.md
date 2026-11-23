# Política de suport

::: warning Marcador de posició
Aquesta pàgina és un marcador de posició. Explica com es relaciona una clau de llicència amb les versions d'una instal·lació autoallotjada, que és com funciona el producte. **Quines versions reben pedaços, i durant quant de temps, és la política de suport, i aquesta política encara està per escriure.** No planifiquis al voltant de la secció marcada més avall fins que es completi.
:::

## Com es relaciona una clau de llicència amb les versions

Bella Baxter es publica en **línies de versió**. Una línia és una versió menor: `1.1`, `1.2`, etcètera. La seva primera publicació és `X.Y.0`, i les següents de la mateixa línia són pedaços: `X.Y.1`, `X.Y.2`.

Una clau de llicència per a una instal·lació autoallotjada porta una data, `upgrades_until`.

- Una clau cobreix **tota línia la primera publicació (`X.Y.0`) de la qual és igual o anterior a aquesta data**. Una línia publicada per primera vegada després de la data no està coberta.
- Una línia coberta continua coberta: cada pedaç seu que publiquem funciona amb els mòduls amb llicència activats, tant se val quan es publiqui el pedaç.
- Una línia que la clau no cobreix s'instal·la i funciona igualment, i tot el nucli funciona. Només els mòduls amb llicència (inici de sessió únic, enviament d'auditoria a un SIEM i rotació de certificats) hi funcionen com a caducats.
- Una clau renovada avança la data i cobreix les línies publicades fins a ella.

Cada versió del bundle autoallotjat indica a quina línia pertany i la data en què aquesta línia es va publicar per primera vegada, en un fitxer anomenat `RELEASE-LINE` dins del bundle. `bella.sh` el llegeix, juntament amb la teva clau, i t'avisa abans de l'arrencada si la teva clau no cobreix la línia. Aquest avís és informatiu: no bloqueja res.

## Quines línies reben pedaços

Quines línies reben pedaços, i durant quant de temps, és la política de suport. Un pedaç per a una línia antiga es genera des de la branca de manteniment d'aquella línia, de manera que una correcció de seguretat pot arribar a una línia que ja no és la més recent.

## Per completar per Negoci

::: info Per completar per Negoci
Aquesta secció és la política en si, i es deixa buida a propòsit fins que es decideixi:

- Quantes línies, o quant de temps una línia, reben pedaços de seguretat.
- Si alguna línia rep correccions que no són de seguretat, i durant quant de temps.
- Què pot esperar un client quan una línia deixa de tenir suport, i amb quanta antelació s'anuncia.
- Com demana un client un pedaç d'una línia que la política no cobreix.
:::
