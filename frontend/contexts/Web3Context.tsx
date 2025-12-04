"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { User, UserRole, UserStatus } from "@/types";

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  contract: ethers.Contract | null;
  user: User | null;
  isConnected: boolean;
  isLoading: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUser: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Asegurar que solo se ejecute en el cliente
  useEffect(() => {
    setMounted(true);
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!contract || !account) {
      console.log("refreshUser: No contract or account", { contract: !!contract, account });
      setUser(null);
      return;
    }

    try {
      console.log("refreshUser: Fetching user data for account:", account);
      const userData = await contract.getUser(account);
      console.log("refreshUser: User data received:", userData);
      
      // Verificar si el usuario está registrado (userAddress no es address(0))
      const userAddress = userData[0];
      console.log("refreshUser: User address from contract:", userAddress);
      
      if (userAddress === "0x0000000000000000000000000000000000000000" || !userAddress) {
        console.log("refreshUser: User not registered (address is zero)");
        setUser(null);
        return;
      }
      
      const userInfo = {
        userAddress: userAddress,
        role: Number(userData[1]) as UserRole,
        status: Number(userData[2]) as UserStatus,
        name: userData[3],
        metadata: userData[4],
        registrationDate: userData[5],
      };
      
      console.log("refreshUser: Setting user info:", userInfo);
      setUser(userInfo);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  }, [contract, account]);

  const connectWallet = useCallback(async () => {
    // Prevenir múltiples solicitudes simultáneas
    if (isConnecting) {
      console.log("Ya hay una solicitud de conexión en curso, esperando...");
      return;
    }

    console.log("connectWallet llamado");
    setIsConnecting(true);
    
    try {
      if (typeof window === 'undefined') {
        console.error("window es undefined (SSR)");
        alert("Error: El código está ejecutándose en el servidor. Por favor recarga la página.");
        setIsConnecting(false);
        return;
      }
      
      if (!window.ethereum) {
        console.error("window.ethereum no está disponible");
        alert("Por favor instala MetaMask");
        setIsConnecting(false);
        return;
      }
      
      // Verificar que MetaMask esté disponible y respondiendo
      try {
        const isMetaMask = window.ethereum.isMetaMask;
        if (!isMetaMask) {
          console.warn("No es MetaMask, pero hay un proveedor ethereum disponible");
        }
      } catch (e) {
        console.warn("No se pudo verificar si es MetaMask:", e);
      }
      
      console.log("MetaMask detectado, solicitando cuentas...");

      let newProvider: ethers.BrowserProvider;
      try {
        newProvider = new ethers.BrowserProvider(window.ethereum);
      } catch (error: any) {
        console.error("Error al crear BrowserProvider:", error);
        setIsConnecting(false);
        const errorMsg = error?.message || String(error);
        if (errorMsg.toLowerCase().includes("failed to connect") || 
            errorMsg.toLowerCase().includes("connection")) {
          alert(
            "❌ Error al conectar con MetaMask\n\n" +
            "Por favor verifica:\n" +
            "1. MetaMask está instalado y habilitado\n" +
            "2. MetaMask está desbloqueado\n" +
            "3. La red local (Anvil) está configurada correctamente\n" +
            "4. Intenta refrescar la página (F5)\n\n" +
            "Si el problema persiste, cierra y reabre MetaMask."
          );
        } else {
          alert("Error al inicializar MetaMask: " + errorMsg);
        }
        return;
      }
      
      // Solicitar cuentas con manejo de errores mejorado
      let accounts: string[] = [];
      try {
        accounts = await newProvider.send("eth_requestAccounts", []);
        console.log("Cuentas recibidas:", accounts);
      } catch (error: any) {
        console.error("Error al solicitar cuentas:", error);
        setIsConnecting(false);
        
        // Extraer código y mensaje del error (puede estar anidado)
        const errorCode = error?.code || error?.error?.code;
        const errorMessage = error?.error?.message || error?.message || String(error);
        const errorString = String(error).toLowerCase();
        
        // Detectar error de solicitud pendiente de múltiples formas
        const isPendingRequest = 
          errorCode === -32002 || 
          errorString.includes("already pending") ||
          errorString.includes("request already pending") ||
          errorMessage.toLowerCase().includes("already pending");
        
        if (errorCode === 4001) {
          alert("Conexión rechazada. Por favor, acepta la conexión en MetaMask.");
        } else if (isPendingRequest) {
          // Solicitud ya pendiente
          alert(
            "⚠️ MetaMask tiene una solicitud pendiente.\n\n" +
            "Por favor:\n" +
            "1. Revisa la ventana de MetaMask (puede estar minimizada)\n" +
            "2. Acepta o rechaza la solicitud pendiente\n" +
            "3. Espera 3-5 segundos\n" +
            "4. Intenta conectar de nuevo\n\n" +
            "Si el problema persiste, refresca la página (F5)."
          );
        } else if (errorCode === -32603 || 
                   errorMessage.toLowerCase().includes("failed to fetch") ||
                   errorString.includes("failed to fetch")) {
          // Error de conexión RPC
          alert(
            "❌ Error: MetaMask no puede conectarse a Anvil\n\n" +
            "El error 'Failed to fetch' indica que MetaMask no puede comunicarse con la red local.\n\n" +
            "Por favor verifica:\n" +
            "1. ✅ Anvil está corriendo (puerto 8545)\n" +
            "2. 🔧 La red local está configurada en MetaMask:\n" +
            "   • RPC URL: http://127.0.0.1:8545\n" +
            "   • Chain ID: 31337\n" +
            "3. 🔄 Selecciona la red local en MetaMask\n" +
            "4. 🔄 Refresca la página (F5)\n\n" +
            "Si el problema persiste, cierra y reabre MetaMask."
          );
        } else {
          alert("Error al conectar con MetaMask: " + errorMessage);
        }
        return;
      }
      
      if (accounts.length === 0) {
        alert("No se encontraron cuentas en MetaMask. Por favor, desbloquea MetaMask o crea una cuenta.");
        return;
      }

      const newSigner = await newProvider.getSigner();
      const address = await newSigner.getAddress();

      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(address);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("walletAccount", address);
      }

      // Crear instancia del contrato
      if (CONTRACT_ADDRESS && CONTRACT_ADDRESS.trim() !== "") {
        try {
          const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            newSigner
          );
          setContract(contractInstance);
          
          // Cargar información del usuario después de crear el contrato
          try {
            const userData = await contractInstance.getUser(address);
            // Verificar si el usuario está registrado (userAddress no es address(0))
            const userAddress = userData[0];
            if (userAddress === "0x0000000000000000000000000000000000000000" || !userAddress) {
              setUser(null);
            } else {
              setUser({
                userAddress: userAddress,
                role: Number(userData[1]) as UserRole,
                status: Number(userData[2]) as UserStatus,
                name: userData[3],
                metadata: userData[4],
                registrationDate: userData[5],
              });
            }
          } catch (error) {
            console.error("Error fetching user on connect:", error);
            setUser(null);
          }
        } catch (error) {
          console.error("Error creating contract instance:", error);
          setContract(null);
        }
      } else {
        console.warn("CONTRACT_ADDRESS no configurado. Configura NEXT_PUBLIC_CONTRACT_ADDRESS en .env.local");
      }

      // Escuchar cambios de cuenta
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });
        window.ethereum.on("chainChanged", () => window.location.reload());
      }

      setIsLoading(false);
      setIsConnecting(false);
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      setIsLoading(false);
      setIsConnecting(false);
      
      // Manejar errores no capturados anteriormente
      const errorMsg = error?.message || String(error);
      const errorString = String(error).toLowerCase();
      
      if (errorString.includes("failed to connect") || 
          errorString.includes("connection") ||
          errorMsg.toLowerCase().includes("failed to connect")) {
        alert(
          "❌ Error al conectar con MetaMask\n\n" +
          "Posibles causas:\n" +
          "• MetaMask no está desbloqueado\n" +
          "• MetaMask no está respondiendo\n" +
          "• Problema con la red configurada\n\n" +
          "Soluciones:\n" +
          "1. Abre MetaMask y desbloquéalo si es necesario\n" +
          "2. Verifica que la red local esté configurada\n" +
          "3. Refresca la página (F5)\n" +
          "4. Si persiste, cierra y reabre MetaMask"
        );
      } else {
        alert("Error inesperado al conectar: " + errorMsg);
      }
    }
  }, [isConnecting]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setUser(null);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem("walletAccount");
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    }
  }, []);

  // Cargar estado guardado del localStorage solo en el cliente
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') {
      return;
    }
    
    const savedAccount = localStorage.getItem("walletAccount");
    if (savedAccount && window.ethereum) {
      connectWallet();
    }
  }, [mounted, connectWallet]);

  // Refrescar usuario automáticamente cuando el contrato y la cuenta estén disponibles
  useEffect(() => {
    if (contract && account && mounted) {
      console.log("Auto-refreshing user data for account:", account);
      refreshUser();
    }
  }, [contract, account, mounted, refreshUser]);

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    contract,
    user,
    isConnected: mounted && !!account && !!signer,
    isLoading: !mounted || isLoading,
    isConnecting,
    connectWallet,
    disconnectWallet,
    refreshUser,
  };

  // Siempre renderizar el provider, incluso durante SSR
  // El valor se inicializa correctamente para evitar errores
  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Extender Window interface para TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

