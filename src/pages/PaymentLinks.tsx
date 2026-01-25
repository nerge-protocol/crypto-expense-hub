import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Check, Link, ExternalLink, Plus, Trash2, QrCode, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ChainType, CHAIN_CONFIG } from '@/types/merchant';

interface PaymentLink {
  id: string;
  name: string;
  amount: number;
  currency: string;
  chain: ChainType;
  description?: string;
  customerEmail?: string;
  reference: string;
  url: string;
  createdAt: Date;
}

const PaymentLinks = () => {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency] = useState('NGN');
  const [chain, setChain] = useState<ChainType>('tron');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const generateReference = () => {
    return 'PAY-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const generateCheckoutUrl = (params: {
    amount: number;
    currency: string;
    chain: ChainType;
    reference: string;
    description?: string;
    email?: string;
  }) => {
    const baseUrl = window.location.origin + '/checkout';
    const searchParams = new URLSearchParams();
    
    searchParams.set('amount', params.amount.toString());
    searchParams.set('currency', params.currency);
    searchParams.set('chain', params.chain);
    searchParams.set('ref', params.reference);
    
    if (params.description) {
      searchParams.set('desc', params.description);
    }
    if (params.email) {
      searchParams.set('email', params.email);
    }
    
    return `${baseUrl}?${searchParams.toString()}`;
  };

  const handleCreateLink = () => {
    if (!name.trim()) {
      toast.error('Please enter a link name');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const reference = generateReference();
    const url = generateCheckoutUrl({
      amount: amountNum,
      currency,
      chain,
      reference,
      description: description || undefined,
      email: customerEmail || undefined,
    });

    const newLink: PaymentLink = {
      id: crypto.randomUUID(),
      name: name.trim(),
      amount: amountNum,
      currency,
      chain,
      description: description || undefined,
      customerEmail: customerEmail || undefined,
      reference,
      url,
      createdAt: new Date(),
    };

    setLinks(prev => [newLink, ...prev]);
    
    // Reset form
    setName('');
    setAmount('');
    setDescription('');
    setCustomerEmail('');
    
    toast.success('Payment link created!');
  };

  const copyToClipboard = async (link: PaymentLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    toast.success('Payment link deleted');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Payment Links</h1>
        <p className="text-muted-foreground">Create and share payment links with your customers</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Create Link Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Payment Link
            </CardTitle>
            <CardDescription>
              Generate a checkout URL to share with customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Link Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Product Purchase, Invoice #123"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (NGN) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="50000"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chain">Preferred Chain</Label>
                <Select value={chain} onValueChange={(v) => setChain(v as ChainType)}>
                  <SelectTrigger id="chain">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CHAIN_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.name} ({config.fee})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Payment for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Customer Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <Button onClick={handleCreateLink} className="w-full gradient-primary">
              <Link className="mr-2 h-4 w-4" />
              Generate Payment Link
            </Button>
          </CardContent>
        </Card>

        {/* Generated Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Your Payment Links
            </CardTitle>
            <CardDescription>
              {links.length === 0 
                ? 'No links created yet' 
                : `${links.length} link${links.length === 1 ? '' : 's'} created`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Create your first payment link</p>
                <p className="text-sm">Fill out the form to generate a shareable checkout URL</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-lg border border-border bg-muted/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{link.name}</h4>
                        <p className="text-lg font-bold text-primary">
                          ₦{link.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {CHAIN_CONFIG[link.chain].name} • {link.reference}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded bg-background border border-border">
                      <code className="text-xs flex-1 truncate text-muted-foreground">
                        {link.url}
                      </code>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(link)}
                        >
                          {copiedId === link.id ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {/* QR Code Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-center">{link.name}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4 py-4">
                              <div className="p-4 bg-white rounded-xl shadow-lg">
                                <QRCodeSVG
                                  id={`qr-${link.id}`}
                                  value={link.url}
                                  size={200}
                                  level="H"
                                  includeMargin
                                  bgColor="#ffffff"
                                  fgColor="#000000"
                                />
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-primary">
                                  ₦{link.amount.toLocaleString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {CHAIN_CONFIG[link.chain].name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Ref: {link.reference}
                                </p>
                              </div>
                              <div className="flex gap-2 w-full">
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => copyToClipboard(link)}
                                >
                                  {copiedId === link.id ? (
                                    <>
                                      <Check className="mr-2 h-4 w-4" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy Link
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => {
                                    const svg = document.getElementById(`qr-${link.id}`);
                                    if (svg) {
                                      const svgData = new XMLSerializer().serializeToString(svg);
                                      const canvas = document.createElement('canvas');
                                      const ctx = canvas.getContext('2d');
                                      const img = new Image();
                                      img.onload = () => {
                                        canvas.width = img.width;
                                        canvas.height = img.height;
                                        ctx?.drawImage(img, 0, 0);
                                        const pngUrl = canvas.toDataURL('image/png');
                                        const downloadLink = document.createElement('a');
                                        downloadLink.href = pngUrl;
                                        downloadLink.download = `payment-qr-${link.reference}.png`;
                                        downloadLink.click();
                                      };
                                      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                                    }
                                    toast.success('QR code downloaded');
                                  }}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentLinks;
