import connect from './connect';
import EthereumTx from 'ethereumjs-tx';
import u2f from './u2f-api';
import {timeout} from 'promise-timeout';
if (window.u2f === undefined) window.u2f = u2f;

const NOT_SUPPORTED_ERROR_MSG =
    "TrezorWallet uses U2F which is not supported by your browser. " +
    "Use Chrome, Opera or Firefox with a U2F extension." +
    "Also make sure you're on an HTTPS connection";
/**
 *  @class TrezorWallet
 *
 *
 *  Paths:
 *  Minimum Trezor accepts are:
 *
 *   * 44'/60'
 *   * 44'/61'
 *
 *  MyEtherWallet.com by default uses the range
 *
 *   * 44'/60'/0'/n
 *
 *  Note: no hardend derivation on the `n`
 *
 *  BIP44/EIP84 specificies:
 *
 *  * m / purpose' / coin_type' / account' / change / address_index
 *
 *  @see https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 *  @see https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 *  @see https://github.com/MetaMask/provider-engine
 *  @see https://github.com/ethereum/wiki/wiki/JavaScript-API
 *
 *  Implementations:
 *  https://github.com/MetaMask/metamask-plugin/blob/master/app/scripts/keyrings/hd.js
 *
 */
const allowed_hd_paths = ["44'/60'", "44'/61'"];

class TrezorWallet {

    constructor(path) {
        path = path || allowed_hd_paths[0];
        if (!allowed_hd_paths.some(hd_pref => path.startsWith(hd_pref)))
            throw new Error(`hd derivation path for Nano Ledger S may only start [${allowed_hd_paths}], ${path} was provided`);
        this._path = path;
        this._accounts = null;
        this.isU2FSupported = null;
        this.getAccounts = this.getAccounts.bind(this);
        this.signTransaction = this.signTransaction.bind(this);
        this.connectionOpened = false;
    }

    async init() {
        this.isU2FSupported = await TrezorWallet.isSupported();
    }

    /**
     * Checks if the browser supports u2f.
     * Currently there is no good way to do feature-detection,
     * so we call getApiVersion and wait for 100ms
     */
    static async isSupported() {
        return new Promise((resolve, reject) => {
            if (window.u2f && !window.u2f.getApiVersion) {
                // u2f object is found (Firefox with extension)
                resolve(true);
            } else {
                // u2f object was not found. Using Google polyfill
                const intervalId = setTimeout(() => {
                    resolve(false);
                }, 3000);
                u2f.getApiVersion((version) => {
                    clearTimeout(intervalId);
                    resolve(true);
                });
            }
        });
    };

    /**
     * Gets a list of accounts from a device
     * @param {failableCallback} callback
     * @param askForOnDeviceConfirmation
     */
    async getAccounts(callback, askForOnDeviceConfirmation = true) {
        if (!this.isU2FSupported) {
            callback(new Error(NOT_SUPPORTED_ERROR_MSG));
            return;
        }
        if (this._accounts !== null) {
            callback(null, this._accounts);
            return;
        }
        const chainCode = false; // Include the chain code
        TrezorConnect.ethereumGetAddress(this._path, function (response) {
        if (result.success) { // success
            this._accounts = [result.address.toLowerCase()];
            cleanupCallback(null, this._accounts);
            console.log('Address: ', result.address);
        } else {
            cleanupCallback(result.error)
            console.error('Error:', result.error); // error message
        }
        });	
    }

    /**
     * Signs txData in a format that ethereumjs-tx accepts
     * @param {object} txData - transaction to sign
     * @param {failableCallback} callback - callback
     */
    async signTransaction(txData, callback) {
        if (!this.isU2FSupported) {
            callback(new Error(NOT_SUPPORTED_ERROR_MSG));
            return;
        }
        // Encode using ethereumjs-tx
        let tx = new EthereumTx(txData);

        // Fetch the chain id
        web3.version.getNetwork(async function (error, chain_id) {
            if (error) callback(error);

            // Force chain_id to int
            chain_id = 0 | chain_id;

         TrezorConnect.ethereumSignTx(
            this._accounts[0],
            txData.nonce,
            txData.gasPrice,
            txData.gasLimit,
            txData.to,
            txData.value,
            txData.data,
            chain_id,
            function (response) {
             if (response.success) {
                 console.log('Signature V (recovery parameter):', response.v); // number
                 console.log('Signature R component:', response.r); // bytes
                 console.log('Signature S component:', response.s); // bytes
                    // Store signature in transaction
                    tx.v = new Buffer(response.v, "hex");
                    tx.r = new Buffer(response.r, "hex");
                    tx.s = new Buffer(response.s, "hex");

                    // EIP155: v should be chain_id * 2 + {35, 36}
                    const signed_chain_id = Math.floor((tx.v[0] - 35) / 2);
                    if (signed_chain_id !== chain_id) {
                        cleanupCallback("Invalid signature received. Please update your Ledger Nano S.");
                    }

                    // Return the signed raw transaction
                    const rawTx = "0x" + tx.serialize().toString("hex");
                    cleanupCallback(undefined, rawTx);
             } else {
                 console.error('Error:', response.error); // error message
                 cleanupCallback(response.error)
             }
         });
    });
    }
}

module.exports = TrezorWallet;
