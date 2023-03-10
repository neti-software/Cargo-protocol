## GUniPool

### Minted

```solidity
event Minted(address receiver, uint256 mintAmount, uint256 amount0In, uint256 amount1In, uint128 liquidityMinted)
```

### Burned

```solidity
event Burned(address receiver, uint256 burnAmount, uint256 amount0Out, uint256 amount1Out, uint128 liquidityBurned)
```

### Rebalance

```solidity
event Rebalance(int24 lowerTick_, int24 upperTick_, uint128 liquidityBefore, uint128 liquidityAfter)
```

### FeesEarned

```solidity
event FeesEarned(uint256 feesEarned0, uint256 feesEarned1)
```

### constructor

```solidity
constructor(address payable _gelato) public
```

### uniswapV3MintCallback

```solidity
function uniswapV3MintCallback(uint256 amount0Owed, uint256 amount1Owed, bytes) external
```

Uniswap V3 callback fn, called back on pool.mint

### uniswapV3SwapCallback

```solidity
function uniswapV3SwapCallback(int256 amount0Delta, int256 amount1Delta, bytes) external
```

Uniswap v3 callback fn, called back on pool.swap

### mint

```solidity
function mint(uint256 mintAmount, address receiver) external returns (uint256 amount0, uint256 amount1, uint128 liquidityMinted)
```

mint fungible G-UNI tokens, fractional shares of a Uniswap V3 position

_to compute the amouint of tokens necessary to mint `mintAmount` see getMintAmounts_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| mintAmount | uint256 | The number of G-UNI tokens to mint |
| receiver | address | The account to receive the minted tokens |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | amount of token0 transferred from msg.sender to mint `mintAmount` |
| amount1 | uint256 | amount of token1 transferred from msg.sender to mint `mintAmount` |
| liquidityMinted | uint128 | amount of liquidity added to the underlying Uniswap V3 position |

### burn

```solidity
function burn(uint256 burnAmount, address receiver) external returns (uint256 amount0, uint256 amount1, uint128 liquidityBurned)
```

burn G-UNI tokens (fractional shares of a Uniswap V3 position) and receive tokens

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| burnAmount | uint256 | The number of G-UNI tokens to burn |
| receiver | address | The account to receive the underlying amounts of token0 and token1 |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | amount of token0 transferred to receiver for burning `burnAmount` |
| amount1 | uint256 | amount of token1 transferred to receiver for burning `burnAmount` |
| liquidityBurned | uint128 | amount of liquidity removed from the underlying Uniswap V3 position |

### executiveRebalance

```solidity
function executiveRebalance(int24 newLowerTick, int24 newUpperTick, uint160 swapThresholdPrice, uint256 swapAmountBPS, bool zeroForOne) external
```

Change the range of underlying UniswapV3 position, only manager can call

_When changing the range the inventory of token0 and token1 may be rebalanced
with a swap to deposit as much liquidity as possible into the new position. Swap parameters
can be computed by simulating the whole operation: remove all liquidity, deposit as much
as possible into new position, then observe how much of token0 or token1 is leftover.
Swap a proportion of this leftover to deposit more liquidity into the position, since
any leftover will be unused and sit idle until the next rebalance._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| newLowerTick | int24 | The new lower bound of the position's range |
| newUpperTick | int24 | The new upper bound of the position's range |
| swapThresholdPrice | uint160 | slippage parameter on the swap as a max or min sqrtPriceX96 |
| swapAmountBPS | uint256 | amount of token to swap as proportion of total. Pass 0 to ignore swap. |
| zeroForOne | bool | Which token to input into the swap (true = token0, false = token1) |

### rebalance

```solidity
function rebalance(uint160 swapThresholdPrice, uint256 swapAmountBPS, bool zeroForOne, uint256 feeAmount, address paymentToken) external
```

Reinvest fees earned into underlying position, only gelato executors can call
Position bounds CANNOT be altered by gelato, only manager may via executiveRebalance.
Frequency of rebalance configured with gelatoRebalanceBPS, alterable by manager.

### withdrawManagerBalance

