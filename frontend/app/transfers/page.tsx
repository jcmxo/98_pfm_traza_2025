"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Transfer, Token } from "@/types";

export default function TransfersPage() {
  const { contract, account } = useWeb3();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [tokens, setTokens] = useState<Map<string, Token>>(new Map());
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);
  const loadedAccountRef = useRef<string | null>(null);

  const loadTransfers = useCallback(async () => {
    if (!contract || !account || loadingRef.current) return;

    // Evitar recargar si ya se cargaron las transferencias para esta cuenta
    if (loadedAccountRef.current === account) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      loadedAccountRef.current = account;
      console.log("Loading transfers for account:", account);
      console.log("Account checksum:", account);
      console.log("Account lowercase:", account.toLowerCase());
      
      const transferIds = await contract.getPendingTransfers(account);
      console.log("Transfer IDs received:", transferIds);
      console.log("Transfer IDs type:", typeof transferIds);
      console.log("Transfer IDs length:", transferIds?.length);
      
      // También intentar con lowercase para debugging
      try {
        const transferIdsLower = await contract.getPendingTransfers(account.toLowerCase());
        console.log("Transfer IDs (lowercase):", transferIdsLower);
      } catch (e) {
        console.log("Error checking lowercase:", e);
      }
      
      if (!transferIds || transferIds.length === 0) {
        console.log("No pending transfers found");
        console.log("⚠️ DIAGNÓSTICO: No hay transferencias pendientes para esta cuenta");
        console.log("   Verifica que:");
        console.log("   1. La transferencia se creó correctamente desde el Minorista");
        console.log("   2. La dirección del destinatario era correcta");
        console.log("   3. La transacción se confirmó en MetaMask");
        setTransfers([]);
        setLoading(false);
        return;
      }

      const transferPromises = transferIds.map((id: bigint) => contract.getTransfer(id));
      const transferData = await Promise.all(transferPromises);
      console.log("Transfer data:", transferData);
      
      const transfersList: Transfer[] = transferData.map((data: any) => {
        const transfer = {
          id: data[0],
          tokenId: data[1],
          from: data[2],
          to: data[3],
          status: Number(data[4]) as any,
          message: data[5],
          timestamp: data[6],
          exists: data[7],
        };
        console.log("Transfer details:", {
          id: transfer.id.toString(),
          tokenId: transfer.tokenId.toString(),
          from: transfer.from,
          to: transfer.to,
          status: transfer.status,
          statusName: transfer.status === 0 ? "Pending" : transfer.status === 1 ? "Accepted" : "Rejected",
          exists: transfer.exists
        });
        return transfer;
      });

      // Filtrar solo transferencias pendientes (status === 0)
      const pendingTransfersList = transfersList.filter(t => t.status === 0);
      console.log("All transfers:", transfersList);
      console.log("Pending transfers (status === 0):", pendingTransfersList);
      
      if (pendingTransfersList.length !== transfersList.length) {
        console.warn("⚠️ ALERTA: Algunas transferencias no están pendientes");
        console.warn("   Esto puede significar que fueron aceptadas/rechazadas");
      }
      
      setTransfers(pendingTransfersList);

      // Cargar información de tokens
      const tokenMap = new Map<string, Token>();
      for (const transfer of transfersList) {
        try {
          const tokenData = await contract.getToken(transfer.tokenId);
          tokenMap.set(transfer.tokenId.toString(), {
            id: tokenData[0],
            owner: tokenData[1],
            tokenType: Number(tokenData[2]),
            name: tokenData[3],
            description: tokenData[4],
            metadata: tokenData[5],
            parentTokens: tokenData[6],
            creationDate: tokenData[7],
            exists: tokenData[8],
          });
        } catch (error) {
          console.error("Error loading token:", error);
        }
      }
      setTokens(tokenMap);
    } catch (error) {
      console.error("Error loading transfers:", error);
      loadedAccountRef.current = null; // Reset en caso de error para permitir reintento
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract && account) {
      loadTransfers();
    } else {
      // Reset cuando no hay contrato o cuenta
      setTransfers([]);
      setTokens(new Map());
      setLoading(false);
      loadedAccountRef.current = null;
    }
  }, [contract, account, loadTransfers]);

  const handleAccept = async (transferId: bigint) => {
    if (!contract) return;

    try {
      const tx = await contract.acceptTransfer(transferId);
      await tx.wait();
      // Reset para permitir recargar después de aceptar
      loadedAccountRef.current = null;
      await loadTransfers();
    } catch (error) {
      console.error("Error accepting transfer:", error);
      alert("Error al aceptar la transferencia");
    }
  };

  const handleReject = async (transferId: bigint) => {
    if (!contract) return;

    try {
      const tx = await contract.rejectTransfer(transferId);
      await tx.wait();
      // Reset para permitir recargar después de rechazar
      loadedAccountRef.current = null;
      await loadTransfers();
    } catch (error) {
      console.error("Error rejecting transfer:", error);
      alert("Error al rechazar la transferencia");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Transferencias Pendientes</h1>
          <div className="flex gap-4">
            <Link
              href="/transfers/history"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ver Historial
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Cargando transferencias...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tienes transferencias pendientes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => {
              const token = tokens.get(transfer.tokenId.toString());
              return (
                <div
                  key={transfer.id.toString()}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {token ? token.name : `Token #${transfer.tokenId.toString()}`}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        De: <span className="font-mono">{transfer.from}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Para: <span className="font-mono">{transfer.to}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm">
                      Pendiente
                    </span>
                  </div>

                  {transfer.message && (
                    <p className="mb-4 text-gray-700 dark:text-gray-300">
                      {transfer.message}
                    </p>
                  )}

                  {token && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {token.description}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAccept(transfer.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleReject(transfer.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

