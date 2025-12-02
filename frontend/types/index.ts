export enum UserRole {
  None = 0,
  Producer = 1,
  Factory = 2,
  Retailer = 3,
  Consumer = 4,
  Admin = 5,
}

export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

export enum TokenType {
  RawMaterial = 0,
  Product = 1,
}

export interface User {
  userAddress: string;
  role: UserRole;
  status: UserStatus;
  name: string;
  metadata: string;
  registrationDate: bigint;
}

export interface Token {
  id: bigint;
  owner: string;
  tokenType: TokenType;
  name: string;
  description: string;
  metadata: string;
  parentTokens: bigint[];
  creationDate: bigint;
  exists: boolean;
}

export interface Transfer {
  id: bigint;
  tokenId: bigint;
  from: string;
  to: string;
  status: TransferStatus;
  message: string;
  timestamp: bigint;
  exists: boolean;
}

export interface ContractConfig {
  address: string;
  abi: any[];
}

