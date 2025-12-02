"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Token } from "@/types";

export default function CreateTokenPage() {
  const { contract, account, user } = useWeb3();
  const router = useRouter();
  const [tokenType, setTokenType] = useState<number>(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState("{}");
  const [parentTokens, setParentTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contract && account && user) {
      loadUserTokens();
    }
  }, [contract, account, user]);

  const loadUserTokens = async () => {
    if (!contract || !account) return;

    try {
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

      setAvailableTokens(tokensList);
    } catch (error) {
      console.error("Error loading tokens:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !account) {
      setError("Por favor conecta tu wallet primero");
      return;
    }

    if (!user || user.status !== 1) {
      setError("Debes estar aprobado para crear tokens");
      return;
    }

    // Validar permisos
    if (tokenType === 0 && user.role !== 1 && user.role !== 5) {
      setError("Solo los Productores y Admins pueden crear materias primas");
      return;
    }

    if (tokenType === 1 && user.role !== 2) {
      setError("Solo las Fábricas pueden crear productos");
      return;
    }

    if (tokenType === 1 && parentTokens.length === 0) {
      setError("Los productos deben tener al menos un token padre");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const parentTokenIds = parentTokens.map(id => BigInt(id));
      
      const tx = await contract.createToken(
        tokenType,
        name,
        description,
        metadata,
        parentTokenIds
      );
      await tx.wait();
      
      router.push("/tokens");
    } catch (err: any) {
      console.error("Error creating token:", err);
      setError(err.message || "Error al crear token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/tokens"
          className="inline-block mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ← Volver
        </Link>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Crear Token</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Token
              </label>
              <select
                value={tokenType}
                onChange={(e) => {
                  setTokenType(Number(e.target.value));
                  if (Number(e.target.value) === 0) {
                    setParentTokens([]);
                  }
                }}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value={0}>Materia Prima</option>
                <option value={1}>Producto</option>
              </select>
            </div>

            {tokenType === 1 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tokens Padre (Materias Primas)
                </label>
                {availableTokens.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No tienes tokens disponibles para usar como padre
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                    {availableTokens
                      .filter(t => t.tokenType === 0)
                      .map((token) => (
                        <label key={token.id.toString()} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={parentTokens.includes(token.id.toString())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setParentTokens([...parentTokens, token.id.toString()]);
                              } else {
                                setParentTokens(parentTokens.filter(id => id !== token.id.toString()));
                              }
                            }}
                          />
                          <span>{token.name} (ID: {token.id.toString()})</span>
                        </label>
                      ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Ej: Trigo Orgánico"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows={4}
                placeholder="Descripción detallada del token..."
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
                placeholder='{"origin": "España", "certification": "Orgánico", "weight": "100kg"}'
              />
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
              {loading ? "Creando..." : "Crear Token"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

