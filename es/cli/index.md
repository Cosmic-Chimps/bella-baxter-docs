# Referencia CLI

> 🌐 **English version**: [CLI Reference](/cli/)

La traducción completa de la referencia CLI está en progreso. Mientras tanto, consulta la versión en inglés.

La CLI de Bella Baxter proporciona todos los comandos necesarios para gestionar secretos, proyectos, entornos y más desde tu terminal.

## Instalación

```sh
curl -sSL https://install.bella-baxter.io | sh
```

## Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `bella login` | Iniciar sesión |
| `bella whoami` | Ver usuario y org activa |
| `bella org current` | Ver org activa |
| `bella org list` | Listar todas tus organizaciones |
| `bella org switch <slug>` | Cambiar de organización |
| `bella pull` | Escribir secretos en `.env` |
| `bella run -- <cmd>` | Ejecutar proceso con secretos inyectados |
| `bella exec -- <cmd>` | Similar a run (sin gestión de ciclo de vida) |
| `bella context use <project/env>` | Cambiar contexto activo |

## Organizaciones (Multi-Org)

Si perteneces a más de una organización, puedes cambiar entre ellas sin cerrar sesión:

```sh
bella org list               # listar organizaciones
bella org switch acme-corp   # cambiar a otra org
```

Después de cambiar, ejecuta `bella context init` para actualizar tu archivo `.bella` con el nuevo contexto de org.

[→ Ver referencia completa en inglés](/cli/)
