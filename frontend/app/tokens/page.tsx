"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Token } from "@/types";

export default function TokensPage() {
  const { contract, account, user } = useWeb3();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);
  const loadedAccountRef = useRef<string | null>(null);

  const loadTokens = useCallback(async () => {
    if (!contract || !account || loadingRef.current) return;

    // Evitar recargar si ya se cargaron los tokens para esta cuenta
    if (loadedAccountRef.current === account) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      loadedAccountRef.current = account;
      
      const tokenIds = await contract.getUserTokens(account);
      const tokenPromises = tokenIds.map((id: bigint) => contract.getToken(id));
      const tokenData = await Promise.all(tokenPromises);
      
      const tokensList: Token[] = tokenData.map((data: any) => ({
        id: data[0],
        owner: data[1],
        tokenType: Number(data[2]),
        name: data[3],
        description: data[4],
        metadata: data[5],
        parentTokens: data[6],
        creationDate: data[7],
        exists: data[8],
      }));

      setTokens(tokensList);
    } catch (error) {
      console.error("Error loading tokens:", error);
      loadedAccountRef.current = null; // Reset en caso de error para permitir reintento
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [contract, account]);

  useEffect(() => {
    if (contract && account) {
      loadTokens();
    } else {
      // Reset cuando no hay contrato o cuenta
      setTokens([]);
      setLoading(false);
      loadedAccountRef.current = null;
    }
  }, [contract, account, loadTokens]);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mis Tokens</h1>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              ← Dashboard
            </Link>
            {user && user.status === 1 && (
              <Link
                href="/tokens/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Crear Token
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Cargando tokens...</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No tienes tokens aún</p>
            {user && user.status === 1 && (
              <Link
                href="/tokens/create"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear tu primer token
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <Link
                key={token.id.toString()}
                href={`/tokens/${token.id.toString()}`}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{token.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    token.tokenType === 0 
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  }`}>
                    {token.tokenType === 0 ? "Materia Prima" : "Producto"}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {token.description}
                </p>
                <div className="text-sm text-gray-500">
                  ID: {token.id.toString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

