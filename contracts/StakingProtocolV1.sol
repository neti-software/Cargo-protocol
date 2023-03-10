//SPDX-License-Identifier: None
pragma solidity 0.8.4;

import "./interfaces/IGUniPool.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ICargoService.sol";
import { FullMath } from "./vendor/uniswap/LiquidityAmounts.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./console.sol";

contract StakingProtocol is AccessControl,ReentrancyGuard {

  bytes32 public constant ADMIN = keccak256("ADMIN");
  bytes32 public constant CELOLABS = keccak256("CELOLABS");
  bytes32 public constant BOT = keccak256("BOT");
  using SafeERC20 for IERC20;

  IERC20 public rewardToken;
  IGUniPool public cargoPool;
  ICargoService public cargoService;
  bool public incentivesStarted;

  uint256 public rewardRateBPS = 5000; //50%
  uint256 public totalAccumulated; 
  uint256 public totalRewards;
  address public bot;


  struct User {
    uint256 rewards;
    address addrUser;
  }

  User[] public usersList;
  address public celoToken;

  /* ========== EVENTS ========== */
  event Started(uint indexed amount);

  /* ========== MODIFIERS ========== */
  modifier started() {
    require(incentivesStarted, "Not Started Yet");
    _;
  }
  modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "OMS"); //onlyMultisignature
        _;
  }
  modifier onlyBot() {
        require(hasRole(BOT, msg.sender), "OBS"); //onlyMuonlyBotService
        _;
  }
  modifier onlyCelo() {
        require(
            hasRole(CELOLABS, msg.sender),"OC"); // onlyCelo
        _;
  }


  constructor(IGUniPool _cargoPool, IERC20 _rewardToken, address _admin, address _celoLabs) {
    cargoPool = _cargoPool;
    incentivesStarted = false;
    rewardToken = _rewardToken;
    _setupRole(DEFAULT_ADMIN_ROLE, _admin);
    _setupRole(CELOLABS, _celoLabs);
  }

  function setCargoService(ICargoService _cargoService) onlyAdmin external {
    cargoService = _cargoService;
    celoToken = cargoService.celoToken();
  }

  function setBotAddress(address _bot) external onlyAdmin {
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

  function isUserInList(address _user)
    public
    view
    returns (bool added, uint256 slot)
  {
    bool flag = false;
    uint256 listSlot;
    for (uint256 i; i < usersList.length; i++) {
      if (usersList[i].addrUser == _user) {
        flag = true;
        listSlot = i;
        break;
      }
    }
    return (flag, listSlot);
  }

  function addUser() external {
    (bool flag, ) = isUserInList(msg.sender);
    if (flag) revert();
    else usersList.push(User(0, msg.sender));
  }

  function calculateRewards() onlyBot external returns(uint256 rewardRound) {
    require(incentivesStarted, "INS"); // Incentives not started
    
    uint256 totalFee = 0;
    uint256 feeAmount = 0;
    uint256 totalSupply = IERC20(address(cargoPool)).totalSupply();
    (uint256 fee0, uint256 fee1) = cargoService.computeFeesEarned(address(cargoPool));

    if(address(cargoPool.token0()) == celoToken){
      feeAmount = fee0;
    }else{
      feeAmount = fee1;
      }
    // find celoToken & accumulate Reward in Celo.
    
    console.log(feeAmount, "feeAmount");
    totalFee = (feeAmount * rewardRateBPS)/1e4;
    console.log(totalFee, "totalFee");
    
    uint256 balance = balanceOf();
    if(totalFee > balance)
    {
      totalFee = balance;
      incentivesStarted = false;

    }

    console.log(usersList.length, "userlistlength");
    for (uint256 i=0; i < usersList.length; i++) {
      uint256 userBalance = cargoPool.balanceOf(usersList[i].addrUser);
      console.log(userBalance, "balnaceof user");
      uint256 rewardCalc = FullMath.mulDiv(userBalance, totalFee, totalSupply);
      console.log(rewardCalc, "rewardCALC");
      usersList[i].rewards += rewardCalc;
      rewardRound += rewardCalc;
    }
    totalAccumulated += rewardRound;
  }

  function showUserReward(address _userAddress) external view returns (uint256){  
    (bool flag, uint256 slot) = isUserInList(_userAddress);
    require(flag, "UNIL"); //UserNotInList
    return usersList[slot].rewards;

  }

  function claimReward() public {
    (bool flag, uint256 slot) = isUserInList(msg.sender);
    require(flag, "UNIL"); //UserNotInList
    uint256 reward = usersList[slot].rewards;
    if (reward > 0) {
      usersList[slot].rewards = 0;
      IERC20(rewardToken).safeTransfer(msg.sender, reward);
    }
  }

  function setRewardRateBPS (uint256 _rewardRateBPS) onlyCelo external {
    rewardRateBPS = _rewardRateBPS;
  }

  function deposit(uint256 _rewardAmount) external {
    rewardToken.transferFrom(msg.sender, address(this), _rewardAmount);
    totalRewards += rewardToken.balanceOf(address(this));
    incentivesStarted = true;
    emit Started(totalRewards);
  }

  function withdraw(uint256 _amount) onlyCelo external{
    require(_amount <= balanceOf(), "Exceeded balance"); 
    IERC20(rewardToken).safeTransfer(msg.sender, _amount);
  }

  function balanceOf() public view returns(uint256){
    uint256 unclaimedRewards = 0;
    for (uint256 i=0; i < usersList.length; i++) {
      unclaimedRewards += usersList[i].rewards;
    }
    return rewardBalance() - unclaimedRewards;
  }

  function rewardBalance() public view returns (uint256) {
    return IERC20(rewardToken).balanceOf(address(this));
  }
}
