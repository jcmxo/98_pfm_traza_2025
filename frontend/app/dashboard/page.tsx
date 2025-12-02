"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Token } from "@/types";

export default function DashboardPage() {
  const { contract, account, user, isConnected } = useWeb3();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contract && account) {
      loadTokens();
    }
  }, [contract, account]);

  const loadTokens = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No conectado</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Volver
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
          {user ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                <p className="font-semibold">{user.name || "Sin nombre"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rol</p>
                <p className="font-semibold">{getRoleName(user.role)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                <p className="font-semibold">{getStatusName(user.status)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cuenta</p>
                <p className="font-mono text-sm">{account}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Cuenta</p>
              <p className="font-mono text-sm">{account}</p>
            </div>
          )}
          
          {(!user || (user.role === 0 && user.status === 0)) && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {!user 
                    ? "Necesitas registrarte para usar el sistema."
                    : user.status === 0 && user.role === 0
                    ? "Necesitas registrarte para usar el sistema."
                    : "Tu registro está pendiente. Si acabas de registrarte, espera la aprobación del administrador."}
                </p>
                {(!user || (user.role === 0 && user.status === 0)) && (
                  <Link
                    href="/register"
                    className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📝 Ir a Registro
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mis Tokens</h2>
            {user && user.status === 1 && (
              <Link
                href="/tokens/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Crear Token
              </Link>
            )}
          </div>

          {loading ? (
            <p className="text-center py-8">Cargando tokens...</p>
          ) : tokens.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No tienes tokens aún
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.map((token) => (
                <Link
                  key={token.id.toString()}
                  href={`/tokens/${token.id.toString()}`}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="font-semibold mb-2">{token.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {token.description}
                  </p>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                    {token.tokenType === 0 ? "Materia Prima" : "Producto"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getRoleName(role: number): string {
  const roles = ["Ninguno", "Productor", "Fábrica", "Minorista", "Consumidor", "Admin"];
  return roles[role] || "Desconocido";
}

function getStatusName(status: number): string {
  const statuses = ["Pendiente", "Aprobado", "Rechazado"];
  return statuses[status] || "Desconocido";
}

