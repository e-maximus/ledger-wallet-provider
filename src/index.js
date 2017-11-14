import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet.js";
import LedgerWallet from "./LedgerWallet";
import TrezorWallet from "./TrezorWallet";

export default async function (path_override, web3instance) {
    const ledger = new LedgerWallet(path_override, web3instance);
    await ledger.init();
    const LedgerWalletSubprovider = new HookedWalletSubprovider(ledger);

    // This convenience method lets you handle the case where your users browser doesn't support U2F
    // before adding the LedgerWalletSubprovider to a providerEngine instance.
    LedgerWalletSubprovider.isSupported = ledger.isU2FSupported;
    LedgerWalletSubprovider.ledger = ledger;

    const trezor = new TrezorWallet(path_override, web3instance);
    await trezor.init();
    const TrezorWalletSubprovider = new HookedWalletSubprovider(trezor);

    // This convenience method lets you handle the case where your users browser doesn't support U2F
    // before adding the LedgerWalletSubprovider to a providerEngine instance.
    TrezorWalletSubprovider.isSupported = ledger.isU2FSupported;
    TrezorWalletSubprovider.trezor = trezor;

    return LedgerWalletSubprovider,TrezorWalletSubprovider;
};
