//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;


interface IcargoFactory {
    function upgradePools(address[] memory pools) external;
    function getPools(address deployer) external returns (address[] memory);
    function getDeployers() external view returns (address[] memory);
}
