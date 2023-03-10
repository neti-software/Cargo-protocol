## GUniFactory

### constructor

```solidity
constructor(address _uniswapV3Factory) public
```

### createManagedPool

```solidity
function createManagedPool(address tokenA, address tokenB, uint24 uniFee, uint16 managerFee, int24 lowerTick, int24 upperTick) external returns (address pool)
```

createManagedPool creates a new instance of a G-UNI token on a specified
UniswapV3Pool. The msg.sender is the initial manager of the pool and will
forever be associated with the G-UNI pool as it's `deployer`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | one of the tokens in the uniswap pair |
| tokenB | address | the other token in the uniswap pair |
| uniFee | uint24 | fee tier of the uniswap pair |
| managerFee | uint16 | proportion of earned fees that go to pool manager in Basis Points |
| lowerTick | int24 | initial lower bound of the Uniswap V3 position |
| upperTick | int24 | initial upper bound of the Uniswap V3 position |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | the address of the newly created G-UNI pool (proxy) |

### createPool

```solidity
function createPool(address tokenA, address tokenB, uint24 uniFee, int24 lowerTick, int24 upperTick) external returns (address pool)
```

createPool creates a new instance of a G-UNI token on a specified
UniswapV3Pool. Here the manager role is immediately burned, however msg.sender will still
forever be associated with the G-UNI pool as it's `deployer`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenA | address | one of the tokens in the uniswap pair |
| tokenB | address | the other token in the uniswap pair |
| uniFee | uint24 | fee tier of the uniswap pair |
| lowerTick | int24 | initial lower bound of the Uniswap V3 position |
| upperTick | int24 | initial upper bound of the Uniswap V3 position |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | the address of the newly created G-UNI pool (proxy) |

### _createPool

```solidity
function _createPool(address tokenA, address tokenB, uint24 uniFee, uint16 managerFee, int24 lowerTick, int24 upperTick, address manager) internal returns (address pool)
```

### _validateTickSpacing

```solidity
function _validateTickSpacing(address uniPool, int24 lowerTick, int24 upperTick) internal view returns (bool)
```

### getTokenName

```solidity
function getTokenName(address token0, address token1) external view returns (string)
```

### upgradePools

```solidity
function upgradePools(address[] pools) external
```

### upgradePoolsAndCall

```solidity
function upgradePoolsAndCall(address[] pools, bytes[] datas) external
```

### makePoolsImmutable

```solidity
function makePoolsImmutable(address[] pools) external
```

### isPoolImmutable

```solidity
function isPoolImmutable(address pool) external view returns (bool)
```

isPoolImmutable checks if a certain G-UNI pool is "immutable" i.e. that the
proxyAdmin is the zero address and thus the underlying implementation cannot be upgraded

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | address of the G-UNI pool |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool signaling if pool is immutable (true) or not (false) |

### getGelatoPools

```solidity
function getGelatoPools() external view returns (address[])
```

getGelatoPools gets all the G-UNI pools deployed by Gelato's
default deployer address (since anyone can deploy and manage G-UNI pools)

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | list of Gelato managed G-UNI pool addresses |

### getDeployers

```solidity
function getDeployers() public view returns (address[])
```

getDeployers fetches all addresses that have deployed a G-UNI pool

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | deployers the list of deployer addresses |

### getPools

```solidity
function getPools(address deployer) public view returns (address[])
```

getPools fetches all the G-UNI pool addresses deployed by `deployer`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| deployer | address | address that has potentially deployed G-UNI pools (can return empty array) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | pools the list of G-UNI pool addresses deployed by `deployer` |

### numPools

```solidity
function numPools() public view returns (uint256 result)
```

numPools counts the total number of G-UNI pools in existence

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| result | uint256 | total number of G-UNI pools deployed |

### numDeployers

```solidity
function numDeployers() public view returns (uint256)
```

numDeployers counts the total number of G-UNI pool deployer addresses

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | total number of G-UNI pool deployer addresses |

### numPools

```solidity
function numPools(address deployer) public view returns (uint256)
```

numPools counts the total number of G-UNI pools deployed by `deployer`

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| deployer | address | deployer address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | total number of G-UNI pools deployed by `deployer` |

### getProxyAdmin

```solidity
function getProxyAdmin(address pool) public view returns (address)
```

getProxyAdmin gets the current address who controls the underlying implementation
of a G-UNI pool. For most all pools either this contract address or the zero address will
be the proxyAdmin. If the admin is the zero address the pool's implementation is naturally
no longer upgradable (no one owns the zero address).

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| pool | address | address of the G-UNI pool |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address that controls the G-UNI implementation (has power to upgrade it) |

### _getDeployer

```solidity
function _getDeployer(uint256 index) internal view returns (address)
```

### _getPool

```solidity
function _getPool(address deployer, uint256 index) internal view returns (address)
```

### _getTokenOrder

```solidity
function _getTokenOrder(address tokenA, address tokenB) internal pure returns (address token0, address token1)
```

### _append

```solidity
function _append(string a, string b, string c, string d, string e) internal pure returns (string)
```
