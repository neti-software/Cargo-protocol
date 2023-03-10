//SPDX-License-Identifier: None
/// @title Core contract of CargoProtocol
/// @author Neti sp. Z.o.o

pragma solidity 0.8.4;

import "./interfaces/IGUniPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {TickMath} from "./vendor/uniswap/TickMath.sol";
import "./abstract/GUniPoolStorage.sol";
import "./abstract/GUniFactoryStorage.sol";
import {FullMath, LiquidityAmounts} from "./vendor/uniswap/LiquidityAmounts.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {OwnableUninitialized} from "./abstract/OwnableUninitialized.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IGUniFactory.sol";
import "./GUniFactory.sol";
import "./interfaces/IcargoFactory.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CargoService is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN = keccak256("ADMIN");
    bytes32 public constant BOT = keccak256("BOT");
    address public bot;
    address public celoToken;
    address public multisig;
    using SafeERC20 for IERC20;
    IGUniFactory public cargoFactory;

    /* ========== EVENTS ========== */
    event RebalanceTickRange(
        address indexed cargoContract,
        int24 newLowerTick,
        int24 newUpperTick,
        bool zeroForOne,
        uint160 swapThresholdPrice
    );
    event Deposit(
        address indexed cargoContract,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidityMinted
    );
    event Withdraw(
        address indexed cargoContract,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidityBurned
    );
    event CreateManagedPool(address indexed createdPool);

    event gainLeftoveer(uint256 leftover0, uint256 leftover1);

    /* ========== MODIFIERS ========== */
    modifier onlyMultiSig() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "CS: OMS"); //onlyMultisignature
        _;
    }
    modifier isBotOrMultiSig() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(BOT, msg.sender),
            "CS: OMSOB"
        ); // onlyMultisignatureOrBot
        _;
    }

    modifier cargoFactoryNotZero() {
        require(address(cargoFactory) != address(0), "CS: CFAZ"); //CargoFactoryAddressZero
        _;
    }

    constructor(address _multisig, address _celoToken) {
      //  _setRoleAdmin(DEFAULT_ADMIN_ROLE, ADMIN);
        multisig = _multisig;
        _setupRole(DEFAULT_ADMIN_ROLE, multisig);
        celoToken = _celoToken;
    }

    /// @dev Set GUni-Factory function
    /// @param _cargoFactory address of the GUni-Factory
    function setCargoFactory(address _cargoFactory) external onlyMultiSig {
        require(_cargoFactory != address(0), "CS: ADDR 0 PROVIDED");
        cargoFactory = IGUniFactory(_cargoFactory);
    }

    /// @dev Returns the amounts from underlyingBalances
    /// @param _guniPool Pool-Address to get the underlying balance
    /// @return _amount0Current underlyingBalance of the first token
    /// @return _amount1Current underlyingBalance of the secondToken
    /// @return _totalSupply totalsupply of the Pool
    function GUniCurrent(address _guniPool) external view returns(uint256 _amount0Current,uint256 _amount1Current,uint256 _totalSupply){
        IGUniPool guni = IGUniPool(_guniPool);
        uint256 totalSupply = IERC20(_guniPool).totalSupply();
                (uint256 amount0Current, uint256 amount1Current) =
                guni.getUnderlyingBalances();
        return(amount0Current,amount1Current,totalSupply);
    }


    /// @dev function calculates the mintLiquidity on specific pool with amounts
    /// @param _amount0 amount of the first token
    /// @param _amount1 amount of the second token
    /// @param _guniPool Pool-Address 
    /// @return _maxMintLiqAmount0 maximal mint liquidity amount for first token
    /// @return _maxMintLiqAmount1 maximal mint liquidity amount for second token
    function getMintLiquidity(uint256 _amount0,uint256 _amount1,address _guniPool) external view returns(uint256 _maxMintLiqAmount0,uint256 _maxMintLiqAmount1){
        IGUniPool guni = IGUniPool(_guniPool);
        uint256 totalSupply = IERC20(_guniPool).totalSupply();
        (uint256 amount0Current, uint256 amount1Current) =
                guni.getUnderlyingBalances();
           uint256 mintAmount0 = FullMath.mulDiv(
                totalSupply,
                _amount0,
                amount0Current
            );
            uint256 mintAmount1 = FullMath.mulDiv(
                totalSupply,
                _amount1,
                amount1Current
            );
            return(mintAmount0,mintAmount1);
    }


    /// @dev function grants the Role for Bot
    /// @param _bot address from which will the bot sending calls
    function setBotAddress(address _bot) external onlyMultiSig {
        require(_bot != address(0), "CS: ADDR 0 PROVIDED");

        // Check if any Bot Address was already initialized 
        if(bot != address(0)) {
            grantRole(BOT, _bot);
           revokeRole(BOT,bot);
            bot = _bot;
        } else {
            _setupRole(BOT, _bot);
            bot = _bot;
        }
        
    } 

    /// @dev Function to send the collected fees for executing functions on contracts
    /// @param _token address of the fee token to collect
    /// @param _to address who will recive the fee 
    /// @param _amount amount
    function collectExecuteFee(address _token,address _to,uint256 _amount) external isBotOrMultiSig {
        _approveTokenIfNeeded(_token,_to,_amount);
        IERC20(_token).safeTransfer(_to,_amount);

    }

    /// @dev Function which calculates the actual liquidity for each token based on the mint amount
    /// @param _mintAmount address of the second pair token from UniswapV3Pool
    /// @param _guniPool cargoPool(GUni-Pool) Address
    /// @return _amount0 actual amount of first token after calculations
    /// @return _amount1 actual amount of second token after calculations
    function guniAmountForLiquidity(uint256 _mintAmount,address _guniPool) internal view returns(uint256 _amount0,uint256 _amount1){
        IGUniPool guni = IGUniPool(_guniPool);
        uint256 totalSupply = IERC20(_guniPool).totalSupply();
                    (uint256 amount0Current, uint256 amount1Current) =
                guni.getUnderlyingBalances();
           uint256 amount0 = FullMath.mulDivRoundingUp(
                amount0Current,
                _mintAmount,
                totalSupply
            );
           uint256 amount1 = FullMath.mulDivRoundingUp(
                amount1Current,
                _mintAmount,
                totalSupply
            );
            return(amount0,amount1);
    }


    /// @dev Function which deposits caller money into the GUniPool the excessed amount will be send back to User
    /// @notice The GUniPool CLP token will be send back to msg.sender, along with the token excess
    /// @param _cargoPool cargoPool Address
    /// @param _token0 address of the first pair token from UniswapV3Pool
    /// @param _token1 address of the second pair token from UniswapV3Pool
    /// @param _liquidity mintAmount for supplying to 
    /// @return amount0 actual amount of first token pulled
    /// @return amount1 actual amount of second token pulled
    /// @return liquidityMinted actual amount of Minted Liquidity
    function deposit(
        address _cargoPool,
        address _token0,
        address _token1,
        uint256 _liquidity
    )
        external
        nonReentrant
        returns (
            uint256 amount0,
            uint256 amount1,
            uint128 liquidityMinted
        )
    {
        IGUniPool guni = IGUniPool(_cargoPool);
       (uint256 _amount0,uint256 _amount1) = guniAmountForLiquidity(_liquidity,_cargoPool);

        //transfer tokens from msg.sender to contract and to guni
        IERC20(_token0).transferFrom(msg.sender, address(this), _amount0);
        IERC20(_token1).transferFrom(msg.sender, address(this), _amount1);
        _approveTokenIfNeeded(_token0, address(guni), type(uint256).max);
        _approveTokenIfNeeded(_token1, address(guni), type(uint256).max);
        (amount0, amount1, liquidityMinted) = guni.mint(_liquidity, msg.sender);

        // send back the excessed amount
        if (IERC20(_token0).balanceOf(address(this)) > 0) {
            IERC20(_token0).transfer(
                msg.sender,
                IERC20(_token0).balanceOf(address(this))
            );
        }
        if (IERC20(_token1).balanceOf(address(this)) > 0) {
            IERC20(_token1).transfer(
                msg.sender,
                IERC20(_token1).balanceOf(address(this))
            );
        }
        emit Deposit(_cargoPool, amount0, amount1, liquidityMinted);
    }

    /// @dev Function to withdraw caller liquidity from the GUni Pool
    /// @param _cargoPool Address of CargoPool
    /// @param _liquidity liqudity to withdraw
    /// @return amount0  amount of first token burned
    /// @return amount1  amount of second token burned
    /// @return liquidityBurned actual amount of Burned Liquidity
    function withdraw(address _cargoPool, uint256 _liquidity)
        external
        nonReentrant
        returns (
            uint256 amount0,
            uint256 amount1,
            uint128 liquidityBurned
        )
    {
        IGUniPool guni = IGUniPool(_cargoPool);
        require(
            getBalanceOfCargoPool(_cargoPool) >= _liquidity,
            "Not enough liqudity"
        );
        IERC20(address(guni)).transferFrom(
            msg.sender,
            address(this),
            _liquidity
        );
        _approveTokenIfNeeded(address(guni), address(guni), type(uint256).max);
        (amount0, amount1, liquidityBurned) = guni.burn(_liquidity, msg.sender);
        emit Deposit(_cargoPool, amount0, amount1, liquidityBurned);
    } 

    /// @dev Returns the Balance of Cargo
    /// @param _cargoPool address of the GUni-Pool
    /// @return amount the cargo Balance
    function getBalanceOfCargoPool(address _cargoPool)
        public
        view
        returns (uint256 amount)
    {
        IGUniPool guni = IGUniPool(_cargoPool);
        return IERC20(address(guni)).balanceOf(msg.sender);
    }
    /// @dev Returns the Token Amount from Pool
    /// @param _cargoPool address of the GUni-Pool
    /// @return amount0 amount of the first token
    /// @return amount1 amount of the second token
    /// @return liquidity liquidity
    function getTokensAmount(address _cargoPool)
        public
        view
        returns (
            uint256 amount0,
            uint256 amount1,
            uint256 liquidity
        )
    {
        IGUniPool guni = IGUniPool(_cargoPool);
        IUniswapV3Pool pool = guni.pool();
        liquidity = getBalanceOfCargoPool(_cargoPool);
        (uint160 sqrtRatioX96, , , , , , ) = pool.slot0();

        (amount0, amount1) = LiquidityAmounts.getAmountsForLiquidity(
            sqrtRatioX96,
            TickMath.getSqrtRatioAtTick(
                GUniPoolStorage(address(guni)).lowerTick()
            ),
            TickMath.getSqrtRatioAtTick(
                GUniPoolStorage(address(guni)).upperTick()
            ),
            uint128(liquidity)
        );
    }

    /// @dev Function to colelct the rewarded Fees and reinvest them in Pool
    /// @notice The Fee Amount is
    /// @param _cargoPool CargoPool Address
    /// @param swapAmountBPS amount of token to swap as proportion of total. Pass 0 to ignore swap.
    /// @param zeroForOne Which token to input into the swap (true = token0, false = token1)
    /// @param feeAmount Amount of Fee collected while reinvesting
    /// @return leftover0 leftover of the first token on the Pool
    /// @return leftover1 leftover of the second token on the Pool
    function reinvestFees(
        address _cargoPool,
        uint256 swapAmountBPS,
        bool zeroForOne,
        uint256 feeAmount
    ) external isBotOrMultiSig returns(uint256, uint256){
        IGUniPool guni = IGUniPool(_cargoPool);

        IUniswapV3Pool pool = guni.pool();
        (uint160 swapThresholdPrice, ) = _swapTresholPrice(pool, zeroForOne);

        address token0 = address(guni.token0());
        address token1 = address(guni.token1());

        address paymentToken = token0;

        if(token0 == celoToken || token1 == celoToken){
            paymentToken = celoToken;
        }

        guni.rebalance(
            swapThresholdPrice,
            swapAmountBPS,
            zeroForOne,
            feeAmount,
            paymentToken
        );

        uint256 leftover0 = IERC20(token0).balanceOf(address(guni));
        uint256 leftover1 = IERC20(token1).balanceOf(address(guni));

        return (leftover0, leftover1);
    }

    /// @dev Function which is creating Managed Pools in CargoFactory
    /// @param tokenA Address of the frist Token in UniswapV3
    /// @param tokenB Address of the second Token in UniswapV3
    /// @param uniFee UniswapV3 fee on the pair
    /// @param managerFee Fee for the manager of the Pool
    /// @param lowerTick lower boundry tick where the liqudiity should be pegged
    /// @param upperTick upper boundry tick where the liqudiity should be pegged
    /// @return pool Address of the created Pool
    function createManagedPool(
        address tokenA,
        address tokenB,
        uint24 uniFee,
        uint16 managerFee,
        int24 lowerTick,
        int24 upperTick
    ) external onlyMultiSig cargoFactoryNotZero returns (address pool) {
        pool = cargoFactory.createManagedPool(
            tokenA,
            tokenB,
            uniFee,
            managerFee,
            lowerTick,
            upperTick
        );
        emit CreateManagedPool(pool);
    }

    /// @dev Function which wraps the CargoFactory into OwnableUninitialized contract and transfers the ownership
    /// @param _newManager Address of the new Owner
    function changeFactoryManager(address _newManager)
        external
        onlyMultiSig
        cargoFactoryNotZero
    {
        OwnableUninitialized(address(cargoFactory)).transferOwnership(
            _newManager
        );
    }
    /// @dev Function which sets new Gelate Deployer on the GUniFactory
    /// @notice this address will be the official "Cargo Pool" Deployer
    /// @param _newGelatoDeployer Address of the new Gelato Deployer
    function setGelatoDeployer(address _newGelatoDeployer)
        external
        onlyMultiSig
        cargoFactoryNotZero
    {
        GUniFactoryStorage(address(cargoFactory)).setGelatoDeployer(
            _newGelatoDeployer
        );
    }
    /// @dev Function which is passing the right data to calcualte the  the actual earned Fees on given Pool
    /// @param _cargoPool Address of the pool
    /// @return fee0 Earned Fee on Token0
    /// @return fee1 Earned Fee on Token1
    function computeFeesEarned(address _cargoPool) external view returns(uint256 fee0,uint256 fee1){
            IGUniPool guni = IGUniPool(_cargoPool);
            IUniswapV3Pool pool = guni.pool();

            (uint128 liquidity, uint256 feeGrowthInsideLast0 , uint256 feeGrowthInsideLast1, uint128 tokensOwed0, uint128 tokensOwed1 ) = pool.positions(GUniPoolStorage(address(guni)).getPositionID());
            (, int24 tick , , , , , ) = pool.slot0();

            fee0 = uint256(tokensOwed0) + _computeFeesEarned(true,feeGrowthInsideLast0,tick,liquidity,_cargoPool);
            fee1 = uint256(tokensOwed1) + _computeFeesEarned(false,feeGrowthInsideLast1,tick,liquidity,_cargoPool);
    }

    /// @dev Function which is calculating the actual earned Fees on given Pool
    /// @param isZero for which 
    /// @param feeGrowthInsideLast number of how much fees have been earned last based on the position
    /// @param tick at which Tick is the UniswapPool
    /// @param liquidity amount of liquidity in the position
    /// @param _cargoPool Address of the Cargo Pool
    /// @return fee earned Fee
    function _computeFeesEarned(
        bool isZero,
        uint256 feeGrowthInsideLast,
        int24 tick,
        uint128 liquidity,
        address _cargoPool
    ) internal view returns (uint256 fee) {
        uint256 feeGrowthOutsideLower;
        uint256 feeGrowthOutsideUpper;
        uint256 feeGrowthGlobal;
        IGUniPool guni = IGUniPool(_cargoPool);
        IUniswapV3Pool pool = guni.pool();
        if (isZero) {
            feeGrowthGlobal = pool.feeGrowthGlobal0X128();
            (, , feeGrowthOutsideLower, , , , , ) = pool.ticks(GUniPoolStorage(address(guni)).lowerTick());
            (, , feeGrowthOutsideUpper, , , , , ) = pool.ticks(GUniPoolStorage(address(guni)).upperTick());
        } else {
            feeGrowthGlobal = pool.feeGrowthGlobal1X128();
            (, , , feeGrowthOutsideLower, , , , ) = pool.ticks(GUniPoolStorage(address(guni)).lowerTick());
            (, , , feeGrowthOutsideUpper, , , , ) = pool.ticks(GUniPoolStorage(address(guni)).upperTick());
        }
        unchecked {
            // calculate fee growth below
            uint256 feeGrowthBelow;
            if (tick >= GUniPoolStorage(address(guni)).lowerTick()) {
                feeGrowthBelow = feeGrowthOutsideLower;
            } else {
                feeGrowthBelow = feeGrowthGlobal - feeGrowthOutsideLower;
            }

            // calculate fee growth above
            uint256 feeGrowthAbove;
            if (tick < GUniPoolStorage(address(guni)).upperTick()) {
                feeGrowthAbove = feeGrowthOutsideUpper;
            } else {
                feeGrowthAbove = feeGrowthGlobal - feeGrowthOutsideUpper;
            }

            fee = FullMath.mulDiv(
                liquidity,
                (feeGrowthGlobal - feeGrowthBelow - feeGrowthAbove) - feeGrowthInsideLast,
                0x100000000000000000000000000000000
            );
        }

    }

    /// @dev Function which is Rebalancing to new Tick Ranges on CargoPool, can only be called by MultiSig or Bot
    /// @param _cargoPool Address of the GUni-Pool
    /// @param newLowerTick new lower boundry tick where the liqudiity should be repegged
    /// @param newUpperTick new upper boundry tick where the liqudiity should be repegged
    /// @param swapAmountBPS amount of token to swap as proportion of total. Pass 0 to ignore swap.
    /// @param zeroForOne Which token to input into the swap (true = token0, false = token1)
    /// @return _leftover0 left over of the first Token after the Rebalance
    /// @return _leftover1 left over of the second Token after the Rebalance
    function rebalanceTickRange(
        address _cargoPool,
        int24 newLowerTick,
        int24 newUpperTick,
        uint256 swapAmountBPS,
        bool zeroForOne
    ) external isBotOrMultiSig returns (uint256 _leftover0, uint256 _leftover1){
        require(
            OwnableUninitialized(_cargoPool).manager() == address(this),
            " CS: CSNM"
        ); //CargoServiceNotManager
        IGUniPool guni = IGUniPool(_cargoPool);
        IUniswapV3Pool pool = guni.pool();
        (uint160 swapThresholdPrice, ) = _swapTresholPrice(pool, zeroForOne);

        guni.executiveRebalance(
            newLowerTick,
            newUpperTick,
            swapThresholdPrice,
            swapAmountBPS,
            zeroForOne
        );
        emit RebalanceTickRange(
            _cargoPool,
            newLowerTick,
            newUpperTick,
            zeroForOne,
            swapThresholdPrice
        );

        uint256 leftover0 = guni.token0().balanceOf(address(guni));
        uint256 leftover1 = guni.token1().balanceOf(address(guni));

        return (leftover0, leftover1);
    }

    /// @dev Function to calcualte the SqrtRatioAtTick(swapThresholdPrice) based on the tick and tickspacing in pool
    /// @param pool Address of the GUni-Pool
    /// @param zeroForOne Which token to input into the swap (true = token0, false = token1)
    /// @return swapThresholdPrice calcualted sqrt(1.0001^tick) * 2^96 from the current tick - tickspacing
    /// @return sqrtPriceX96 A Fixed point Q64.96 number representing the sqrt of the ratio of the two assets (token1/token0)
    function _swapTresholPrice(IUniswapV3Pool pool, bool zeroForOne) internal view returns(uint160 swapThresholdPrice, uint160 sqrtPriceX96){
        (uint160 sqrtPriceX962, int24 tick , , , , , ) = pool.slot0();
        if(zeroForOne == true) {
          swapThresholdPrice = uint160(TickMath.getSqrtRatioAtTick(tick-(pool.tickSpacing()*10)));
        } else {
                swapThresholdPrice = uint160(TickMath.getSqrtRatioAtTick(tick+(pool.tickSpacing()*10)));
            }
       return(swapThresholdPrice,sqrtPriceX962);
    }

    /// @dev The function changes the manager Address in each pool from given _deployers
    /// @param _newManager Address of the new manager which should be set up
    /// @param _deployers Addresses of the wallets which deployed the pools
    function changeManagerAddress(address _newManager, address[] memory _deployers)
        external
        onlyMultiSig
        cargoFactoryNotZero
    {
        for (uint256 i = 0; i < _deployers.length; i++) {
            address[] memory pools = IcargoFactory(address(cargoFactory))
                .getPools(_deployers[i]);
            
            for (uint256 j = 0; j < pools.length; j++) {
            OwnableUninitialized(pools[j]).transferOwnership(_newManager);
            }
        }
     
    }

    /// @dev The function is changing the Pool implementation Proxy contract in pools of given deployers
    /// @param _poolImplementation Address of the new pool implementation which should be set up
    /// @param _deployers Addresses of the wallets which deployed the pools
    function changePoolImplementation(
        address _poolImplementation,
        address[] memory _deployers
    ) external onlyMultiSig cargoFactoryNotZero {
        GUniFactoryStorage(address(cargoFactory)).setPoolImplementation(
            _poolImplementation
        );
        for (uint256 i = 0; i < _deployers.length; i++) {
            address[] memory pools = IcargoFactory(address(cargoFactory))
                .getPools(_deployers[i]);
            IcargoFactory(address(cargoFactory)).upgradePools(pools);
        }
    }

    /// @dev The function is returning the lower and upper tick of given _cargoPool
    /// @param _cargoPool Address of the GUni-Pool
    /// @param _lowerTick Lower tick set at the given GUni-Pool
    /// @param _upperTick Upper tick set at the given GUni-Pool
    function getCargoPoolTicks(address _cargoPool) external view returns (int24 _lowerTick, int24 _upperTick){
        IGUniPool guni = IGUniPool(_cargoPool);

        int24 lowerTick = guni.lowerTick();
        int24 upperTick = guni.upperTick();

        return(lowerTick, upperTick);
    }

    
    /// @dev Function to give allowance to certain 
    function _approveTokenIfNeeded(
        address _token,
    address _spender,
        uint256 _amount
    ) private {
        if (
            IERC20(_token).allowance(address(this), address(_spender)) < _amount
        ) {
            // safeApprove has special check
            IERC20(_token).safeApprove(address(_spender), 0);
            IERC20(_token).safeApprove(address(_spender), type(uint256).max);
        }
    }
}
