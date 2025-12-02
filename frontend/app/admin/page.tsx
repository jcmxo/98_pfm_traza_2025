"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User, UserRole, UserStatus } from "@/types";
import { ethers } from "ethers";

export default function AdminPage() {
  const { contract, account, user } = useWeb3();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchAddress, setSearchAddress] = useState("");
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contract && account && user && user.role === 5) {
      loadPendingUsers();
    }
  }, [contract, account, user]);

  const loadPendingUsers = async () => {
    // Nota: En un contrato real, necesitarías una función para listar todos los usuarios pendientes
    // Por ahora, esta es una implementación simplificada
    setLoading(false);
  };

  const handleSearchUser = async () => {
    if (!contract || !searchAddress.trim()) {
      setError("Por favor ingresa una dirección válida");
      return;
    }

    setSearching(true);
    setError("");
    setSearchedUser(null);

    try {
      // Validar que la dirección sea válida antes de llamar al contrato
      if (!ethers.isAddress(searchAddress.trim())) {
        setError("Dirección inválida. Por favor ingresa una dirección válida de Ethereum.");
        setSearching(false);
        return;
      }

      // Normalizar la dirección (checksum)
      const normalizedAddress = ethers.getAddress(searchAddress.trim());
      
      const userData = await contract.getUser(normalizedAddress);
      
      // getUser devuelve una tupla, no un objeto
      const userAddress = userData[0];
      const role = userData[1];
      const status = userData[2];
      const name = userData[3];
      const metadata = userData[4];
      const registrationDate = userData[5];
      
      if (!userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
        setError("Usuario no encontrado");
        setSearching(false);
        return;
      }

      const user: User = {
        userAddress: userAddress,
        role: Number(role) as UserRole,
        status: Number(status) as UserStatus,
        name: name,
        metadata: metadata,
        registrationDate: typeof registrationDate === 'bigint' 
          ? registrationDate 
          : BigInt(registrationDate),
      };

      setSearchedUser(user);
    } catch (err: any) {
      console.error("Error searching user:", err);
      setError("Error al buscar el usuario: " + (err.message || "Error desconocido"));
    } finally {
      setSearching(false);
    }
  };

  const handleApprove = async (userAddress: string, approved: boolean) => {
    if (!contract) return;

    try {
      const tx = await contract.approveUser(userAddress, approved);
      await tx.wait();
      await loadPendingUsers();
      // Actualizar el usuario buscado si es el mismo
      if (searchedUser && searchedUser.userAddress.toLowerCase() === userAddress.toLowerCase()) {
        await handleSearchUser();
      }
      alert(`Usuario ${approved ? "aprobado" : "rechazado"} exitosamente`);
    } catch (error: any) {
      console.error("Error approving user:", error);
      alert("Error al procesar la solicitud: " + (error.message || "Error desconocido"));
    }
  };

  if (!user || user.role !== 5) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Solo los administradores pueden acceder a esta página
          </p>
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
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Buscar y Aprobar Usuario</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Dirección del Usuario
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
                className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearchUser();
                  }
                }}
              />
              <button
                onClick={handleSearchUser}
                disabled={searching || !searchAddress.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {searching ? "Buscando..." : "Buscar"}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          {searchedUser && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <h3 className="font-semibold text-lg mb-2">{searchedUser.name || "Sin nombre"}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Dirección:</strong> {searchedUser.userAddress}
              </p>
              <p className="text-sm mb-2">
                <strong>Rol:</strong> {getRoleName(searchedUser.role)}
              </p>
              <p className="text-sm mb-2">
                <strong>Estado:</strong> {getStatusName(searchedUser.status)}
              </p>
              
              {searchedUser.status === 0 && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(searchedUser.userAddress, true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✅ Aprobar
                  </button>
                  <button
                    onClick={() => handleApprove(searchedUser.userAddress, false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    ❌ Rechazar
                  </button>
                </div>
              )}
              
              {searchedUser.status === 1 && (
                <p className="mt-4 text-green-600 dark:text-green-400 font-semibold">
                  ✅ Este usuario ya está aprobado
                </p>
              )}
              
              {searchedUser.status === 2 && (
                <p className="mt-4 text-red-600 dark:text-red-400 font-semibold">
                  ❌ Este usuario fue rechazado
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Usuarios Pendientes</h2>
          
          {loading ? (
            <p className="text-center py-8">Cargando...</p>
          ) : pendingUsers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              Usa el formulario de arriba para buscar y aprobar usuarios pendientes
            </p>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((pendingUser) => (
                <div
                  key={pendingUser.userAddress}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{pendingUser.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pendingUser.userAddress}
                      </p>
                      <p className="text-sm">
                        Rol: {getRoleName(pendingUser.role)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(pendingUser.userAddress, true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleApprove(pendingUser.userAddress, false)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Nota:</strong> Para listar todos los usuarios pendientes, necesitarías implementar
            una función en el contrato que permita iterar sobre todos los usuarios registrados.
            Esta es una implementación simplificada.
          </p>
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

