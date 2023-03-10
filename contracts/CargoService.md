## CargoService

### ADMIN

```solidity
bytes32 ADMIN
```

### BOT

```solidity
bytes32 BOT
```

### bot

```solidity
address bot
```

### celoToken

```solidity
address celoToken
```

### multisig

```solidity
address multisig
```

### cargoFactory

```solidity
contract IGUniFactory cargoFactory
```

### RebalanceTickRange

```solidity
event RebalanceTickRange(address cargoContract, int24 newLowerTick, int24 newUpperTick, bool zeroForOne, uint160 swapThresholdPrice)
```

### Deposit

```solidity
event Deposit(address cargoContract, uint256 amount0, uint256 amount1, uint256 liquidityMinted)
```

### Withdraw

```solidity
event Withdraw(address cargoContract, uint256 amount0, uint256 amount1, uint256 liquidityBurned)
```

### CreateManagedPool

```solidity
event CreateManagedPool(address createdPool)
```

### gainLeftoveer

```solidity
event gainLeftoveer(uint256 leftover0, uint256 leftover1)
```

### onlyMultiSig

```solidity
modifier onlyMultiSig()
```

### isBotOrMultiSig

```solidity
modifier isBotOrMultiSig()
```

### cargoFactoryNotZero

```solidity
modifier cargoFactoryNotZero()
```


#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _multisig | address | Multisignature Contract Address |
| _celoToken | address | Address of the Celo Token (Depending if its Mainnet or Testnet) |

### setCargoFactory

```solidity
function setCargoFactory(address _cargoFactory) external
```

_Set GUni-Factory function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cargoFactory | address | address of the GUni-Factory |

### GUniCurrent

```solidity
function GUniCurrent(address _guniPool) external view returns (uint256 _amount0Current, uint256 _amount1Current, uint256 _totalSupply)
```

_Returns the amounts from underlyingBalances_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _guniPool | address | Pool-Address to get the underlying balance |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount0Current | uint256 | underlyingBalance of the first token |
| _amount1Current | uint256 | underlyingBalance of the secondToken |
| _totalSupply | uint256 | totalsupply of the Pool |

### getMintLiquidity

```solidity
function getMintLiquidity(uint256 _amount0, uint256 _amount1, address _guniPool) external view returns (uint256 _maxMintLiqAmount0, uint256 _maxMintLiqAmount1)
```

_function calculates the mintLiquidity on specific pool with amounts_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount0 | uint256 | amount of the first token |
| _amount1 | uint256 | amount of the second token |
| _guniPool | address | Pool-Address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _maxMintLiqAmount0 | uint256 | maximal mint liquidity amount for first token |
| _maxMintLiqAmount1 | uint256 | maximal mint liquidity amount for second token |

### setBotAddress

```solidity
function setBotAddress(address _bot) external
```

_function grants the Role for Bot_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _bot | address | address from which will the bot sending calls |

### collectExecuteFee

```solidity
function collectExecuteFee(address _token, address _to, uint256 _amount) external
```

_Function to send the collected fees for executing functions on contracts_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _token | address | address of the fee token to collect |
| _to | address | address who will recive the fee |
| _amount | uint256 | amount |

### guniAmountForLiquidity

```solidity
function guniAmountForLiquidity(uint256 _mintAmount, address _guniPool) internal view returns (uint256 _amount0, uint256 _amount1)
```

_Function which calculates the actual liquidity for each token based on the mint amount_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _mintAmount | uint256 | address of the second pair token from UniswapV3Pool |
| _guniPool | address | cargoPool(GUni-Pool) Address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount0 | uint256 | actual amount of first token after calculations |
| _amount1 | uint256 | actual amount of second token after calculations |

### deposit

```solidity
function deposit(address _cargoPool, address _token0, address _token1, uint256 _liquidity) external returns (uint256 amount0, uint256 amount1, uint128 liquidityMinted)
```

The GUniPool CLP token will be send back to msg.sender, along with the token excess

_Function which deposits caller money into the GUniPool the excessed amount will be send back to User_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cargoPool | address | cargoPool Address |
| _token0 | address | address of the first pair token from UniswapV3Pool |
| _token1 | address | address of the second pair token from UniswapV3Pool |
| _liquidity | uint256 | mintAmount for supplying to |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | actual amount of first token pulled |
| amount1 | uint256 | actual amount of second token pulled |
| liquidityMinted | uint128 | actual amount of Minted Liquidity |

### withdraw

```solidity
function withdraw(address _cargoPool, uint256 _liquidity) external returns (uint256 amount0, uint256 amount1, uint128 liquidityBurned)
```

_Function to withdraw caller liquidity from the GUni Pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cargoPool | address | Address of CargoPool |
| _liquidity | uint256 | liqudity to withdraw |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | amount of first token burned |
| amount1 | uint256 | amount of second token burned |
| liquidityBurned | uint128 | actual amount of Burned Liquidity |

### getBalanceOfCargoPool

```solidity
function getBalanceOfCargoPool(address _cargoPool) public view returns (uint256 amount)
```

_Returns the Balance of Cargo_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cargoPool | address | address of the GUni-Pool |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | the cargo Balance |

### getTokensAmount

```solidity
function getTokensAmount(address _cargoPool) public view returns (uint256 amount0, uint256 amount1, uint256 liquidity)
```

_Returns the Token Amount from Pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cargoPool | address | address of the GUni-Pool |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount0 | uint256 | amount of the first token |
| amount1 | uint256 | amount of the second token |
| liquidity | uint256 | liquidity |

