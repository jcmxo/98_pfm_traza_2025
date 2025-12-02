// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {SupplyChain} from "../src/SupplyChain.sol";

contract SupplyChainTest is Test {
    SupplyChain public supplyChain;
    
    address public admin;
    address public producer;
    address public factory;
    address public retailer;
    address public consumer;
    
    function setUp() public {
        admin = address(this);
        producer = address(0x1);
        factory = address(0x2);
        retailer = address(0x3);
        consumer = address(0x4);
        
        supplyChain = new SupplyChain();
    }
    
    // ============ USER REGISTRATION TESTS ============
    
    function test_AdminIsAutoRegistered() public {
        (address userAddress, SupplyChain.UserRole role, SupplyChain.UserStatus status,,,) = 
            supplyChain.users(admin);
        
        assertEq(userAddress, admin);
        assertEq(uint8(role), uint8(SupplyChain.UserRole.Admin));
        assertEq(uint8(status), uint8(SupplyChain.UserStatus.Approved));
    }
    
    function test_RegisterProducer() public {
        vm.prank(producer);
        supplyChain.registerUser(
            SupplyChain.UserRole.Producer,
            "Test Producer",
            "{}"
        );
        
        (address userAddress, SupplyChain.UserRole role, SupplyChain.UserStatus status, string memory name,,) = 
            supplyChain.users(producer);
        
        assertEq(userAddress, producer);
        assertEq(uint8(role), uint8(SupplyChain.UserRole.Producer));
        assertEq(uint8(status), uint8(SupplyChain.UserStatus.Pending));
        assertEq(name, "Test Producer");
    }
    
    function test_ApproveUser() public {
        // Registrar usuario
        vm.prank(producer);
        supplyChain.registerUser(
            SupplyChain.UserRole.Producer,
            "Test Producer",
            "{}"
        );
        
        // Aprobar usuario
        supplyChain.approveUser(producer, true);
        
        (,, SupplyChain.UserStatus status,,,) = supplyChain.users(producer);
        assertEq(uint8(status), uint8(SupplyChain.UserStatus.Approved));
    }
    
    function test_RejectUser() public {
        // Registrar usuario
        vm.prank(producer);
        supplyChain.registerUser(
            SupplyChain.UserRole.Producer,
            "Test Producer",
            "{}"
        );
        
        // Rechazar usuario
        supplyChain.approveUser(producer, false);
        
        (,, SupplyChain.UserStatus status,,,) = supplyChain.users(producer);
        assertEq(uint8(status), uint8(SupplyChain.UserStatus.Rejected));
    }
    
    // ============ TOKEN CREATION TESTS ============
    
    function test_CreateRawMaterial() public {
        // Registrar y aprobar Producer
        vm.prank(producer);
        supplyChain.registerUser(
            SupplyChain.UserRole.Producer,
            "Test Producer",
            "{}"
        );
        supplyChain.approveUser(producer, true);
        
        // Crear materia prima
        vm.prank(producer);
        uint256 tokenId = supplyChain.createToken(
            SupplyChain.TokenType.RawMaterial,
            "Wheat",
            "Organic wheat",
            "{}",
            new uint256[](0)
        );
        
        assertEq(tokenId, 1);
        
        (uint256 id, address owner, SupplyChain.TokenType tokenType, string memory name,,,uint256 creationDate, bool exists) = 
            supplyChain.tokens(tokenId);
        
        assertEq(id, 1);
        assertEq(owner, producer);
        assertEq(uint8(tokenType), uint8(SupplyChain.TokenType.RawMaterial));
        assertEq(name, "Wheat");
        assertTrue(exists);
    }
    
    function test_FactoryCannotCreateRawMaterial() public {
        // Registrar y aprobar Factory
        vm.prank(factory);
        supplyChain.registerUser(
            SupplyChain.UserRole.Factory,
            "Test Factory",
            "{}"
        );
        supplyChain.approveUser(factory, true);
        
        // Intentar crear materia prima (debe fallar)
        vm.prank(factory);
        vm.expectRevert("Only Producer can create raw materials");
        supplyChain.createToken(
            SupplyChain.TokenType.RawMaterial,
            "Wheat",
            "Organic wheat",
            "{}",
            new uint256[](0)
        );
    }
    
    function test_CreateProduct() public {
        // Setup: Producer y Factory aprobados
        vm.prank(producer);
        supplyChain.registerUser(SupplyChain.UserRole.Producer, "Producer", "{}");
        supplyChain.approveUser(producer, true);
        
        vm.prank(factory);
        supplyChain.registerUser(SupplyChain.UserRole.Factory, "Factory", "{}");
        supplyChain.approveUser(factory, true);
        
        // Producer crea materia prima
        vm.prank(producer);
        uint256 rawMaterialId = supplyChain.createToken(
            SupplyChain.TokenType.RawMaterial,
            "Wheat",
            "Organic wheat",
            "{}",
            new uint256[](0)
        );
        
        // Transferir a Factory
        vm.prank(producer);
        uint256 transferId = supplyChain.createTransfer(rawMaterialId, factory, "");
        
        vm.prank(factory);
        supplyChain.acceptTransfer(transferId);
        
        // Factory crea producto
        uint256[] memory parentTokens = new uint256[](1);
        parentTokens[0] = rawMaterialId;
        
        vm.prank(factory);
        uint256 productId = supplyChain.createToken(
            SupplyChain.TokenType.Product,
            "Bread",
            "Fresh bread",
            "{}",
            parentTokens
        );
        
        assertEq(productId, 2);
        
        (,, SupplyChain.TokenType tokenType,,,,,) = supplyChain.tokens(productId);
        assertEq(uint8(tokenType), uint8(SupplyChain.TokenType.Product));
    }
    
    // ============ TRANSFER TESTS ============
    
    function test_CompleteTransferFlow() public {
        // Setup: Registrar y aprobar todos los usuarios
        vm.prank(producer);
        supplyChain.registerUser(SupplyChain.UserRole.Producer, "Producer", "{}");
        supplyChain.approveUser(producer, true);
        
        vm.prank(factory);
        supplyChain.registerUser(SupplyChain.UserRole.Factory, "Factory", "{}");
        supplyChain.approveUser(factory, true);
        
        // Producer crea token
        vm.prank(producer);
        uint256 tokenId = supplyChain.createToken(
            SupplyChain.TokenType.RawMaterial,
            "Wheat",
            "Organic wheat",
            "{}",
            new uint256[](0)
        );
        
        // Crear transferencia
        vm.prank(producer);
        uint256 transferId = supplyChain.createTransfer(tokenId, factory, "Transfer to factory");
        
        // Verificar que la transferencia está pendiente
        (,, address from, address to, SupplyChain.TransferStatus status,,,) = 
            supplyChain.transfers(transferId);
        
        assertEq(from, producer);
        assertEq(to, factory);
        assertEq(uint8(status), uint8(SupplyChain.TransferStatus.Pending));
        
        // Factory acepta la transferencia
        vm.prank(factory);
        supplyChain.acceptTransfer(transferId);
        
        // Verificar que el token ahora pertenece a Factory
        (, address owner,,,,,,) = supplyChain.tokens(tokenId);
        assertEq(owner, factory);
        
        // Verificar que la transferencia fue aceptada
        (,,,, SupplyChain.TransferStatus finalStatus,,,) = supplyChain.transfers(transferId);
        assertEq(uint8(finalStatus), uint8(SupplyChain.TransferStatus.Accepted));
    }
    
    function test_ProducerCannotTransferToRetailer() public {
        // Setup
        vm.prank(producer);
        supplyChain.registerUser(SupplyChain.UserRole.Producer, "Producer", "{}");
        supplyChain.approveUser(producer, true);
        
        vm.prank(retailer);
        supplyChain.registerUser(SupplyChain.UserRole.Retailer, "Retailer", "{}");
        supplyChain.approveUser(retailer, true);
        
        // Producer crea token
        vm.prank(producer);
        uint256 tokenId = supplyChain.createToken(
            SupplyChain.TokenType.RawMaterial,
            "Wheat",
            "Organic wheat",
            "{}",
            new uint256[](0)
        );
        
        // Intentar transferir a Retailer (debe fallar)
        vm.prank(producer);
        vm.expectRevert("Producer can only transfer to Factory");
        supplyChain.createTransfer(tokenId, retailer, "");
    }
    
    // ============ TRACEABILITY TESTS ============
    
    function test_GetTokenTraceability() public {
        // Setup
        vm.prank(producer);
        supplyChain.registerUser(SupplyChain.UserRole.Producer, "Producer", "{}");
        supplyChain.approveUser(producer, true);
        
        vm.prank(factory);
        supplyChain.registerUser(SupplyChain.UserRole.Factory, "Factory", "{}");
        supplyChain.approveUser(factory, true);
        
        // Crear materia prima
        vm.prank(producer);
        uint256 rawMaterialId = supplyChain.createToken(
            SupplyChain.TokenType.RawMaterial,
            "Wheat",
            "Organic wheat",
            "{}",
            new uint256[](0)
        );
        
        // Transferir a Factory
        vm.prank(producer);
        uint256 transferId = supplyChain.createTransfer(rawMaterialId, factory, "");
        vm.prank(factory);
        supplyChain.acceptTransfer(transferId);
        
        // Crear producto
        uint256[] memory parentTokens = new uint256[](1);
        parentTokens[0] = rawMaterialId;
        
        vm.prank(factory);
        uint256 productId = supplyChain.createToken(
            SupplyChain.TokenType.Product,
            "Bread",
            "Fresh bread",
            "{}",
            parentTokens
        );
        
        // Obtener trazabilidad
        uint256[] memory trace = supplyChain.getTokenTraceability(productId);
        
        assertEq(trace.length, 2);
        assertEq(trace[0], productId);
        assertEq(trace[1], rawMaterialId);
    }
}

