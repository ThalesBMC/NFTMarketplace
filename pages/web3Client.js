import Web3Modal from "web3modal";
let selectedAccount;
export const init = () => {
  let provider = window.ethereum;

  if (typeof provider !== "undefined") {
    provider
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        selectedAccount = accounts[0];
       
      })
      .catch((err) => {
        console.log(err);
      });
    window.ethereum.on("accountsChanged", (accounts) => {
      selectedAccount = accounts[0];
     
    });
  }
  const web3 = new Web3Modal(provider);
};
