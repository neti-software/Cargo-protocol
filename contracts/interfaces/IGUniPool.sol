//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {
    IUniswapV3Pool
} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

interface IGUniPool {

    function token0() external view returns (IERC20);

    function token1() external view returns (IERC20);

    function upperTick() external view returns (int24);

    function lowerTick() external view returns (int24);

    function pool() external view returns (IUniswapV3Pool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

function mint(
        uint256 mintAmount, 
        address receiver)  
        external   
        returns (
            uint256 amount0,
            uint256 amount1,
            uint128 liquidityMinted
        );
function burn(
        uint256 burnAmount, 
        address receiver) 
        external  
        returns ( 
            uint256 amount0, 
            uint256 amount1, 
            uint128 liquidityBurned
        );
function executiveRebalance(
        int24 newLowerTick,
        int24 newUpperTick,
        uint160 swapThresholdPrice,
        uint256 swapAmountBPS,
        bool zeroForOne
    ) external;

    function rebalance(
        uint160 swapThresholdPrice,
        uint256 swapAmountBPS,
        bool zeroForOne,
        uint256 feeAmount,
        address paymentToken
    ) external;

    function getUnderlyingBalances()
        external
        view
        returns (
            uint256 amount0Current, 
            uint256 amount1Current
        );

}

