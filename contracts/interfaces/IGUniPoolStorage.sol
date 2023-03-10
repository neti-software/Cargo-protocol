// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.4;
import {
    IUniswapV3Pool
} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

interface IGUniPoolStorage {
    function initialize(
        string memory _name,
        string memory _symbol,
        address _pool,
        uint16 _managerFeeBPS,
        int24 _lowerTick,
        int24 _upperTick,
        address _manager_
    ) external;
    
    function pool() external returns(IUniswapV3Pool);
}
