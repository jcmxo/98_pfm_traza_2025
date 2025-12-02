# 🚀 Guía de Inicio Rápido

## Pasos Rápidos para Empezar

### 1. Instalar Dependencias

```bash
# Instalar dependencias de Foundry
cd contracts
forge install foundry-rs/forge-std

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 2. Iniciar Anvil (Blockchain Local)

En una terminal:
```bash
anvil
```

Anvil mostrará:
- Direcciones de cuentas de prueba
- Claves privadas
- URL: `http://localhost:8545`

### 3. Desplegar el Contrato

En otra terminal, desde `contracts/`:
```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Copia la dirección del contrato desplegado** (aparecerá en la salida)

### 4. Configurar Frontend

Crea `frontend/.env.local`:
```bash
cd frontend
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0xTU_DIRECCION_AQUI" > .env.local
```

### 5. Iniciar Frontend

```bash
npm run dev
```

Abre `http://localhost:3000` en tu navegador.

### 6. Configurar MetaMask

1. Abre MetaMask
2. Agrega red local:
   - Nombre: `Anvil Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Símbolo: `ETH`
3. Importa una cuenta usando una clave privada de Anvil

### 7. Ejecutar Tests

```bash
cd contracts
forge test
```

## ✅ Checklist de Verificación

- [ ] Anvil corriendo en puerto 8545
- [ ] Contrato desplegado
- [ ] `.env.local` configurado con dirección del contrato
- [ ] Frontend corriendo en puerto 3000
- [ ] MetaMask configurado con red local
- [ ] Tests pasando

## 🐛 Solución de Problemas

### Error: "Contract not deployed"
- Verifica que Anvil esté corriendo
- Verifica que el contrato se haya desplegado correctamente
- Verifica que `.env.local` tenga la dirección correcta

### Error: "User rejected request"
- Asegúrate de estar conectado a la red local en MetaMask
- Verifica que tengas ETH en la cuenta (Anvil da ETH gratis)

### Error: "Cannot read properties of undefined"
- Verifica que MetaMask esté instalado
- Refresca la página después de conectar MetaMask

## 📚 Próximos Pasos

1. Registra un usuario con un rol
2. (Como admin) Aprueba el usuario
3. Crea tokens según tu rol
4. Transfiere tokens siguiendo el flujo
5. Explora la trazabilidad

