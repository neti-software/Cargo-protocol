// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

library console {
    event ab0(uint256 _p0, string _p1);
    event ab1(bool _p0, string _p1);
    event ab2(address _p0, string _p1);
    event ab3(int256 _p0, string _p1);

    function log(uint256 p0, string memory p1) internal {
        emit ab0(p0, p1);
    }

    function log(bool p0, string memory p1) internal {
        emit ab1(p0, p1);
    }

    function log(address p0, string memory p1) internal {
        emit ab2(p0, p1);
    }

    function log(int256 p0, string memory p1) internal {
        emit ab3(p0, p1);
    }
}
