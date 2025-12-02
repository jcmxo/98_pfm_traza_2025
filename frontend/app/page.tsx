"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import Link from "next/link";

export default function Home() {
  const { connectWallet, isConnected, account, user } = useWeb3();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">
          🔗 Supply Chain Tracker
        </h1>
        
        <p className="text-center text-lg mb-12 text-gray-600 dark:text-gray-400">
          Sistema de trazabilidad blockchain para cadenas de suministro
        </p>

        {!isConnected ? (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Conectar MetaMask
            </button>
            <p className="text-sm text-gray-500">
              Conecta tu wallet para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Bienvenido</h2>
              <div className="space-y-2">
                <p><strong>Cuenta:</strong> {account}</p>
                {user ? (
                  <>
                    <p><strong>Nombre:</strong> {user.name}</p>
                    <p><strong>Rol:</strong> {getRoleName(user.role)}</p>
                    <p><strong>Estado:</strong> {getStatusName(user.status)}</p>
                  </>
                ) : (
                  <p className="text-yellow-600">Usuario no registrado</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard"
                className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <h3 className="text-xl font-semibold mb-2">📊 Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ver tu panel principal
                </p>
              </Link>

              {!user && (
                <Link
                  href="/register"
                  className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-2">📝 Registrarse</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Solicitar un rol en el sistema
                  </p>
                </Link>
              )}

              {user && user.status === 1 && (
                <>
                  <Link
                    href="/tokens"
                    className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <h3 className="text-xl font-semibold mb-2">🪙 Tokens</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Gestionar tus tokens
                    </p>
                  </Link>

                  <Link
                    href="/transfers"
                    className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    <h3 className="text-xl font-semibold mb-2">🔄 Transferencias</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Ver transferencias pendientes
                    </p>
                  </Link>
                </>
              )}

              {user && user.role === 5 && (
                <Link
                  href="/admin"
                  className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-2">👑 Admin</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Panel de administración
                  </p>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
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

