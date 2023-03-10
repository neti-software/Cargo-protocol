
![Cargo](https://uploads-ssl.webflow.com/6171448852164b9d02542bad/632324366ade60afc298fea9_Cargo.png)
# Cargo Documentation
![Cargo-Protocol-Chart](https://i.ibb.co/kXv1Wcw/Screenshot-2022-10-10-at-19-30-43.png)
Figma Link: https://www.figma.com/file/YfZDQeOVHIfT5uX7hnupVz/CargoProtocolChart?node-id=0%3A1

CargoService contract is the heart of the whole protocol, it is not responsible for passing the correct deposit from the User into the G-Uni Contracts which are connected to Uniswap, but it also covers the fees reinvestment and the rebalance mechanism by being the core contract for the service. CargoService contract can also be extended to include other features such as the Incentives feature.

### Initialisation and Deployment:
To initialize the protocol firstly we need to deploy the Multisignature and the CargoService contract which are the core of the protocol. It is important to note that the address of MultiSig Contract will be set as Admin in the CargoService and the correct address of Celo Token as parameter.
In the next step, an “empty” GUni-Pool contract will be deployed which will work as the Proxy implementation contract for later created Managed Pools. For the Pool deployment the CargoService contact address is set as _gelato.
After this step we can deploy the GUniFactory contract with the correct UniswapV3Factory address and set the address of the Factory by calling setCargoFactory in the CargoService contract.

After the transaction confirmation we can call the 	```initialize(address,address,address)	``` function which is taking the before deployed GUni-Pool address as pool implementation in the first parameter, and the CargoService contract as second and third one.
Now by calling 	```createManagedPool()	``` in the core CargoService contract we can deploy a GUni-Pool which will inject liquidity at particular tick ranges to Uniswap.

*Staking/Incentives Protocol:*
The Contract is set up in the last phase of the deployment which connects the Staking Protocol to the individual CargoPool and the reward token, _admin address is the wallet which set the BOT address and the CargoService address in the protocol, _celoLabs address is the incentives giver Address which can withdraw and set the BPS for the Protocol.

*Update Process:*
To do a proper Update process firstly we need to deploy a new instance of CargoService contract with proper Multisignature address as parameter. As next step we need to deploy a GUni-Pool with the new CargoService contract as _gelato parameter to swap it later as Proxy implementation contract. Then by calling 	```changeFactoryManager()	``` and 	```changeManagerAddress()	``` functions with the new CargoService we are switching the manager.
Next step is to change the GelatoDeployer and swap the Implementation by calling
	```changePoolImplementation()	``` from the new CargoService contract.
After changing the old CargoService it’s important to remember to update the Staking/Incentives Protocol to the new CargoService Address.

### User Flow:
By clicking Supply Liquidity on a particular Strategy in the Front-End panel, the Users investment is passed through the CargoService contract by calling the 	```deposit(address, address, address, uint256)``` function. The first parameter is the address of the CargoPool contract (GUni-Pool) into which the money is supplied, next two parameters are the addresses of the tokens from UniswapV3Pool, and the last parameter is the liquidity.
The Tokens are then transferred into the CargoService contract, which calculates the correct Liquidity Amount at that time and passes it into the CargoPool (G-Uni Pool) which injects it into the Uniswap Pool as concentrated liquidity. The excess amount is returned to the user's wallet.
As the result, the user is receiving Cargo Liquidity Provider Token (CLP Token) in their wallet as replication of their supplied liquidity.



### CargoService:
As mentioned before, the CargoService is the core contract of the whole protocol, it is an interface between User and Uniswap V3 concentrated liquidity positions using G-Uni Protocol which enables creating managed position pools on Uniswap.
The contract is an Admin/Manager of all the GUni-Pools which is not only collecting the given fees from the protocol but also calculating the earned fees (	```computeFeesEarned	``` function) in given pool, redeploying the liquidity for different tick spread if needed, passing the right amount of token0 and token1 in given pool by calculating the actual liquidity needed and returning the exceeded amount back to the user.



### Bot:
The bot is responsible for analyzing if the price position at a given strategy is not outside given range, calculate APY and reinvest the earned fees. 
It is split into two schedulers which are doing separate tasks.
The first scheduler determines whether a given strategy requires a range adjustment, if the answer is yes
the rebalanceTickRange method in the cargoService contract is called.

Before executing the methods in the contract, the fee and TVL are collected and kept in the database, together with the date and time.
Then the calculateRewards method in the stakingProtocol contract is executed for policies with stakingProtocolAddress.
Finally, reinvestFees function in the cargoService contract.

The scheduler stores information about yesterday’s fee, TVL and APY.
In the time interval between 00:00-00:30, yesterday’s information about the fee + the TVL for a given strategy is obtained. Fees are added up, and the average  for the TVL is taken, which is then saved to the database.
Additionally, yesterday’s APY is calculated and stored in the database (it is needed for the statistics).


### Staking Protocol / Incentives Protocol:
The staking protocol is a reward system that is based on users' earned fees through Cargo.
After users deposits his money into one of the CargoPools, he will be automatically added to the StakingProtocol contract which will redistribute tokens additionally based in his pool contribution.
The contract is based on the 	```calculateRewards(StakingProtocol)	``` function, which is calling the  	```computeFeesEarned(CargoService)	``` function.
The contract is calculating the rewards based on users shares and fees earned through liquidity providing into UniswapV3 protocol.
The incentives giver will be set up while creation of the contract, and only he can change the reward Rate BPS and withdraw the remaining incentives from the protocol.
It’s important to notice that the users can check their rewards by calling the showUserReward and supplying the user address.




### Managed Pools:
By calling 	```createManagedPool(address, address, uint24, uint16, int24, int24)	``` in CargoService contract we can create managed position pools on Uniswap v3 through GUni-Factory by bypassing the minting process of the NFT's and directly injecting the liquidity to the Uniswap pool. 
The first two parameters are the token addresses, the uint24 is representing the Uniswap Pool fee at the particular token pair, next parameter is the uint16 which represents the managerFee, and the last two are the lower tick boundary and the upper tick boundary where the liquidity is pegged. 
As the result, the process is generating a 32-bit position ID representing the position in the Uniswap Pool.

### MultiSignature
The contract executes function calls on an address which can be set with each transaction proposal. There are 4 main functions in the contract 
```submitTransaction()``` , ```confirmTransaction()```, ```executeTransaction()``` and ```revokeConfirmation()```
```submitTransaction(address, bytes memory, string memory)```  function adds a transaction proposal to the transaction list, first parameter is covering the *_to* address at which the function will be called, second parameter is the *_data* field which covers the called function with their parameters as **bytes**.
*notice that the function also confirms the proposed transaction.*
```confirmTransaction(uint256 _txIndex)``` confirms the choosen transaction by id.
```executeTransaction(uint256 _txIndex)``` executes the transaction by id.
*notice can only execute the transaction when the minimum amount of confirm signatures are reached.*
```revokeConfirmation(uint256 _txIndex)``` revokes the given information on transaction id.

### Front-End AUTHORIZATION
Authorization is done by signing a wallet signature that generates a JWT token in the next step.
The database stores admin addresses with a distinction between two roles: ADMIN and CELO. ADMIN has access to the admin panel and celo, CELO only to celo.


