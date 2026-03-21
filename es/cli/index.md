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
| `bella pull` | Escribir secretos en `.env` |
| `bella run -- <cmd>` | Ejecutar proceso con secretos inyectados |
| `bella exec -- <cmd>` | Similar a run (sin gestión de ciclo de vida) |
| `bella context use <project/env>` | Cambiar contexto activo |

[→ Ver referencia completa en inglés](/cli/)
