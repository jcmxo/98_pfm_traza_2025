# Frontend - Supply Chain Tracker

Aplicación Next.js con TypeScript para interactuar con el contrato SupplyChain.

## Estructura

```
frontend/
├── app/                    # Páginas de Next.js (App Router)
│   ├── page.tsx           # Página principal
│   ├── dashboard/         # Dashboard del usuario
│   ├── register/          # Registro de usuarios
│   ├── tokens/            # Gestión de tokens
│   ├── transfers/         # Transferencias pendientes
│   └── admin/             # Panel de administración
├── components/            # Componentes reutilizables
├── contexts/              # Contextos de React (Web3Context)
├── lib/                   # Utilidades y configuración
├── types/                 # Tipos TypeScript
└── public/                # Archivos estáticos
```

## Configuración

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
Crea un archivo `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

3. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

## Páginas Principales

### `/` - Página Principal
- Conexión con MetaMask
- Navegación a diferentes secciones

### `/dashboard` - Dashboard
- Información del usuario
- Lista de tokens del usuario

### `/register` - Registro
- Formulario para solicitar un rol en el sistema

### `/tokens` - Tokens
- Lista de todos los tokens del usuario
- Acceso a crear nuevos tokens

### `/tokens/create` - Crear Token
- Formulario para crear materias primas o productos

### `/tokens/[id]` - Detalles del Token
- Información completa del token
- Trazabilidad completa
- Opción de transferir (si es propietario)

### `/tokens/[id]/transfer` - Transferir Token
- Formulario para crear una transferencia

### `/transfers` - Transferencias
- Lista de transferencias pendientes
- Aceptar/rechazar transferencias

### `/admin` - Panel Admin
- Aprobar/rechazar usuarios pendientes

## Tecnologías

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Ethers.js v6**: Interacción con blockchain
- **Radix UI**: Componentes UI accesibles

## Desarrollo

### Estructura de Contextos

El `Web3Context` proporciona:
- Conexión con MetaMask
- Instancia del contrato
- Información del usuario
- Funciones para interactuar con el contrato

### Uso del Contexto

```typescript
import { useWeb3 } from "@/contexts/Web3Context";

function MyComponent() {
  const { contract, account, user, isConnected } = useWeb3();
  
  // Usar contract para llamar funciones del contrato
}
```

## Build de Producción

```bash
npm run build
npm start
```

