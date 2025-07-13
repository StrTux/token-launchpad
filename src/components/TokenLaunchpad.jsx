import { useWallet } from '@solana/wallet-adapter-react';
import {
    createInitializeMint2Instruction,
    getMinimumBalanceForRentExemptMint,
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    clusterApiUrl,
} from '@solana/web3.js';

export function TokenLaunchpad() {
    const wallet = useWallet();

    const network = 'devnet';
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const connection = useMemo(() => new Connection(endpoint), [endpoint]);

    async function createToken() {
        if (!wallet.publicKey || !wallet.signTransaction) {
            alert("Wallet not connected");
            return;
        }

        const mintKeypair = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(connection);

        const decimals = 9;
        const mintAuthority = wallet.publicKey;
        const freezeAuthority = wallet.publicKey;


        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: MINT_SIZE,
                lamports,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMint2Instruction(
                mintKeypair.publicKey,
                decimals,
                mintAuthority,
                freezeAuthority,
                TOKEN_PROGRAM_ID
            )
        );

        transaction.partialSign(mintKeypair);

        const signedTx = await wallet.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(txid);

        alert(`Token created! Mint address: ${mintKeypair.publicKey.toBase58()}`);
    }

    return (

        
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }}>

            



            <h1>Solana Token Launchpad</h1>
            <input className='inputText' type='text' placeholder='Name' /> <br />
            <input className='inputText' type='text' placeholder='Symbol' /> <br />
            <input className='inputText' type='text' placeholder='Image URL' /> <br />
            <input className='inputText' type='text' placeholder='Initial Supply' /> <br />
            <button onClick={createToken} className='btn'>Create a token</button>
        </div>
    );
}