```solidity
function withdrawManagerBalance(uint256 feeAmount, address feeToken) external
```

withdraw manager fees accrued, only gelato executors can call.
Target account to receive fees is managerTreasury, alterable by manager.
Frequency of withdrawals configured with gelatoWithdrawBPS, alterable by manager.

### withdrawGelatoBalance

```solidity
function withdrawGelatoBalance(uint256 feeAmount, address feeToken) external
```

withdraw gelato fees accrued, only gelato executors can call.
Frequency of withdrawals configured with gelatoWithdrawBPS, alterable by manager.

### _balancesToWithdraw

```solidity
function _balancesToWithdraw(uint256 balance0, uint256 balance1, uint256 feeAmount, address feeToken) internal view returns (uint256 amount0, uint256 amount1)
```

### getMintAmounts

```solidity
function getMintAmounts(uint256 amount0Max, uint256 amount1Max) external view returns (uint256 amount0, uint256 amount1, uint256 mintAmount)
```

compute maximum G-UNI tokens that can be minted from `amount0Max` and `amount1Max`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0Max | uint256 | The maximum amount of token0 to forward on mint |
| amount1Max | uint256 |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | actual amount of token0 to forward when minting `mintAmount` |
| amount1 | uint256 | actual amount of token1 to forward when minting `mintAmount` |
| mintAmount | uint256 | maximum number of G-UNI tokens to mint |

### getUnderlyingBalances

```solidity
function getUnderlyingBalances() public view returns (uint256 amount0Current, uint256 amount1Current)
```

compute total underlying holdings of the G-UNI token supply
includes current liquidity invested in uniswap position, current fees earned
and any uninvested leftover (but does not include manager or gelato fees accrued)

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0Current | uint256 | current total underlying balance of token0 |
| amount1Current | uint256 | current total underlying balance of token1 |

### getUnderlyingBalancesAtPrice

```solidity
function getUnderlyingBalancesAtPrice(uint160 sqrtRatioX96) external view returns (uint256 amount0Current, uint256 amount1Current)
```

### _getUnderlyingBalances

```solidity
function _getUnderlyingBalances(uint160 sqrtRatioX96, int24 tick) internal view returns (uint256 amount0Current, uint256 amount1Current)
```

### _rebalance

```solidity
function _rebalance(uint128 liquidity, uint160 swapThresholdPrice, uint256 swapAmountBPS, bool zeroForOne, uint256 feeAmount, address paymentToken) private
```

### _withdraw

```solidity
function _withdraw(int24 lowerTick_, int24 upperTick_, uint128 liquidity) private returns (uint256 burn0, uint256 burn1, uint256 fee0, uint256 fee1)
```

### _deposit

```solidity
function _deposit(int24 lowerTick_, int24 upperTick_, uint256 amount0, uint256 amount1, uint160 swapThresholdPrice, uint256 swapAmountBPS, bool zeroForOne) private
```

### _swapAndDeposit

```solidity
function _swapAndDeposit(int24 lowerTick_, int24 upperTick_, uint256 amount0, uint256 amount1, int256 swapAmount, uint160 swapThresholdPrice, bool zeroForOne) private returns (uint256 finalAmount0, uint256 finalAmount1)
```

### _computeMintAmounts

```solidity
function _computeMintAmounts(uint256 totalSupply, uint256 amount0Max, uint256 amount1Max) private view returns (uint256 amount0, uint256 amount1, uint256 mintAmount)
```

### _computeFeesEarned

```solidity
function _computeFeesEarned(bool isZero, uint256 feeGrowthInsideLast, int24 tick, uint128 liquidity) private view returns (uint256 fee)
```

### _applyFees

```solidity
function _applyFees(uint256 _fee0, uint256 _fee1) private
```

### _subtractAdminFees

```solidity
function _subtractAdminFees(uint256 rawFee0, uint256 rawFee1) private view returns (uint256 fee0, uint256 fee1)
```

### _checkSlippage

```solidity
function _checkSlippage(uint160 swapThresholdPrice, bool zeroForOne) private view
```
