import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet, Copy, Check, AlertCircle, Loader2, ExternalLink, X, CheckCircle2 } from 'lucide-react';
import { useWallet, WalletType, ChainType as WalletChainType } from '@/hooks/useWallet';
import { ChainType } from '@/types/merchant';
import { toast } from 'sonner';

interface PaymentData {
  merchantName: string;
  merchantLogo: string;
  amount: number;
  currency: string;
  reference: string;
  email: string;
  description?: string;
  publicKey: string;
  callbackUrl: string;
  metadata: {
    orderId: string;
    customerName: string;
  };
}

interface Chain {
  id: string;
  name: string;
  icon: string;
  fee: string;
  popular?: boolean;
  wallets: { type: WalletType; name: string; icon: string; color: string }[];
}

type Step = 'initial' | 'wallet-connect' | 'payment' | 'processing' | 'success' | 'failed';

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const wallet = useWallet();
  
  // Parse URL parameters
  const urlAmount = searchParams.get('amount');
  const urlCurrency = searchParams.get('currency');
  const urlChain = searchParams.get('chain') as ChainType | null;
  const urlRef = searchParams.get('ref');
  const urlDesc = searchParams.get('desc');
  const urlEmail = searchParams.get('email');

  const [isOpen, setIsOpen] = useState(false);
  
  // Payment data from URL params or defaults
  const paymentData = useMemo<PaymentData>(() => ({
    merchantName: "Tech Store Nigeria",
    merchantLogo: "https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=TS",
    amount: urlAmount ? parseFloat(urlAmount) : 50000,
    currency: urlCurrency || "NGN",
    reference: urlRef || "TXN-" + Date.now(),
    email: urlEmail || "customer@example.com",
    description: urlDesc || undefined,
    publicKey: "pk_test_xxxxxxxxxxxxx",
    callbackUrl: "https://merchant.com/verify",
    metadata: {
      orderId: "ORD-12345",
      customerName: "John Doe"
    }
  }), [urlAmount, urlCurrency, urlRef, urlDesc, urlEmail]);

  // Chain configurations with available wallets
  const chains: Chain[] = [
    { 
      id: 'tron', 
      name: 'Tron (TRC20)', 
      icon: '🔷', 
      fee: 'Low (~$2)', 
      popular: !urlChain || urlChain === 'tron',
      wallets: [
        { type: 'tronlink' as WalletType, name: 'TronLink', icon: '🔷', color: 'bg-red-500' },
      ]
    },
    { 
      id: 'base', 
      name: 'Base', 
      icon: '🔵', 
      fee: 'Very Low (~$0.30)', 
      popular: urlChain === 'base',
      wallets: [
        { type: 'metamask' as WalletType, name: 'MetaMask', icon: '🦊', color: 'bg-orange-500' },
        { type: 'trustwallet' as WalletType, name: 'Trust Wallet', icon: '🛡️', color: 'bg-blue-500' },
      ]
    },
    { 
      id: 'arbitrum', 
      name: 'Arbitrum', 
      icon: '🔴', 
      fee: 'Low (~$0.50)', 
      popular: urlChain === 'arbitrum',
      wallets: [
        { type: 'metamask' as WalletType, name: 'MetaMask', icon: '🦊', color: 'bg-orange-500' },
        { type: 'trustwallet' as WalletType, name: 'Trust Wallet', icon: '🛡️', color: 'bg-blue-500' },
      ]
    },
    { 
      id: 'solana', 
      name: 'Solana', 
      icon: '🟣', 
      fee: 'Extremely Low (~$0.0001)', 
      popular: urlChain === 'solana',
      wallets: [
        { type: 'phantom' as WalletType, name: 'Phantom', icon: '👻', color: 'bg-purple-500' },
      ]
    }
  ];

  // Pre-select chain if provided in URL
  const preSelectedChain = urlChain ? chains.find(c => c.id === urlChain) || null : null;

  const [step, setStep] = useState<Step>('initial');
  const [selectedChain, setSelectedChain] = useState<Chain | null>(preSelectedChain);
  const [escrowCreated, setEscrowCreated] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  const usdtRate = 1420;
  const cryptoAmount = (paymentData.amount / usdtRate).toFixed(2);
  const platformFee = (parseFloat(cryptoAmount) * 0.015).toFixed(2);
  const totalCrypto = (parseFloat(cryptoAmount) + parseFloat(platformFee)).toFixed(2);

  useEffect(() => {
    if (step === 'payment' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const connectWallet = async (walletType: WalletType) => {
    if (!selectedChain) return;
    
    const success = await wallet.connect(walletType, selectedChain.id as WalletChainType);
    if (success) {
      setStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!wallet.isConnected || !wallet.address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setStep('processing');
    
    try {
      // Simulate escrow creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEscrowCreated(true);
      
      // Generate mock transaction hash
      const mockTxHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setTxHash(mockTxHash);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      setStep('success');
      
      toast.success('Payment completed successfully!');
    } catch (error) {
      console.error('Payment error:', error);
      setStep('failed');
      toast.error('Payment failed. Please try again.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getBlockExplorerUrl = (chain: Chain | null, hash: string) => {
    if (!chain) return '#';
    switch (chain.id) {
      case 'tron': return `https://tronscan.org/#/transaction/${hash}`;
      case 'base': return `https://basescan.org/tx/${hash}`;
      case 'arbitrum': return `https://arbiscan.io/tx/${hash}`;
      case 'solana': return `https://solscan.io/tx/${hash}`;
      default: return '#';
    }
  };

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Crypto Payment Widget Demo</h1>
          <p className="text-muted-foreground mb-8">Paystack-like checkout experience for crypto payments</p>
          <button
            onClick={() => setIsOpen(true)}
            className="gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all"
          >
            Open Payment Widget
          </button>

          <div className="mt-12 bg-card/50 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-border">
            <h3 className="text-foreground font-semibold mb-4">Payment Details:</h3>
            <div className="space-y-2 text-left text-muted-foreground text-sm">
              <div className="flex justify-between">
                <span>Merchant:</span>
                <span className="text-foreground font-medium">{paymentData.merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="text-foreground font-medium">₦{paymentData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <span className="text-foreground font-medium text-xs">{paymentData.reference}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-border">

        {/* Header */}
        <div className="gradient-primary p-6 relative rounded-t-2xl">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-primary-foreground/80 hover:text-primary-foreground"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={paymentData.merchantLogo}
              alt={paymentData.merchantName}
              className="w-16 h-16 rounded-xl bg-white/10 border-2 border-white/20"
            />
            <div className="text-primary-foreground">
              <p className="text-sm opacity-90">Pay to</p>
              <h2 className="text-xl font-bold">{paymentData.merchantName}</h2>
            </div>
          </div>

          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-primary-foreground/80 text-sm">Amount to pay</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary-foreground">₦{paymentData.amount.toLocaleString()}</span>
              <span className="text-primary-foreground/60 text-sm">≈ ${cryptoAmount} USDT</span>
            </div>
            {paymentData.description && (
              <p className="text-primary-foreground/70 text-sm mt-2">{paymentData.description}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">

          {/* Step 1: Chain Selection */}
          {step === 'initial' && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Select Payment Network</h3>
                <p className="text-sm text-muted-foreground">Choose the blockchain network for your payment</p>
              </div>

              <div className="space-y-2">
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => {
                      setSelectedChain(chain);
                      setStep('wallet-connect');
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left hover:border-primary hover:shadow-md ${
                      chain.popular ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{chain.icon}</span>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {chain.name}
                            {chain.popular && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{chain.fee}</div>
                        </div>
                      </div>
                      <div className="text-muted-foreground">→</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-primary">
                  Your payment will be held in escrow until the merchant confirms receipt
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Wallet Connection */}
          {step === 'wallet-connect' && (
            <div className="space-y-4 animate-slide-up">
              <button
                onClick={() => {
                  wallet.disconnect();
                  setStep('initial');
                }}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                ← Back to networks
              </button>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Connect Wallet</h3>
                <p className="text-sm text-muted-foreground">Connect your {selectedChain?.name} wallet to continue</p>
              </div>

              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="text-sm text-muted-foreground mb-1">Network</div>
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <span className="text-2xl">{selectedChain?.icon}</span>
                  {selectedChain?.name}
                </div>
              </div>

              {/* Connected wallet display */}
              {wallet.isConnected && wallet.address && (
                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-success text-sm mb-2">
                    <CheckCircle2 size={16} />
                    <span className="font-medium">Wallet Connected</span>
                  </div>
                  <div className="text-xs text-success/80 font-mono break-all">
                    {wallet.address}
                  </div>
                  <button
                    onClick={() => setStep('payment')}
                    className="mt-3 w-full gradient-primary text-primary-foreground py-2 rounded-lg font-medium text-sm"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Wallet options */}
              {!wallet.isConnected && (
                <div className="space-y-2">
                  {selectedChain?.wallets.map((w) => (
                    <button
                      key={w.type}
                      onClick={() => connectWallet(w.type)}
                      disabled={wallet.isConnecting}
                      className="w-full p-4 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${w.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                          {w.icon}
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-foreground block">{w.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {w.type === 'metamask' && 'Browser extension'}
                            {w.type === 'trustwallet' && 'Mobile wallet'}
                            {w.type === 'phantom' && 'Solana wallet'}
                            {w.type === 'tronlink' && 'Tron wallet'}
                          </span>
                        </div>
                      </div>
                      {wallet.isConnecting ? (
                        <Loader2 size={20} className="animate-spin text-primary" />
                      ) : (
                        <Wallet size={20} className="text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Wallet detection notice */}
              <div className="bg-muted/50 border border-border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Don't have a wallet? Install{' '}
                  {selectedChain?.id === 'solana' ? (
                    <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Phantom
                    </a>
                  ) : selectedChain?.id === 'tron' ? (
                    <a href="https://www.tronlink.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      TronLink
                    </a>
                  ) : (
                    <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      MetaMask
                    </a>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Payment Confirmation */}
          {step === 'payment' && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Confirm Payment</h3>
                <div className="text-sm bg-warning/10 text-warning px-3 py-1 rounded-full font-medium">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Connected wallet */}
              {wallet.isConnected && wallet.address && (
                <div className="bg-muted rounded-xl p-3 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-success" />
                      <span className="text-sm text-muted-foreground">Connected:</span>
                    </div>
                    <span className="text-sm font-mono text-foreground">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">You will pay</div>
                <div className="text-3xl font-bold text-foreground">{totalCrypto} USDT</div>
                <div className="text-sm text-muted-foreground mt-1">
                  on {selectedChain?.name}
                </div>
              </div>

              <div className="space-y-2 bg-muted rounded-xl p-4 border border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">{cryptoAmount} USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee (1.5%)</span>
                  <span className="font-medium text-foreground">{platformFee} USDT</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-foreground">{totalCrypto} USDT</span>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-primary">
                  <p className="font-medium mb-1">Escrow Protection</p>
                  <p>Your funds will be held safely until the merchant confirms your payment. If anything goes wrong, you'll get an automatic refund.</p>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!wallet.isConnected}
                className="w-full gradient-primary text-primary-foreground py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet size={20} />
                Pay {totalCrypto} USDT
              </button>

              <button
                onClick={() => {
                  wallet.disconnect();
                  setStep('wallet-connect');
                }}
                className="w-full text-muted-foreground py-2 text-sm hover:text-foreground"
              >
                Change wallet
              </button>
            </div>
          )}

          {/* Step 4: Processing */}
          {step === 'processing' && (
            <div className="space-y-6 py-8 text-center animate-scale-in">
              <div className="flex justify-center">
                <div className="relative">
                  <Loader2 className="animate-spin text-primary" size={64} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wallet className="text-primary" size={24} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {!escrowCreated ? 'Creating Escrow...' : 'Processing Payment...'}
                </h3>
                <p className="text-muted-foreground">
                  {!escrowCreated
                    ? 'Securing your funds in escrow contract'
                    : 'Converting crypto to NGN and sending to merchant'
                  }
                </p>
              </div>

              {escrowCreated && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-success text-sm mb-2">
                    <Check size={16} />
                    <span className="font-medium">Escrow Created</span>
                  </div>
                  <div className="text-xs text-success break-all font-mono">
                    {txHash.slice(0, 20)}...{txHash.slice(-10)}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${escrowCreated ? 'bg-success' : 'bg-primary animate-pulse'}`}></div>
                <div className={`w-3 h-3 rounded-full ${escrowCreated ? 'bg-primary animate-pulse' : 'bg-muted'}`}></div>
                <div className="w-3 h-3 rounded-full bg-muted"></div>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="space-y-6 py-8 text-center animate-scale-in">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center">
                  <Check className="text-success-foreground" size={40} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground">
                  ₦{paymentData.amount.toLocaleString()} has been sent to {paymentData.merchantName}
                </p>
              </div>

              <div className="bg-muted rounded-xl p-4 border border-border text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-medium text-foreground">{paymentData.reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium text-foreground">{selectedChain?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Wallet</span>
                  <span className="font-medium text-foreground font-mono">
                    {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Transaction</span>
                  <button
                    onClick={() => copyToClipboard(txHash)}
                    className="flex items-center gap-1 text-primary hover:text-primary/80"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <a
                href={getBlockExplorerUrl(selectedChain, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-primary hover:text-primary/80 text-sm"
              >
                View on blockchain explorer
                <ExternalLink size={14} />
              </a>

              <button
                onClick={() => {
                  wallet.disconnect();
                  setIsOpen(false);
                }}
                className="w-full bg-foreground text-background py-4 rounded-xl font-semibold hover:bg-foreground/90 transition-all"
              >
                Done
              </button>
            </div>
          )}

          {/* Step 6: Failed */}
          {step === 'failed' && (
            <div className="space-y-6 py-8 text-center animate-scale-in">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-destructive rounded-full flex items-center justify-center">
                  <X className="text-destructive-foreground" size={40} />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h3>
                <p className="text-muted-foreground">
                  Something went wrong. Please try again.
                </p>
              </div>

              <button
                onClick={() => {
                  setStep('payment');
                  setEscrowCreated(false);
                  setTxHash('');
                }}
                className="w-full gradient-primary text-primary-foreground py-4 rounded-xl font-semibold"
              >
                Try Again
              </button>

              <button
                onClick={() => {
                  wallet.disconnect();
                  setIsOpen(false);
                }}
                className="w-full text-muted-foreground py-2 text-sm hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 bg-muted/50 text-center rounded-b-2xl">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Secured by</span>
            <span className="font-bold gradient-primary-text">CryptoExpense</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
