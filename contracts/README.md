# Smart Contracts - Supply Chain Tracker

Este directorio contiene los smart contracts del proyecto Supply Chain Tracker.

## Estructura

```
contracts/
├── src/
│   └── SupplyChain.sol      # Contrato principal
├── test/
│   └── SupplyChain.t.sol     # Tests unitarios
├── script/
│   └── Deploy.s.sol          # Script de deploy
├── foundry.toml              # Configuración de Foundry
└── lib/                      # Dependencias (forge-std)
```

## Comandos Útiles

### Compilar
```bash
forge build
```

### Ejecutar Tests
```bash
forge test
```

### Ejecutar Tests con Trazas
```bash
forge test -vvv
```

### Deploy en Anvil
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Verificar Contrato
```bash
forge verify-contract <CONTRACT_ADDRESS> SupplyChain --chain-id 31337
```

## Funcionalidades del Contrato

### Gestión de Usuarios
- `registerUser()`: Registra un nuevo usuario con un rol
- `approveUser()`: Aprueba o rechaza un usuario (solo admin)
- `getUser()`: Obtiene información de un usuario

### Gestión de Tokens
- `createToken()`: Crea un nuevo token (materia prima o producto)
- `getToken()`: Obtiene información de un token
- `getUserTokens()`: Obtiene todos los tokens de un usuario

### Transferencias
- `createTransfer()`: Crea una solicitud de transferencia
- `acceptTransfer()`: Acepta una transferencia pendiente
- `rejectTransfer()`: Rechaza una transferencia pendiente
- `getPendingTransfers()`: Obtiene transferencias pendientes de un usuario

### Trazabilidad
- `getTokenTraceability()`: Obtiene la cadena completa de trazabilidad de un token

## Roles y Permisos

1. **Producer (Productor)**: Puede crear materias primas y transferir a Factory
2. **Factory (Fábrica)**: Puede recibir de Producer, crear productos y transferir a Retailer
3. **Retailer (Minorista)**: Puede recibir de Factory y transferir a Consumer
4. **Consumer (Consumidor)**: Solo puede recibir tokens
5. **Admin (Administrador)**: Puede aprobar/rechazar usuarios
