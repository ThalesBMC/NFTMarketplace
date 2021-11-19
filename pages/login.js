import React from 'react'

export const login = () => {
    async function loginFirebase() {
        //aqui tenho que adicionar o usuario no firebase depois de ele de signer caso ele n exista.
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    }
    async function validarOperacao() {
        //tem que ter uma desssa para validar uma atualizacao ou favoritar algo.
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    }
    return (
        <div>
            
        </div>
    )
}
