// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title SupplyChain
 * @dev Sistema de trazabilidad de cadena de suministro con roles y tokens
 */
contract SupplyChain {
    // ============ ENUMS ============
    
    enum UserRole {
        None,
        Producer,
        Factory,
        Retailer,
        Consumer,
        Admin
    }
    
    enum UserStatus {
        Pending,
        Approved,
        Rejected
    }
    
    enum TransferStatus {
        Pending,
        Accepted,
        Rejected
    }
    
    enum TokenType {
        RawMaterial,  // Materia prima
        Product       // Producto terminado
    }
    
    // ============ STRUCTS ============
    
    struct User {
        address userAddress;
        UserRole role;
        UserStatus status;
        string name;
        string metadata;
        uint256 registrationDate;
    }
    
    struct Token {
        uint256 id;
        address owner;
        TokenType tokenType;
        string name;
        string description;
        string metadata;
        uint256[] parentTokens; // IDs de tokens padre (para productos derivados)
        uint256 creationDate;
        bool exists;
    }
    
    struct Transfer {
        uint256 id;
        uint256 tokenId;
        address from;
        address to;
        TransferStatus status;
        string message;
        uint256 timestamp;
        bool exists;
    }
    
    // ============ STATE VARIABLES ============
    
    address public admin;
    uint256 public tokenCounter;
    uint256 public transferCounter;
    
    mapping(address => User) public users;
    mapping(uint256 => Token) public tokens;
    mapping(uint256 => Transfer) public transfers;
    mapping(address => uint256[]) public userTokens;
    mapping(address => uint256[]) public pendingTransfers;
    
    // ============ EVENTS ============
    
    event UserRegistered(address indexed user, UserRole role, string name);
    event UserStatusChanged(address indexed user, UserStatus status);
    event TokenCreated(uint256 indexed tokenId, address indexed owner, TokenType tokenType, string name);
    event TransferCreated(uint256 indexed transferId, uint256 indexed tokenId, address indexed from, address to);
    event TransferStatusChanged(uint256 indexed transferId, TransferStatus status);
    event TokenTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    
    // ============ MODIFIERS ============
    
    modifier onlyAdmin() {
        require(
            users[msg.sender].role == UserRole.Admin && 
            users[msg.sender].status == UserStatus.Approved,
            "Only admin can perform this action"
        );
        _;
    }
    
    modifier onlyApprovedUser() {
        require(
            users[msg.sender].status == UserStatus.Approved,
            "User must be approved"
        );
        _;
    }
    
    modifier validRole(UserRole role) {
        require(role != UserRole.None && role != UserRole.Admin, "Invalid role");
        _;
    }
    
    modifier tokenExists(uint256 tokenId) {
        require(tokens[tokenId].exists, "Token does not exist");
        _;
    }
    
    modifier transferExists(uint256 transferId) {
        require(transfers[transferId].exists, "Transfer does not exist");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        admin = msg.sender;
        tokenCounter = 0;
        transferCounter = 0;
        
        // Registrar el admin automáticamente
        users[admin] = User({
            userAddress: admin,
            role: UserRole.Admin,
            status: UserStatus.Approved,
            name: "System Admin",
            metadata: "",
            registrationDate: block.timestamp
        });
        
        emit UserRegistered(admin, UserRole.Admin, "System Admin");
    }
    
    // ============ USER MANAGEMENT ============
    
    /**
     * @dev Registra un nuevo usuario con un rol específico
     * @param role Rol solicitado por el usuario
     * @param name Nombre del usuario
     * @param metadata Metadatos adicionales
     */
    function registerUser(
        UserRole role,
        string memory name,
        string memory metadata
    ) external validRole(role) {
        require(users[msg.sender].userAddress == address(0), "User already registered");
        
        users[msg.sender] = User({
            userAddress: msg.sender,
            role: role,
            status: UserStatus.Pending,
            name: name,
            metadata: metadata,
            registrationDate: block.timestamp
        });
        
        emit UserRegistered(msg.sender, role, name);
    }
    
    /**
     * @dev Aprueba o rechaza un usuario (solo admin)
     * @param userAddress Dirección del usuario a aprobar/rechazar
     * @param approved true para aprobar, false para rechazar
     */
    function approveUser(address userAddress, bool approved) external onlyAdmin {
        require(users[userAddress].userAddress != address(0), "User does not exist");
        require(users[userAddress].status == UserStatus.Pending, "User status is not pending");
        
        users[userAddress].status = approved ? UserStatus.Approved : UserStatus.Rejected;
        
        emit UserStatusChanged(userAddress, users[userAddress].status);
    }
    
    /**
     * @dev Obtiene información de un usuario
     * @param userAddress Dirección del usuario
     * @return User struct con la información del usuario
     */
    function getUser(address userAddress) external view returns (User memory) {
        return users[userAddress];
    }
    
    // ============ TOKEN MANAGEMENT ============
    
    /**
     * @dev Crea un nuevo token (materia prima o producto)
     * @param tokenType Tipo de token (RawMaterial o Product)
     * @param name Nombre del token
     * @param description Descripción del token
     * @param metadata Metadatos adicionales (JSON string)
     * @param parentTokenIds IDs de tokens padre (vacío para materias primas)
     * @return tokenId ID del token creado
     */
    function createToken(
        TokenType tokenType,
        string memory name,
        string memory description,
        string memory metadata,
        uint256[] memory parentTokenIds
    ) external onlyApprovedUser returns (uint256) {
        UserRole userRole = users[msg.sender].role;
        
        // Validar permisos según el tipo de token
        if (tokenType == TokenType.RawMaterial) {
            require(
                userRole == UserRole.Producer || userRole == UserRole.Admin,
                "Only Producer or Admin can create raw materials"
            );
        } else if (tokenType == TokenType.Product) {
            require(userRole == UserRole.Factory, "Only Factory can create products");
            require(parentTokenIds.length > 0, "Products must have parent tokens");
            
            // Validar que todos los tokens padre existen y pertenecen al Factory
            for (uint256 i = 0; i < parentTokenIds.length; i++) {
                require(tokens[parentTokenIds[i]].exists, "Parent token does not exist");
                require(tokens[parentTokenIds[i]].owner == msg.sender, "You don't own the parent token");
            }
        }
        
        tokenCounter++;
        uint256 tokenId = tokenCounter;
        
        tokens[tokenId] = Token({
            id: tokenId,
            owner: msg.sender,
            tokenType: tokenType,
            name: name,
            description: description,
            metadata: metadata,
            parentTokens: parentTokenIds,
            creationDate: block.timestamp,
            exists: true
        });
        
        userTokens[msg.sender].push(tokenId);
        
        emit TokenCreated(tokenId, msg.sender, tokenType, name);
        
        return tokenId;
    }
    
    /**
     * @dev Obtiene información de un token
     * @param tokenId ID del token
     * @return Token struct con la información del token
     */
    function getToken(uint256 tokenId) external view tokenExists(tokenId) returns (Token memory) {
        return tokens[tokenId];
    }
    
    /**
     * @dev Obtiene todos los tokens de un usuario
     * @param userAddress Dirección del usuario
     * @return Array de IDs de tokens
     */
    function getUserTokens(address userAddress) external view returns (uint256[] memory) {
        return userTokens[userAddress];
    }
    
    // ============ TRANSFER MANAGEMENT ============
    
    /**
     * @dev Crea una solicitud de transferencia
     * @param tokenId ID del token a transferir
     * @param to Dirección del destinatario
     * @param message Mensaje opcional
     * @return transferId ID de la transferencia creada
     */
    function createTransfer(
        uint256 tokenId,
        address to,
        string memory message
    ) external onlyApprovedUser tokenExists(tokenId) returns (uint256) {
        require(tokens[tokenId].owner == msg.sender, "You don't own this token");
        require(users[to].status == UserStatus.Approved, "Recipient must be approved");
        
        UserRole fromRole = users[msg.sender].role;
        UserRole toRole = users[to].role;
        
        // Validar flujo de transferencias según roles
        if (fromRole == UserRole.Producer) {
            require(toRole == UserRole.Factory, "Producer can only transfer to Factory");
        } else if (fromRole == UserRole.Factory) {
            require(toRole == UserRole.Retailer, "Factory can only transfer to Retailer");
        } else if (fromRole == UserRole.Retailer) {
            require(toRole == UserRole.Consumer, "Retailer can only transfer to Consumer");
        } else {
            revert("Invalid transfer flow");
        }
        
        transferCounter++;
        uint256 transferId = transferCounter;
        
        transfers[transferId] = Transfer({
            id: transferId,
            tokenId: tokenId,
            from: msg.sender,
            to: to,
            status: TransferStatus.Pending,
            message: message,
            timestamp: block.timestamp,
            exists: true
        });
        
        pendingTransfers[to].push(transferId);
        
        emit TransferCreated(transferId, tokenId, msg.sender, to);
        
        return transferId;
    }
    
    /**
     * @dev Acepta una transferencia pendiente
     * @param transferId ID de la transferencia
     */
    function acceptTransfer(uint256 transferId) external onlyApprovedUser transferExists(transferId) {
        Transfer storage transfer = transfers[transferId];
        
        require(transfer.to == msg.sender, "You are not the recipient");
        require(transfer.status == TransferStatus.Pending, "Transfer is not pending");
        
        transfer.status = TransferStatus.Accepted;
        
        // Transferir el token
        Token storage token = tokens[transfer.tokenId];
        address previousOwner = token.owner;
        
        // Remover token de la lista del propietario anterior
        _removeTokenFromUser(previousOwner, transfer.tokenId);
        
        // Agregar token a la lista del nuevo propietario
        token.owner = msg.sender;
        userTokens[msg.sender].push(transfer.tokenId);
        
        // Remover transferencia de pendientes
        _removeTransferFromPending(msg.sender, transferId);
        
        emit TransferStatusChanged(transferId, TransferStatus.Accepted);
        emit TokenTransferred(transfer.tokenId, previousOwner, msg.sender);
    }
    
    /**
     * @dev Rechaza una transferencia pendiente
     * @param transferId ID de la transferencia
     */
    function rejectTransfer(uint256 transferId) external onlyApprovedUser transferExists(transferId) {
        Transfer storage transfer = transfers[transferId];
        
        require(transfer.to == msg.sender, "You are not the recipient");
        require(transfer.status == TransferStatus.Pending, "Transfer is not pending");
        
        transfer.status = TransferStatus.Rejected;
        
        // Remover transferencia de pendientes
        _removeTransferFromPending(msg.sender, transferId);
        
        emit TransferStatusChanged(transferId, TransferStatus.Rejected);
    }
    
    /**
     * @dev Obtiene información de una transferencia
     * @param transferId ID de la transferencia
     * @return Transfer struct con la información
     */
    function getTransfer(uint256 transferId) external view transferExists(transferId) returns (Transfer memory) {
        return transfers[transferId];
    }
    
    /**
     * @dev Obtiene todas las transferencias pendientes de un usuario
     * @param userAddress Dirección del usuario
     * @return Array de IDs de transferencias pendientes
     */
    function getPendingTransfers(address userAddress) external view returns (uint256[] memory) {
        return pendingTransfers[userAddress];
    }
    
    // ============ HELPER FUNCTIONS ============
    
    /**
     * @dev Remueve un token de la lista de tokens de un usuario
     */
    function _removeTokenFromUser(address userAddress, uint256 tokenId) private {
        uint256[] storage tokensList = userTokens[userAddress];
        for (uint256 i = 0; i < tokensList.length; i++) {
            if (tokensList[i] == tokenId) {
                tokensList[i] = tokensList[tokensList.length - 1];
                tokensList.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Remueve una transferencia de la lista de pendientes
     */
    function _removeTransferFromPending(address userAddress, uint256 transferId) private {
        uint256[] storage transfersList = pendingTransfers[userAddress];
        for (uint256 i = 0; i < transfersList.length; i++) {
            if (transfersList[i] == transferId) {
                transfersList[i] = transfersList[transfersList.length - 1];
                transfersList.pop();
                break;
            }
        }
    }
    
    // ============ TRACEABILITY ============
    
    /**
     * @dev Obtiene la trazabilidad completa de un token (todos sus ancestros)
     * @param tokenId ID del token
     * @return Array de IDs de tokens en la cadena de trazabilidad
     */
    function getTokenTraceability(uint256 tokenId) external view tokenExists(tokenId) returns (uint256[] memory) {
        uint256[] memory trace = new uint256[](100); // Máximo 100 niveles
        uint256 traceLength = 0;
        
        uint256 currentTokenId = tokenId;
        
        while (tokens[currentTokenId].exists && traceLength < 100) {
            trace[traceLength] = currentTokenId;
            traceLength++;
            
            if (tokens[currentTokenId].parentTokens.length == 0) {
                break;
            }
            
            // Tomar el primer token padre (simplificado)
            currentTokenId = tokens[currentTokenId].parentTokens[0];
        }
        
        // Crear array del tamaño correcto
        uint256[] memory result = new uint256[](traceLength);
        for (uint256 i = 0; i < traceLength; i++) {
            result[i] = trace[i];
        }
        
        return result;
    }
}

