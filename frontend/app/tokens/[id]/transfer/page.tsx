"use client";

import { useWeb3 } from "@/contexts/Web3Context";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Token, User } from "@/types";
import { ethers } from "ethers";

export default function TransferTokenPage() {
  const { contract, account, user } = useWeb3();
  const params = useParams();
  const router = useRouter();
  const tokenId = params.id as string;
  
  const [token, setToken] = useState<Token | null>(null);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (contract && tokenId) {
      loadToken();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !account || !token) {
      setError("Error: contrato o cuenta no disponible");
      return;
    }

    if (account.toLowerCase() !== token.owner.toLowerCase()) {
      setError("No eres el propietario de este token");
      return;
    }

    if (!ethers.isAddress(recipient)) {
      setError("Dirección de destinatario inválida");
      return;
    }

    // Normalizar dirección a checksum format
    const normalizedRecipient = ethers.getAddress(recipient);
    console.log("Creating transfer:", {
      tokenId,
      from: account,
      to: normalizedRecipient,
      originalRecipient: recipient
    });

    try {
      setSubmitting(true);
      setError("");

      // Verificar que el destinatario existe y está aprobado
      let recipientUser: User;
      try {
        const userData = await contract.getUser(normalizedRecipient);
        console.log("Recipient user data:", userData);
        recipientUser = {
          userAddress: userData[0],
          role: Number(userData[1]) as any,
          status: Number(userData[2]) as any,
          name: userData[3],
          metadata: userData[4],
          registrationDate: userData[5],
        };

        if (recipientUser.status !== 1) {
          setError("El destinatario no está aprobado en el sistema");
          setSubmitting(false);
          return;
        }
      } catch (error) {
        setError("El destinatario no está registrado en el sistema");
        setSubmitting(false);
        return;
      }

      // Validar flujo de transferencias
      const fromRole = user?.role;
      const toRole = recipientUser.role;

      if (fromRole === 1 && toRole !== 2) {
        setError("Los Productores solo pueden transferir a Fábricas");
        setSubmitting(false);
        return;
      }
      if (fromRole === 2 && toRole !== 3) {
        setError("Las Fábricas solo pueden transferir a Minoristas");
        setSubmitting(false);
        return;
      }
      if (fromRole === 3 && toRole !== 4) {
        setError("Los Minoristas solo pueden transferir a Consumidores");
        setSubmitting(false);
        return;
      }

      console.log("Calling createTransfer with:", {
        tokenId: BigInt(tokenId),
        recipient: normalizedRecipient,
        message
      });

      const tx = await contract.createTransfer(
        BigInt(tokenId),
        normalizedRecipient,
        message
      );
      console.log("Transfer transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transfer transaction confirmed:", receipt);
      console.log("Transfer receipt logs:", receipt.logs);
      
      // Intentar extraer el transferId del evento
      if (receipt.logs && receipt.logs.length > 0) {
        console.log("Event logs found:", receipt.logs.length);
        // Buscar el evento TransferCreated
        const transferCreatedEvent = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed && parsed.name === "TransferCreated";
          } catch {
            return false;
          }
        });
        if (transferCreatedEvent) {
          console.log("TransferCreated event found:", transferCreatedEvent);
        }
      }
      
      // Verificar que la transferencia se creó correctamente
      try {
        // Esperar un poco para que el estado se actualice
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Intentar obtener las transferencias pendientes del destinatario
        const pendingTransfers = await contract.getPendingTransfers(normalizedRecipient);
        console.log("✅ Verificación: Transferencias pendientes del destinatario:", pendingTransfers);
        console.log("   Si el array está vacío, la transferencia no se guardó correctamente");
      } catch (verifyError) {
        console.error("Error verificando transferencia:", verifyError);
      }
      
      alert("✅ Transferencia creada exitosamente. El destinatario debería verla en /transfers");
      router.push("/transfers");
    } catch (err: any) {
      console.error("Error creating transfer:", err);
      setError(err.message || "Error al crear la transferencia");
    } finally {
      setSubmitting(false);
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

  if (account?.toLowerCase() !== token.owner.toLowerCase()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No autorizado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Solo el propietario puede transferir este token
          </p>
          <Link href={`/tokens/${tokenId}`} className="text-blue-600 hover:underline">
            Volver al token
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/tokens/${tokenId}`}
          className="inline-block mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ← Volver al Token
        </Link>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Transferir Token</h1>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2">{token.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {token.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Dirección del Destinatario
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono"
                placeholder="0x..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Ingresa la dirección Ethereum del destinatario
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mensaje (Opcional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows={4}
                placeholder="Mensaje para el destinatario..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creando transferencia..." : "Crear Transferencia"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

