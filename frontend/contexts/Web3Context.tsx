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
  const [mounted, setMounted] = useState(false);

  // Asegurar que solo se ejecute en el cliente
  useEffect(() => {
    setMounted(true);
    setIsLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!contract || !account) {
      setUser(null);
      return;
    }

    try {
      const userData = await contract.getUser(account);
      setUser({
        userAddress: userData[0],
        role: Number(userData[1]) as UserRole,
        status: Number(userData[2]) as UserStatus,
        name: userData[3],
        metadata: userData[4],
        registrationDate: userData[5],
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  }, [contract, account]);

  const connectWallet = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        alert("Por favor instala MetaMask");
        return;
      }

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await newProvider.send("eth_requestAccounts", []);
      
      if (accounts.length === 0) {
        throw new Error("No se encontraron cuentas");
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
            setUser({
              userAddress: userData[0],
              role: Number(userData[1]) as UserRole,
              status: Number(userData[2]) as UserStatus,
              name: userData[3],
              metadata: userData[4],
              registrationDate: userData[5],
            });
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
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setIsLoading(false);
    }
  }, []);

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

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    contract,
    user,
    isConnected: mounted && !!account && !!signer,
    isLoading: !mounted || isLoading,
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

