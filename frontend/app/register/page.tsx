"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const { contract, account, user, refreshUser } = useWeb3();
  const router = useRouter();
  const [role, setRole] = useState<number>(1);
  const [name, setName] = useState("");
  const [metadata, setMetadata] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !account) {
      setError("Por favor conecta tu wallet primero");
      return;
    }

    if (user && user.userAddress !== "0x0000000000000000000000000000000000000000") {
      setError("Ya estás registrado en el sistema");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const tx = await contract.registerUser(role, name, metadata);
      await tx.wait();
      
      setSuccess(true);
      await refreshUser();
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Error registering:", err);
      setError(err.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ← Volver
        </Link>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Registro de Usuario</h1>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-4xl mb-4">✓</div>
              <h2 className="text-2xl font-semibold mb-2">¡Registro exitoso!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tu solicitud ha sido enviada. Espera la aprobación del administrador.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rol
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value={1}>👨‍🌾 Productor</option>
                  <option value={2}>🏭 Fábrica</option>
                  <option value={3}>🏪 Minorista</option>
                  <option value={4}>🛒 Consumidor</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Selecciona el rol que mejor describe tu función en la cadena de suministro
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Ej: Granja Orgánica S.A."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Metadatos (JSON)
                </label>
                <textarea
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                  rows={4}
                  placeholder='{"location": "Madrid, España", "certification": "Orgánico"}'
                />
                <p className="text-sm text-gray-500 mt-1">
                  Información adicional en formato JSON (opcional)
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registrando..." : "Registrarse"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

