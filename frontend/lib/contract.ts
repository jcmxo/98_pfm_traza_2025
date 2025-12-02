import { ContractConfig } from "@/types";

// Esta dirección se actualizará después del deploy
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// ABI básico del contrato SupplyChain
export const CONTRACT_ABI = [
  // User Management
  "function registerUser(uint8 role, string memory name, string memory metadata)",
  "function approveUser(address userAddress, bool approved)",
  "function getUser(address userAddress) view returns (tuple(address userAddress, uint8 role, uint8 status, string name, string metadata, uint256 registrationDate))",
  
  // Token Management
  "function createToken(uint8 tokenType, string memory name, string memory description, string memory metadata, uint256[] memory parentTokenIds) returns (uint256)",
  "function getToken(uint256 tokenId) view returns (tuple(uint256 id, address owner, uint8 tokenType, string name, string description, string metadata, uint256[] parentTokens, uint256 creationDate, bool exists))",
  "function getUserTokens(address userAddress) view returns (uint256[])",
  
  // Transfer Management
  "function createTransfer(uint256 tokenId, address to, string memory message) returns (uint256)",
  "function acceptTransfer(uint256 transferId)",
  "function rejectTransfer(uint256 transferId)",
  "function getTransfer(uint256 transferId) view returns (tuple(uint256 id, uint256 tokenId, address from, address to, uint8 status, string message, uint256 timestamp, bool exists))",
  "function getPendingTransfers(address userAddress) view returns (uint256[])",
  
  // Traceability
  "function getTokenTraceability(uint256 tokenId) view returns (uint256[])",
  
  // Events
  "event UserRegistered(address indexed user, uint8 indexed role, string name)",
  "event TokenCreated(uint256 indexed tokenId, address indexed owner, uint8 indexed tokenType, string name)",
  "event TransferCreated(uint256 indexed transferId, uint256 indexed tokenId, address indexed from, address to)",
  "event TransferStatusChanged(uint256 indexed transferId, uint8 status)",
  "event TokenTransferred(uint256 indexed tokenId, address indexed from, address indexed to)",
] as const;

export const getContractConfig = (): ContractConfig => ({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI as any,
});

