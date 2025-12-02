# 🔗 Supply Chain Tracker - Proyecto de Desarrollo Blockchain

## 🎯 Objetivos del Proyecto

**Supply Chain Tracker** es un proyecto educativo donde desarrollarás desde cero una aplicación descentralizada (DApp) completa para gestionar trazabilidad en cadenas de suministro.

### 📚 Objetivos de Aprendizaje

1. **Desarrollo de Smart Contracts**: Programar contratos inteligentes en Solidity desde cero
2. **Testing Blockchain**: Escribir y hacer pasar tests unitarios con Foundry
3. **Aplicaciones Descentralizadas (DApps)**: Construir un frontend completo que interactúe con blockchain
4. **Gestión de Roles y Permisos**: Implementar un sistema de solicitud de roles y aprobación por administrador.
5. **Integración Web3**: Conectar aplicaciones web con MetaMask y Ethereum
6. **Desarrollo Full-Stack**: Combinar tecnologías frontend modernas con blockchain

### 🏗️ Objetivos Técnicos

Tu aplicación final debe implementar:

* **Sistema transparente y seguro** para rastrear productos desde origen hasta consumidor final
* **Tokenización** de materias primas y productos terminados
* **Flujo controlado** entre actores: Producer → Factory → Retailer → Consumer
* **Gestión de roles** con aprobación por administrador
* **Interfaz intuitiva** para todos los roles del sistema

## 🏭 Actores del Sistema

### 1. 👨‍🌾 **Producer (Productor)**
* **Función**: Registra materias primas en el sistema
* **Permisos**: Crear tokens de materias primas, transferir solo a Factory
* **Ejemplos**: Granjas, minas, productores agrícolas

### 2. 🏭 **Factory (Fábrica)**
* **Función**: Transforma materias primas en productos terminados
* **Permisos**: Recibir de Producer, crear productos derivados, transferir solo a Retailer
* **Ejemplos**: Plantas procesadoras, manufactureras

### 3. 🏪 **Retailer (Minorista)**
* **Función**: Distribuye productos a consumidores finales
* **Permisos**: Recibir de Factory, transferir solo a Consumer
* **Ejemplos**: Supermercados, tiendas, distribuidores

### 4. 🛒 **Consumer (Consumidor)**
* **Función**: Recibe productos finales
* **Permisos**: Solo recibir tokens, ver trazabilidad completa
* **Ejemplos**: Clientes finales, consumidores

### 5. 👑 **Admin (Administrador)**
* **Función**: Gestiona el sistema y aprueba solicitudes de roles
* **Permisos**: Aprobar/rechazar usuarios, ver todo el sistema

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm
- Foundry ([Instalación](https://book.getfoundry.sh/getting-started/installation))
- MetaMask (extensión del navegador)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/codecrypto-academy/98_pfm_traza_2025.git
cd 98_pfm_traza_2025
```

2. **Instalar dependencias de Foundry**
```bash
cd contracts
forge install foundry-rs/forge-std
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend
npm install
```

4. **Iniciar Anvil (blockchain local)**
En una terminal separada:
```bash
anvil
```
Esto iniciará una blockchain local en `http://localhost:8545`

5. **Desplegar contratos**
En otra terminal, desde el directorio `contracts`:
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
**Nota**: La clave privada mostrada es una de las cuentas predefinidas de Anvil.

6. **Configurar dirección del contrato en el frontend**
Después del deploy, copia la dirección del contrato desplegado y créa un archivo `.env.local` en el directorio `frontend`:
```bash
cd frontend
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x..." > .env.local
```
Reemplaza `0x...` con la dirección real del contrato desplegado.

7. **Iniciar frontend**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 🔧 Configuración de MetaMask

1. Abre MetaMask y agrega una red local:
   - Nombre: `Anvil Local`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `31337`
   - Símbolo: `ETH`

2. Importa una cuenta de prueba de Anvil usando una de las claves privadas que Anvil muestra al iniciar.

## 📁 Estructura del Proyecto

```
98_pfm_traza_2025/
├── contracts/          # Smart contracts (Foundry)
│   ├── src/
│   ├── test/
│   └── script/
├── frontend/           # Aplicación Next.js
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## 🧪 Testing

### Tests de Smart Contracts
```bash
cd contracts
forge test
```

Para ejecutar tests con más detalle:
```bash
forge test -vvv
```

### Tests del Frontend
```bash
cd frontend
npm test
```

## 📋 Flujo de Uso

1. **Conectar MetaMask**: En la página principal, haz clic en "Conectar MetaMask"
2. **Registrarse**: Si eres un nuevo usuario, ve a "Registrarse" y selecciona tu rol
3. **Aprobación Admin**: Un administrador debe aprobar tu solicitud
4. **Crear Tokens**: Una vez aprobado, puedes crear tokens según tu rol:
   - **Productor**: Crear materias primas
   - **Fábrica**: Crear productos a partir de materias primas
5. **Transferir Tokens**: Crea transferencias siguiendo el flujo:
   - Productor → Fábrica
   - Fábrica → Minorista
   - Minorista → Consumidor
6. **Aceptar Transferencias**: Los destinatarios pueden aceptar o rechazar transferencias pendientes
7. **Ver Trazabilidad**: Cualquier usuario puede ver la cadena completa de trazabilidad de un token

## 📝 Desarrollo

### Fase 1: Smart Contracts
- [x] Estructura básica del contrato
- [ ] Implementación completa de funciones
- [ ] Tests unitarios
- [ ] Deploy en Anvil

### Fase 2: Frontend
- [ ] Configuración Next.js
- [ ] Integración Web3
- [ ] Páginas principales
- [ ] Componentes UI

### Fase 3: Integración
- [ ] Conexión MetaMask
- [ ] Flujo completo de usuario
- [ ] Testing end-to-end

## 📚 Recursos

- [Solidity Docs](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [Ethers.js Docs](https://docs.ethers.org/)

## 🤝 Contribución

Este es un proyecto educativo. Sigue las mejores prácticas de desarrollo y documenta tu código.

## 📄 Licencia

Este proyecto es parte del curso de CodeCrypto.Academy

