"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Transfer, Token } from "@/types";

export default function TransferHistoryPage() {
  const { contract, account } = useWeb3();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [tokens, setTokens] = useState<Map<string, Token>>(new Map());
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);
  const loadedAccountRef = useRef<string | null>(null);

  const loadAllTransfers = useCallback(async () => {
    if (!contract || !account || loadingRef.current) return;

    // Evitar recargar si ya se cargaron las transferencias para esta cuenta
    if (loadedAccountRef.current === account) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      loadedAccountRef.current = account;
      
      // Obtener el contador de transferencias
      const transferCounter = await contract.transferCounter();
      const totalTransfers = Number(transferCounter);
      
      console.log("Total transfers in system:", totalTransfers);
      
      if (totalTransfers === 0) {
        setTransfers([]);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      // Obtener todas las transferencias (desde 1 hasta transferCounter)
      const transferPromises: Promise<any>[] = [];
      for (let i = 1; i <= totalTransfers; i++) {
        try {
          transferPromises.push(contract.getTransfer(BigInt(i)));
        } catch (error) {
          // Si la transferencia no existe, continuar
          console.log(`Transfer ${i} does not exist, skipping`);
        }
      }

      const transferDataArray = await Promise.allSettled(transferPromises);
      
      const transfersList: Transfer[] = [];
      const tokenMap = new Map<string, Token>();

      for (let i = 0; i < transferDataArray.length; i++) {
        const result = transferDataArray[i];
        if (result.status === 'fulfilled' && result.value && result.value[7]) { // exists
          const data = result.value;
          const transfer: Transfer = {
            id: data[0],
            tokenId: data[1],
            from: data[2],
            to: data[3],
            status: Number(data[4]) as any,
            message: data[5],
            timestamp: data[6],
            exists: data[7],
          };
          
          transfersList.push(transfer);

          // Cargar información del token si no está en el mapa
          if (!tokenMap.has(transfer.tokenId.toString())) {
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
              console.error(`Error loading token ${transfer.tokenId}:`, error);
            }
          }
        }
      }

      // Ordenar por ID descendente (más recientes primero)
      transfersList.sort((a, b) => {
        if (a.id > b.id) return -1;
        if (a.id < b.id) return 1;
        return 0;
      });

      setTransfers(transfersList);
      setTokens(tokenMap);
    } catch (error) {
      console.error("Error loading transfer history:", error);
      loadedAccountRef.current = null;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract && account) {
      loadAllTransfers();
    } else {
      setTransfers([]);
      setTokens(new Map());
      setLoading(false);
      loadedAccountRef.current = null;
    }
  }, [contract, account, loadAllTransfers]);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm">
            Pendiente
          </span>
        );
      case 1:
        return (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
            Aceptada
          </span>
        );
      case 2:
        return (
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm">
            Rechazada
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">
            Desconocido
          </span>
        );
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUserInvolved = (transfer: Transfer) => {
    if (!account) return false;
    return (
      transfer.from.toLowerCase() === account.toLowerCase() ||
      transfer.to.toLowerCase() === account.toLowerCase()
    );
  };

  // Filtrar transferencias relacionadas con el usuario actual
  const userTransfers = transfers.filter(isUserInvolved);
  const otherTransfers = transfers.filter(t => !isUserInvolved(t));

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Historial de Transferencias</h1>
          <div className="flex gap-4">
            <Link
              href="/transfers"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ← Transferencias Pendientes
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Cargando historial...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay transferencias en el sistema</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Resumen */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Resumen</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {transfers.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {transfers.filter(t => t.status === 0).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {transfers.filter(t => t.status === 1).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Aceptadas</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {transfers.filter(t => t.status === 2).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rechazadas</p>
                </div>
              </div>
            </div>

            {/* Transferencias del usuario */}
            {userTransfers.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Mis Transferencias</h2>
                <div className="space-y-4">
                  {userTransfers.map((transfer) => {
                    const token = tokens.get(transfer.tokenId.toString());
                    const isFromUser = account?.toLowerCase() === transfer.from.toLowerCase();
                    const isToUser = account?.toLowerCase() === transfer.to.toLowerCase();
                    
                    return (
                      <div
                        key={transfer.id.toString()}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border-l-4 border-blue-500"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">
                                {token ? token.name : `Token #${transfer.tokenId.toString()}`}
                              </h3>
                              {getStatusBadge(transfer.status)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>
                                <span className="font-medium">De:</span>{" "}
                                <span className={`font-mono ${isFromUser ? "text-blue-600 dark:text-blue-400 font-bold" : ""}`}>
                                  {transfer.from}
                                  {isFromUser && " (Tú)"}
                                </span>
                              </p>
                              <p>
                                <span className="font-medium">Para:</span>{" "}
                                <span className={`font-mono ${isToUser ? "text-blue-600 dark:text-blue-400 font-bold" : ""}`}>
                                  {transfer.to}
                                  {isToUser && " (Tú)"}
                                </span>
                              </p>
                              <p>
                                <span className="font-medium">Fecha:</span> {formatDate(transfer.timestamp)}
                              </p>
                              <p>
                                <span className="font-medium">ID Transferencia:</span> #{transfer.id.toString()}
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/tokens/${transfer.tokenId.toString()}`}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                          >
                            Ver Token
                          </Link>
                        </div>
                        {transfer.message && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">Mensaje:</span> {transfer.message}
                            </p>
                          </div>
                        )}
                        {token && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {token.description}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Otras transferencias */}
            {otherTransfers.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Otras Transferencias del Sistema</h2>
                <div className="space-y-4">
                  {otherTransfers.map((transfer) => {
                    const token = tokens.get(transfer.tokenId.toString());
                    return (
                      <div
                        key={transfer.id.toString()}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">
                                {token ? token.name : `Token #${transfer.tokenId.toString()}`}
                              </h3>
                              {getStatusBadge(transfer.status)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>
                                <span className="font-medium">De:</span>{" "}
                                <span className="font-mono">{transfer.from}</span>
                              </p>
                              <p>
                                <span className="font-medium">Para:</span>{" "}
                                <span className="font-mono">{transfer.to}</span>
                              </p>
                              <p>
                                <span className="font-medium">Fecha:</span> {formatDate(transfer.timestamp)}
                              </p>
                              <p>
                                <span className="font-medium">ID Transferencia:</span> #{transfer.id.toString()}
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/tokens/${transfer.tokenId.toString()}`}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                          >
                            Ver Token
                          </Link>
                        </div>
                        {transfer.message && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">Mensaje:</span> {transfer.message}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

