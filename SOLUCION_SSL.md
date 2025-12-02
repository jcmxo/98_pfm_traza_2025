# 🔧 Solución: Error SSL en Firefox

## ❌ Problema

Firefox muestra el error:
```
SSL_ERROR_RX_RECORD_TOO_LONG
Conexión segura fallida
```

## 🔍 Causa

Firefox está intentando usar **HTTPS** (conexión segura) pero el servidor Next.js está corriendo en **HTTP** (sin SSL).

## ✅ Solución

### Opción 1: Usar HTTP explícitamente

**Asegúrate de escribir en la barra de direcciones:**
```
http://localhost:8000
```

**NO uses:**
```
https://localhost:8000  ❌
```

### Opción 2: Limpiar caché de Firefox

1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Caché"
3. Haz clic en "Limpiar ahora"
4. Intenta de nuevo con `http://localhost:8000`

### Opción 3: Modo privado

1. Abre una ventana privada (`Ctrl + Shift + P`)
2. Escribe: `http://localhost:8000`
3. Debería funcionar

### Opción 4: Verificar que el servidor esté corriendo

En la ventana de CMD donde ejecutaste el script, deberías ver:
```
▲ Next.js 14.2.33
- Local:        http://localhost:8000
✓ Ready in Xs
```

Si no ves "Ready", espera a que compile.

## 🎯 Pasos Correctos

1. **Verifica que el servidor esté corriendo:**
   - Deberías ver "Ready" en la ventana de CMD

2. **Abre Firefox**

3. **Escribe manualmente en la barra de direcciones:**
   ```
   http://localhost:8000
   ```
   (Asegúrate de que diga **http** y no **https**)

4. **Presiona Enter**

5. **Si Firefox redirige a HTTPS:**
   - Borra el caché (Ctrl + Shift + Delete)
   - O usa modo privado
   - O prueba con otro navegador (Chrome, Edge)

## 🌐 Alternativa: Usar otro navegador

Si Firefox sigue dando problemas:
- **Chrome/Edge**: `http://localhost:8000`
- **Brave**: `http://localhost:8000`

Todos deberían funcionar con HTTP.

## ⚠️ Nota Importante

El servidor de desarrollo de Next.js usa **HTTP** por defecto, no HTTPS. Esto es normal y seguro para desarrollo local.

