# 🧪 Guía Completa de Pruebas - Supply Chain Tracker

## 📋 Índice

1. [Pruebas del Smart Contract](#1-pruebas-del-smart-contract)
2. [Pruebas del Frontend](#2-pruebas-del-frontend)
3. [Pruebas End-to-End](#3-pruebas-end-to-end)
4. [Flujo Completo de Usuario](#4-flujo-completo-de-usuario)

---

## 1. Pruebas del Smart Contract

### ✅ Ejecutar Tests Unitarios

```bash
cd contracts
forge test
```

### 📊 Ver Tests con Más Detalle

```bash
# Verbosidad normal
forge test -v

# Verbosidad alta (muestra logs)
forge test -vv

# Verbosidad muy alta (muestra trazas)
forge test -vvv
```

### 🔍 Ejecutar un Test Específico

```bash
forge test --match-test test_CreateRawMaterial -vv
```

### 📈 Ver Cobertura de Gas

```bash
forge test --gas-report
```

---

## 2. Pruebas del Frontend

### 🚀 Iniciar el Frontend

**Desde Windows (PowerShell/CMD):**
```powershell
cd C:\Users\jcmxo\98_pfm_traza_2025\frontend
npm run dev
```

El frontend estará disponible en: `http://localhost:8000`

### 🔧 Configuración de MetaMask

#### Paso 1: Agregar Red Local

1. Abre MetaMask
2. Haz clic en el menú de redes (arriba a la izquierda)
3. Selecciona "Add Network" → "Add a network manually"
4. Completa los siguientes datos:
   - **Network Name**: `Anvil Local`
   - **RPC URL**: `http://localhost:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
   - **Block Explorer URL**: (dejar vacío)

#### Paso 2: Importar Cuenta de Prueba

1. En MetaMask, haz clic en el icono de cuenta (arriba a la derecha)
2. Selecciona "Import Account"
3. Usa una de estas claves privadas de Anvil:

**Cuenta Admin (Recomendada):**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Otras cuentas de prueba:**
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

4. La cuenta se importará con ETH gratis (Anvil da 10,000 ETH a cada cuenta)

---

## 3. Pruebas End-to-End

### 🎯 Escenario 1: Flujo Completo Producer → Factory → Retailer → Consumer

#### Paso 1: Configurar Cuentas

Necesitarás 4 cuentas en MetaMask (o 4 navegadores con perfiles diferentes):

1. **Producer** (Admin): `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
2. **Factory**: Importa otra cuenta de Anvil
3. **Retailer**: Importa otra cuenta de Anvil
4. **Consumer**: Importa otra cuenta de Anvil

#### Paso 2: Registrar Usuarios

1. **Como Producer (Admin)**:
   - Abre `http://localhost:8000`
   - Conecta MetaMask con la cuenta admin
   - Ya estás registrado como Admin ✅

2. **Como Factory**:
   - Abre `http://localhost:8000` en otra ventana/perfil
   - Conecta MetaMask con cuenta Factory
   - Ve a "Registrarse"
   - Selecciona rol: **Fábrica**
   - Nombre: "Fábrica de Pan S.A."
   - Envía la transacción

3. **Como Retailer**:
   - Similar al paso anterior
   - Rol: **Minorista**
   - Nombre: "Supermercado Central"

4. **Como Consumer**:
   - Similar al paso anterior
   - Rol: **Consumidor**
   - Nombre: "Juan Pérez"

#### Paso 3: Aprobar Usuarios (Como Admin)

1. Conecta con la cuenta Admin
2. Ve a `/admin`
3. Verás los usuarios pendientes
4. Aprueba Factory, Retailer y Consumer

#### Paso 4: Crear Materia Prima (Como Producer)

1. Conecta con cuenta Producer
2. Ve a `/tokens/create`
3. Completa el formulario:
   - Tipo: **Materia Prima**
   - Nombre: "Trigo Orgánico"
   - Descripción: "Trigo cultivado sin pesticidas"
   - Metadatos: `{"origen": "España", "certificacion": "Orgánico"}`
4. Envía la transacción
5. Verás el token creado en `/tokens`

#### Paso 5: Transferir a Factory (Como Producer)

1. Ve a `/tokens` y haz clic en el token creado
2. Haz clic en "Transferir"
3. Ingresa la dirección de la cuenta Factory
4. Mensaje: "Transferencia de materia prima para procesamiento"
5. Envía la transacción

#### Paso 6: Aceptar Transferencia (Como Factory)

1. Conecta con cuenta Factory
2. Ve a `/transfers`
3. Verás la transferencia pendiente
4. Haz clic en "Aceptar"
5. Confirma la transacción
6. El token ahora aparece en `/tokens` de Factory

#### Paso 7: Crear Producto (Como Factory)

1. Conecta con cuenta Factory
2. Ve a `/tokens/create`
3. Completa el formulario:
   - Tipo: **Producto**
   - Tokens Padre: Selecciona el token de trigo
   - Nombre: "Pan Integral"
   - Descripción: "Pan hecho con trigo orgánico"
   - Metadatos: `{"proceso": "Horneado", "peso": "500g"}`
4. Envía la transacción
5. Verás el nuevo producto en `/tokens`

#### Paso 8: Transferir a Retailer (Como Factory)

1. Ve al producto creado
2. Haz clic en "Transferir"
3. Ingresa la dirección de Retailer
4. Envía la transacción

#### Paso 9: Aceptar y Transferir a Consumer (Como Retailer)

1. Conecta con cuenta Retailer
2. Ve a `/transfers` y acepta la transferencia
3. Ve al producto en `/tokens`
4. Transfiere a Consumer

#### Paso 10: Aceptar como Consumer y Ver Trazabilidad

1. Conecta con cuenta Consumer
2. Ve a `/transfers` y acepta la transferencia
3. Ve al producto en `/tokens/[id]`
4. **Verifica la trazabilidad completa**: Deberías ver la cadena completa desde el trigo hasta el pan

---

## 4. Flujo Completo de Usuario

### 🧑‍🌾 Como Producer

1. ✅ Conectar MetaMask
2. ✅ Ya estás registrado como Admin
3. ✅ Crear materia prima
4. ✅ Transferir a Factory
5. ✅ Ver tus tokens en `/tokens`

### 🏭 Como Factory

1. ✅ Conectar MetaMask
2. ✅ Registrarse como Factory
3. ✅ Esperar aprobación del Admin
4. ✅ Aceptar transferencias de Producer
5. ✅ Crear productos a partir de materias primas
6. ✅ Transferir productos a Retailer

### 🏪 Como Retailer

1. ✅ Conectar MetaMask
2. ✅ Registrarse como Retailer
3. ✅ Esperar aprobación del Admin
4. ✅ Aceptar transferencias de Factory
5. ✅ Transferir productos a Consumer

### 🛒 Como Consumer

1. ✅ Conectar MetaMask
2. ✅ Registrarse como Consumer
3. ✅ Esperar aprobación del Admin
4. ✅ Aceptar transferencias de Retailer
5. ✅ Ver trazabilidad completa de productos

### 👑 Como Admin

1. ✅ Conectar MetaMask
2. ✅ Ya estás registrado automáticamente
3. ✅ Ver usuarios pendientes en `/admin`
4. ✅ Aprobar/rechazar usuarios
5. ✅ Acceso completo al sistema

---

## 🔍 Verificaciones Importantes

### ✅ Verificar que el Contrato Está Desplegado

```bash
# Verificar que Anvil está corriendo
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### ✅ Verificar Dirección del Contrato

El contrato está desplegado en:
```
0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB
```

Verifica que `frontend/.env.local` tenga:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB
```

### ✅ Verificar Conexión MetaMask

1. Abre la consola del navegador (F12)
2. Deberías ver logs de conexión
3. Verifica que `window.ethereum` esté disponible

---

## 🐛 Solución de Problemas

### Problema: "No se puede conectar al servidor"

**Solución:**
- Verifica que Anvil esté corriendo: `ps aux | grep anvil`
- Verifica que el frontend esté corriendo: `curl http://localhost:8000`

### Problema: "User rejected request"

**Solución:**
- Asegúrate de estar en la red local de Anvil
- Verifica que tengas ETH (Anvil da ETH gratis)

### Problema: "Contract not deployed"

**Solución:**
- Verifica la dirección en `.env.local`
- Re-despliega el contrato si es necesario

### Problema: "Only admin can perform this action"

**Solución:**
- Asegúrate de estar conectado con la cuenta admin
- Verifica que el usuario esté aprobado

---

## 📝 Checklist de Pruebas

### Smart Contract
- [ ] Todos los tests pasan (`forge test`)
- [ ] Contrato compila sin errores
- [ ] Contrato desplegado en Anvil

### Frontend
- [ ] Frontend inicia en puerto 8000
- [ ] MetaMask se conecta correctamente
- [ ] Página principal carga
- [ ] Dashboard muestra información del usuario

### Funcionalidades
- [ ] Registro de usuarios funciona
- [ ] Aprobación de usuarios funciona (admin)
- [ ] Creación de tokens funciona
- [ ] Transferencias funcionan
- [ ] Aceptar/rechazar transferencias funciona
- [ ] Trazabilidad se muestra correctamente

### Flujo Completo
- [ ] Producer → Factory funciona
- [ ] Factory → Retailer funciona
- [ ] Retailer → Consumer funciona
- [ ] Trazabilidad completa se muestra

---

## 🎉 ¡Listo para Probar!

Sigue los pasos anteriores y verifica que todo funcione correctamente. Si encuentras algún problema, consulta la sección de "Solución de Problemas" o revisa los logs.

**¡Buena suerte con las pruebas!** 🚀

