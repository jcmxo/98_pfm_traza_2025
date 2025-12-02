"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Token } from "@/types";

export default function TokenDetailPage() {
  const { contract, account, user } = useWeb3();
  const params = useParams();
  const router = useRouter();
  const tokenId = params.id as string;
  
  const [token, setToken] = useState<Token | null>(null);
  const [traceability, setTraceability] = useState<bigint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contract && tokenId) {
      loadToken();
      loadTraceability();
    }
  }, [contract, tokenId]);

  const loadToken = async () => {
    if (!contract || !tokenId) return;

    try {
      const tokenData = await contract.getToken(BigInt(tokenId));
      setToken({
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
    } finally {
      setLoading(false);
    }
  };

  const loadTraceability = async () => {
    if (!contract || !tokenId) return;

    try {
      const trace = await contract.getTokenTraceability(BigInt(tokenId));
      setTraceability(trace);
    } catch (error) {
      console.error("Error loading traceability:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Token no encontrado</h1>
          <Link href="/tokens" className="text-blue-600 hover:underline">
            Volver a tokens
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = account?.toLowerCase() === token.owner.toLowerCase();
  const canTransfer = isOwner && user && user.status === 1;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/tokens"
          className="inline-block mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ← Volver a Tokens
        </Link>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{token.name}</h1>
              <span className={`inline-block px-3 py-1 rounded text-sm ${
                token.tokenType === 0 
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              }`}>
                {token.tokenType === 0 ? "Materia Prima" : "Producto"}
              </span>
            </div>
            {canTransfer && (
              <Link
                href={`/tokens/${tokenId}/transfer`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Transferir
              </Link>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Descripción
              </h3>
              <p className="text-gray-900 dark:text-gray-100">{token.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Propietario
              </h3>
              <p className="font-mono text-sm">{token.owner}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                ID del Token
              </h3>
              <p className="font-mono text-sm">{token.id.toString()}</p>
            </div>

            {token.parentTokens.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Tokens Padre
                </h3>
                <div className="flex flex-wrap gap-2">
                  {token.parentTokens.map((parentId) => (
                    <Link
                      key={parentId.toString()}
                      href={`/tokens/${parentId.toString()}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Token #{parentId.toString()}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {token.metadata && token.metadata !== "{}" && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Metadatos
                </h3>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  {token.metadata}
                </pre>
              </div>
            )}
          </div>
        </div>

        {traceability.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Trazabilidad</h2>
            <div className="space-y-2">
              {traceability.map((traceId, index) => (
                <div key={traceId.toString()} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  <Link
                    href={`/tokens/${traceId.toString()}`}
                    className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Token #{traceId.toString()}
                  </Link>
                  {index < traceability.length - 1 && (
                    <div className="text-gray-400">↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