### reinvestFees

```solidity
function reinvestFees(address _cargoPool, uint256 swapAmountBPS, bool zeroForOne, uint256 feeAmount) external returns (uint256, uint256)
```

The Fee Amount is

_Function to colelct the rewarded Fees and reinvest them in Pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cargoPool | address | CargoPool Address |
| swapAmountBPS | uint256 | amount of token to swap as proportion of total. Pass 0 to ignore swap. |
| zeroForOne | bool | Which token to input into the swap (true = token0, false = token1) |
| feeAmount | uint256 | Amount of Fee collected while reinvesting |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | leftover0 leftover of the first token on the Pool |
| [1] | uint256 | leftover1 leftover of the second token on the Pool |

### createManagedPool

```solidity
function createManagedPool(address tokenA, address tokenB, uint24 uniFee, uint16 managerFee, int24 lowerTick, int24 upperTick) external returns (address pool)
```

_Function which is creating Managed Pools in CargoFactory_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | Address of the frist Token in UniswapV3 |
| tokenB | address | Address of the second Token in UniswapV3 |
| uniFee | uint24 | UniswapV3 fee on the pair |
| managerFee | uint16 | Fee for the manager of the Pool |
| lowerTick | int24 | lower boundry tick where the liqudiity should be pegged |
| upperTick | int24 | upper boundry tick where the liqudiity should be pegged |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | Address of the created Pool |

### changeFactoryManager

```solidity
function changeFactoryManager(address _newManager) external
```

_Function which wraps the CargoFactory into OwnableUninitialized contract and transfers the ownership_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newManager | address | Address of the new Owner |

### setGelatoDeployer

```solidity
function setGelatoDeployer(address _newGelatoDeployer) external
```

this address will be the official "Cargo Pool" Deployer

_Function which sets new Gelate Deployer on the GUniFactory_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newGelatoDeployer | address | Address of the new Gelato Deployer |

### computeFeesEarned

```solidity
function computeFeesEarned(address _cargoPool) external view returns (uint256 fee0, uint256 fee1)
```

_Function which is passing the right data to calcualte the  the actual earned Fees on given Pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cargoPool | address | Address of the pool |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee0 | uint256 | Earned Fee on Token0 |
| fee1 | uint256 | Earned Fee on Token1 |

### _computeFeesEarned

```solidity
function _computeFeesEarned(bool isZero, uint256 feeGrowthInsideLast, int24 tick, uint128 liquidity, address _cargoPool) internal view returns (uint256 fee)
```

_Function which is calculating the actual earned Fees on given Pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| isZero | bool | for which |
| feeGrowthInsideLast | uint256 | number of how much fees have been earned last based on the position |
| tick | int24 | at which Tick is the UniswapPool |
| liquidity | uint128 | amount of liquidity in the position |
| _cargoPool | address | Address of the Cargo Pool |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint256 | earned Fee |

### rebalanceTickRange

```solidity
function rebalanceTickRange(address _cargoPool, int24 newLowerTick, int24 newUpperTick, uint256 swapAmountBPS, bool zeroForOne) external returns (uint256 _leftover0, uint256 _leftover1)
```

_Function which is Rebalancing to new Tick Ranges on CargoPool, can only be called by MultiSig or Bot_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cargoPool | address | Address of the GUni-Pool |
| newLowerTick | int24 | new lower boundry tick where the liqudiity should be repegged |
| newUpperTick | int24 | new upper boundry tick where the liqudiity should be repegged |
| swapAmountBPS | uint256 | amount of token to swap as proportion of total. Pass 0 to ignore swap. |
| zeroForOne | bool | Which token to input into the swap (true = token0, false = token1) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| _leftover0 | uint256 | left over of the first Token after the Rebalance |
| _leftover1 | uint256 | left over of the second Token after the Rebalance |

### _swapTresholPrice

```solidity
function _swapTresholPrice(contract IUniswapV3Pool pool, bool zeroForOne) internal view returns (uint160 swapThresholdPrice, uint160 sqrtPriceX96)
```

_Function to calcualte the SqrtRatioAtTick(swapThresholdPrice) based on the tick and tickspacing in pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | contract IUniswapV3Pool | Address of the GUni-Pool |
| zeroForOne | bool | Which token to input into the swap (true = token0, false = token1) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| swapThresholdPrice | uint160 | calcualted sqrt(1.0001^tick) * 2^96 from the current tick - tickspacing |
| sqrtPriceX96 | uint160 | A Fixed point Q64.96 number representing the sqrt of the ratio of the two assets (token1/token0) |

### changeManagerAddress

```solidity
function changeManagerAddress(address _newManager, address[] _deployers) external
```

_The function changes the manager Address in each pool from given _deployers_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newManager | address | Address of the new manager which should be set up |
| _deployers | address[] | Addresses of the wallets which deployed the pools |

### changePoolImplementation

```solidity
function changePoolImplementation(address _poolImplementation, address[] _deployers) external
```

_The function is changing the Pool implementation Proxy contract in pools of given deployers_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _poolImplementation | address | Address of the new pool implementation which should be set up |
| _deployers | address[] | Addresses of the wallets which deployed the pools |

### getCargoPoolTicks

```solidity
function getCargoPoolTicks(address _cargoPool) external view returns (int24 _lowerTick, int24 _upperTick)
```

_The function is returning the lower and upper tick of given _cargoPool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cargoPool | address | Address of the GUni-Pool |

### _approveTokenIfNeeded

```solidity
function _approveTokenIfNeeded(address _token, address _spender, uint256 _amount) private
```

