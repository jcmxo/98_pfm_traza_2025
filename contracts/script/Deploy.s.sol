// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script, console} from "forge-std/Script.sol";
import {SupplyChain} from "../src/SupplyChain.sol";

contract DeployScript is Script {
    function run() external returns (SupplyChain) {
        vm.startBroadcast();
        
        SupplyChain supplyChain = new SupplyChain();
        
        console.log("SupplyChain deployed at:", address(supplyChain));
        console.log("Admin address:", supplyChain.admin());
        
        vm.stopBroadcast();
        
        return supplyChain;
    }
}

