// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

import "@prb/math/contracts/PRBMathUD60x18.sol";
import "@openzeppelin/contracts/contracts/token/ERC20/extensions/ERC20TokenizedVault.sol";
import "@openzeppelin/contracts/contracts/utils/math/SafeCast.sol";

contract ERC4626BoundingCurve is ERC20TokenizedVault {
    using PRBMathUD60x18 for uint256;

    uint256 public immutable BUY_CURVE_PARAM;
    uint256 public immutable SELL_CURVE_PARAM;

    constructor(
        string memory _name,
        string memory _symbol,
        IERC20Metadata _asset,
        uint256 _buyCurveParam,
        uint256 _sellCurveParam
    )
    ERC20(_name, _symbol)
    ERC20TokenizedVault(_asset)
    {
        require(_buyCurveParam <= _sellCurveParam, "ERC4626BoundingCurve: unsafe params");
        BUY_CURVE_PARAM  = _buyCurveParam;
        SELL_CURVE_PARAM = _sellCurveParam;
    }

    function previewDeposit(uint256 assets) public view override returns (uint256 shares) {
        uint256 tA = totalAssets();
        uint256 tS = totalSupply();

        return tA == 0
            ? assets
            : tS.fromUint().mul(PRBMathUD60x18.div(tA + assets, tA).pow(BUY_CURVE_PARAM)).toUint() - tS;
    }

    function previewMint(uint256 shares) public view override returns (uint256 assets) {
        uint256 tA = totalAssets();
        uint256 tS = totalSupply();

        return tS == 0
            ? shares
            : tA.fromUint().mul(PRBMathUD60x18.div(tS + shares, tS).pow(BUY_CURVE_PARAM.inv())).toUint() - tA;
    }

    function previewWithdraw(uint256 assets) public view override returns (uint256 shares) {
        uint256 tA = totalAssets();
        uint256 tS = totalSupply();

        return tA == 0
            ? assets == 0 ? 0 : type(uint256).max
            : tS - tS.fromUint().div(PRBMathUD60x18.div(tA, tA - assets).pow(SELL_CURVE_PARAM)).toUint();
    }

    function previewRedeem(uint256 shares) public view override returns (uint256 assets) {
        uint256 tA = totalAssets();
        uint256 tS = totalSupply();

        return tS == 0
            ? shares == 0 ? 0 : type(uint256).max
            : tA - tA.fromUint().div(PRBMathUD60x18.div(tS, tS - shares).pow(SELL_CURVE_PARAM.inv())).toUint();
    }
}
