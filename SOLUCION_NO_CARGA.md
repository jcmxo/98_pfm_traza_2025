# 🔧 Solución: Frontend No Carga

## 🔍 Diagnóstico

Si el frontend no carga en `http://localhost:8000`, verifica lo siguiente:

### 1. Verificar que el Proceso Esté Corriendo

**En la ventana de CMD donde ejecutaste el script:**
- ¿Ves mensajes de Next.js?
- ¿Aparece algún error en rojo?
- ¿Dice "Ready" o "Compiled"?

### 2. Verificar el Puerto

Abre PowerShell y ejecuta:
```powershell
netstat -ano | findstr :8000
```

Si no aparece nada, el proceso no está corriendo.

### 3. Reiniciar el Frontend

**Opción A: Desde la ventana de CMD actual**
1. Presiona `Ctrl+C` para detener el proceso
2. Ejecuta de nuevo: `npm run dev`

**Opción B: Cerrar y reiniciar**
1. Cierra la ventana de CMD
2. Ejecuta de nuevo: `EJECUTAR_FRONTEND.bat`

### 4. Verificar Errores de Compilación

Si ves errores en la consola:
- **Error de SWC**: Es normal, Next.js usará Babel
- **Error de módulos**: Ejecuta `npm install` en la carpeta frontend
- **Error de TypeScript**: Verifica que los archivos estén correctos

### 5. Verificar que Anvil Esté Corriendo

El frontend necesita que Anvil esté activo:
```bash
# Desde WSL
ps aux | grep anvil
```

Si no está corriendo:
```bash
anvil
```

### 6. Limpiar y Reinstalar

Si nada funciona, limpia e reinstala:

```powershell
cd C:\Users\jcmxo\98_pfm_traza_2025\frontend
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### 7. Verificar el Navegador

- ¿Qué error ves en el navegador?
- ¿Dice "No se puede conectar"?
- ¿Aparece una página en blanco?
- ¿Hay errores en la consola del navegador (F12)?

## 🚀 Solución Rápida

1. **Cierra todas las ventanas de CMD con Next.js**
2. **Abre PowerShell como Administrador**
3. **Ejecuta:**
   ```powershell
   cd C:\Users\jcmxo\98_pfm_traza_2025\frontend
   npm run dev
   ```
4. **Espera a ver:**
   ```
   ▲ Next.js 14.2.33
   - Local:        http://localhost:8000
   ✓ Ready in Xs
   ```
5. **Abre el navegador en:** `http://localhost:8000`

## ⚠️ Problemas Comunes

### Puerto en Uso
Si el puerto 8000 está ocupado:
```powershell
netstat -ano | findstr :8000
taskkill /PID [número] /F
```

### Firewall Bloqueando
Verifica que Windows Firewall permita Node.js

### Antivirus
Algunos antivirus bloquean Node.js. Agrega una excepción.

## 📞 Si Nada Funciona

Comparte:
1. El mensaje exacto que ves en la consola de CMD
2. El error que aparece en el navegador (F12 → Console)
3. Si el puerto 8000 está escuchando (netstat)

