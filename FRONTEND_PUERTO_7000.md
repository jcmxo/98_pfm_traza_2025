# Frontend - Puerto 7000

## ✅ Configuración Completada

- ✅ `package.json` configurado para usar puerto 7000
- ✅ `.env.local` configurado con dirección del contrato
- ✅ `next.config.js` actualizado

## ⚠️ Problema Detectado

Next.js está intentando usar binarios de Windows (`@next/swc-win32-x64-msvc`) desde WSL, lo que causa un error de compatibilidad.

## 🔧 Solución Recomendada

### Opción 1: Ejecutar desde Windows (Recomendado)

Abre PowerShell o CMD en Windows y ejecuta:

```powershell
cd C:\Users\jcmxo\98_pfm_traza_2025\frontend
npm run dev
```

El frontend estará disponible en `http://localhost:7000`

### Opción 2: Reinstalar dependencias en WSL

Si prefieres usar WSL, reinstala las dependencias:

```bash
cd /mnt/c/Users/jcmxo/98_pfm_traza_2025/frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Opción 3: Usar una versión anterior de Next.js

Edita `package.json` y cambia:

```json
"next": "^13.5.0"
```

Luego:
```bash
npm install
npm run dev
```

## 📋 Estado Actual

- **Anvil**: ✅ Corriendo en `http://localhost:8545`
- **Contrato**: ✅ Desplegado en `0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB`
- **Frontend**: ⚠️ Necesita ejecutarse desde Windows o reinstalar dependencias

## 🚀 Comando Rápido (Windows)

```powershell
cd C:\Users\jcmxo\98_pfm_traza_2025\frontend
npm run dev
```

Luego abre: `http://localhost:7000`

