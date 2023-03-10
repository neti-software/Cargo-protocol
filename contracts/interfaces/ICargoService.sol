//SPDX-License-Identifier: None
pragma solidity 0.8.4;

interface ICargoService {
    function computeFeesEarned(address _cargoPool) external view returns(uint256 fee0,uint256 fee1);
    function celoToken() external view returns(address);
}  
