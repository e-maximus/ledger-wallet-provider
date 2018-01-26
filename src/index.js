import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet.js";
import LedgerWallet from "./LedgerWallet";
import TrezorWallet from "./TrezorWallet";

export default async function (path_override, web3instance, type) {
    console.log('init hard wallet');
    let WalletSubprovider;
    if(type === 'ledger') {
    const ledger = new LedgerWallet(path_override, web3instance);
    await ledger.init();
    WalletSubprovider = new HookedWalletSubprovider(ledger);

    // This convenience method lets you handle the case where your users browser doesn't support U2F
    // before adding the LedgerWalletSubprovider to a providerEngine instance.
    WalletSubprovider.isSupported = ledger.isU2FSupported;
    WalletSubprovider.ledger = ledger;
    } 
    else {
    const trezor = new TrezorWallet(path_override, web3instance);
    await trezor.init();
    WalletSubprovider = new HookedWalletSubprovider(trezor);
    WalletSubprovider.trezor = trezor;
    }
    return WalletSubprovider;
};
