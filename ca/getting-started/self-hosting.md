# Autoallotjament (Self-Hosting)

Executa la teva pròpia instància de Bella Baxter a la teva infraestructura. Adreça-la
com funcioni la teva xarxa — un nom DNS amb el teu propi certificat, o (totalment
suportat, sense cap prerequisit) una IP o un nom d'`/etc/hosts`, sense DNS
públic i sense sortida a internet després de la descàrrega inicial d'imatges.

## El bundle self-hosted (recomanat)

L'autoallotjament està disponible sota petició: [contacta'ns](mailto:enterprise@cosmic-chimps.io)
i el configurem amb tu. Encara no hi ha cap descàrrega pública.

El bundle conté un `docker-compose.yaml` generat, una plantilla `.env.template`
i un únic script `bella.sh`. Es genera directament del model Aspire de la
plataforma, així que mai no pot divergir de la topologia real.

### Requisits

- Un host Linux amb Docker Engine + el plugin `docker compose`
- Credencials del registre de contenidors de Bella Baxter (te les donem en configurar la teva instància)
- Tres ports: `443` (aplicació), `8444` (pla d'administració), `9443` (setup)

### Instal·lació

Quan tinguis el bundle:

```sh
tar -xzf bella-selfhosted-<version>.tar.gz
cd bella-selfhosted-<version>
./bella.sh up
```

`up` arrenca el pla d'infraestructura (PostgreSQL, Redis, dos vaults
OpenBao, Keycloak) i l'**assistent de configuració**, i imprimeix la URL de
l'assistent i un token d'un sol ús.

L'assistent automatitza tot el que abans era un runbook manual:

1. **TLS** — porta el teu propi certificat (col·loca `server.crt`/`server.key` a
   `bella-config/pki/`; l'assistent el verifica i l'usa tal qual), o deixa
   que l'assistent emeti una CA interna i un certificat amb la teva IP/hostname
   al SAN — instal·les `ca.crt` una sola vegada a cada màquina client.
2. **Inicialització dels vaults** — inicialitza el vault de segellat (Shamir) i el
   principal (auto-unseal per transit), mostrant cada kit de recuperació
   **exactament una vegada**.
3. **Aprovisionament** — polítiques, AppRoles i credencials de servei,
   verificades amb un login real abans de continuar.
4. **Identitat** — el realm de Keycloak, els clients, els rols, el TOTP i el teu compte
   d'operador inicial.

Quan l'assistent acabi:

```sh
./bella.sh apply     # arrenca el pla d'aplicació
```

i obre `https://<la-teva-ip>`.

### Després d'un reinici del host

El vault de segellat es torna a segellar a cada reinici, per disseny. Obre la
URL de l'assistent, entra amb el token d'operacions i enganxa 2 de les teves 3 claus
d'unseal — el vault principal s'obre sol via transit i la plataforma es
recupera automàticament.

```sh
./bella.sh unseal    # imprimeix la URL + el token si els has perdut de vista
```

### Verificació de l'email en una instal·lació aïllada (air-gapped)

El bundle no envia correu: no hi ha cap servidor de correu que puguin fer servir Keycloak o
Bella. Això afecta una sola cosa. Una invitació a una organització només l'accepta un
compte l'adreça del qual Keycloak té com a **verificada** i que
coincideix amb l'adreça convidada, perquè ningú no pugui fer servir un enllaç
d'invitació filtrat. En un pla allotjat, la gent verifica la seva adreça amb un
enllaç que Keycloak li envia per correu. Aquí ningú no pot, així que la consola li
diu al convidat que l'**operador de la plataforma** (tu, no l'administrador
de l'organització, que no ho pot fer) ha de confirmar l'adreça.

Tens tres maneres de fer-ho:

1. **Crear tu el compte.** Un compte creat amb l'API d'operador
   (`POST /api/v1/admin/users`) es crea amb l'adreça ja verificada.
2. **Marcar com a verificada l'adreça d'un compte existent.** A la consola
   d'operador, obre **Users**, cerca el compte i tria **Mark email as
   verified**. Veus l'adreça de la qual respons, indiques un motiu i
   confirmes. Fes-ho només després de comprovar, fora de Bella, que qui té el
   compte controla aquesta adreça: el compte podrà acceptar invitacions a aquesta
   adreça a totes les organitzacions. El canvi queda al registre
   d'auditoria amb el teu motiu (mai l'adreça). Si la persona ha canviat la seva
   adreça mentrestant, la sol·licitud es rebutja i tornes a cercar.
3. **Fer servir un proveïdor d'identitat que operes tu.** Connecta el teu propi
   directori al realm de Keycloak com a operador de la plataforma. Les
   adreces que afirma es consideren de confiança. Les connexions d'inici de
   sessió únic que una organització afegeix pel seu compte a la consola no ho són:
   donen fe només dins d'aquesta organització.

Si algú canvia després la seva adreça per si mateix, Keycloak la torna a marcar
com a no verificada i cal confirmar-la de nou.

Com que no hi ha servidor de correu, el bundle **no** exigeix que les persones
verifiquin la seva adreça en registrar-se: això deixaria tothom fora, perquè
el correu de verificació mai no podria arribar. Si la teva instal·lació té un relay
de correu funcional per a Keycloak, defineix `KEYCLOAK_VERIFY_EMAIL=true` a
l'`.env` del bundle abans que l'assistent executi el seu pas de Keycloak, i el
realm de clients exigirà una adreça verificada en registrar-se. Deixa-ho sense
definir en cas contrari. El valor per defecte és `false`, i qualsevol valor
diferent de `true` o `false` atura l'assistent en arrencar.

## Opció 2: .NET Aspire (desenvolupament/integració)

Consumeix el recurs Aspire `AddBellaBaxter` publicat per incrustar un stack
de Bella Baxter al teu propi AppHost (veure `apps/sdk/dotnet/samples/05-aspire-selfhosted`).

## Opció 3: Kubernetes

Hi ha un chart de Helm planificat. Parla amb nosaltres si Kubernetes és un requisit dur.
