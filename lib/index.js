"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _hookedWallet = require("web3-provider-engine/subproviders/hooked-wallet.js");

var _hookedWallet2 = _interopRequireDefault(_hookedWallet);

var _LedgerWallet = require("./LedgerWallet");

var _LedgerWallet2 = _interopRequireDefault(_LedgerWallet);

var _TrezorWallet = require("./TrezorWallet");

var _TrezorWallet2 = _interopRequireDefault(_TrezorWallet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(path_override, web3instance, type) {
        var WalletSubprovider, ledger, trezor;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        console.log('init hard wallet');
                        WalletSubprovider = void 0;

                        if (!(type === 'ledger')) {
                            _context.next = 11;
                            break;
                        }

                        ledger = new _LedgerWallet2.default(path_override, web3instance);
                        _context.next = 6;
                        return ledger.init();

                    case 6:
                        WalletSubprovider = new _hookedWallet2.default(ledger);

                        // This convenience method lets you handle the case where your users browser doesn't support U2F
                        // before adding the LedgerWalletSubprovider to a providerEngine instance.
                        WalletSubprovider.isSupported = ledger.isU2FSupported;
                        WalletSubprovider.ledger = ledger;
                        _context.next = 16;
                        break;

                    case 11:
                        trezor = new _TrezorWallet2.default(path_override, web3instance);
                        _context.next = 14;
                        return trezor.init();

                    case 14:
                        WalletSubprovider = new _hookedWallet2.default(trezor);
                        WalletSubprovider.trezor = trezor;

                    case 16:
                        return _context.abrupt("return", WalletSubprovider);

                    case 17:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();