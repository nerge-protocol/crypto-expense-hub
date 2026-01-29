import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Check, Link, ExternalLink, Plus, Trash2, QrCode, Download, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ChainType, CHAIN_CONFIG } from '@/types/merchant';
import { usePaymentLinks, useCreatePaymentLink, useDeletePaymentLink } from '@/hooks/useMerchant';
import { Skeleton } from '@/components/ui/skeleton';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'; // 'https://checkout.synledger.com';

const PaymentLinks = () => {
  const { data: links, isLoading, error } = usePaymentLinks();
  const createLink = useCreatePaymentLink();
  const deleteLinkHook = useDeletePaymentLink();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency] = useState('NGN');
  const [chain, setChain] = useState<ChainType>('tron');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

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

    createLink.mutate({
      name: name.trim(),
      amount: amountNum,
      currency,
      chain,
      description: description || undefined,
      customerEmail: customerEmail || undefined,
    }, {
      onSuccess: () => {
        // Reset form
        setName('');
        setAmount('');
        setDescription('');
        setCustomerEmail('');
      }
    });
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteLink = (id: string) => {
    if (confirm('Are you sure you want to delete this payment link?')) {
      deleteLinkHook.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Failed to load payment links</h3>
        <p className="text-muted-foreground">Please try refreshing the page</p>
      </div>
    );
  }

  const safeLinks = links || [];

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

            <Button onClick={handleCreateLink} className="w-full gradient-primary" disabled={createLink.isPending}>
              {createLink.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Generate Payment Link
                </>
              )}
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
              {safeLinks.length === 0
                ? 'No links created yet'
                : `${safeLinks.length} link${safeLinks.length === 1 ? '' : 's'} created`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {safeLinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Create your first payment link</p>
                <p className="text-sm">Fill out the form to generate a shareable checkout URL</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {safeLinks.map((link) => (
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
                          {link.reference ? (
                            <>
                              {link.chain ? CHAIN_CONFIG[link.chain as ChainType]?.name : 'Unknown Chain'} • {link.reference}
                            </>
                          ) : (
                            'Reference pending'
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => handleDeleteLink(link.id)}
                        disabled={deleteLinkHook.isPending}
                      >
                        {deleteLinkHook.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded bg-background border border-border">
                      <code className="text-xs flex-1 truncate text-muted-foreground">
                        {/*window.location.origin + '/checkout?ref=' + link.slug /* Simple URL construction for now, backend provides full URL usually but let's use slug */}
                        {/* Actually PaymentLink entity has `slug` but frontend uses full URL? */}
                        {/* Let's assume link object has full url if backend provides it, otherwise construct it */}
                        {/* The mock had `url`, my DTO has `url`. So let's rely on `link.url` if present, else construct */}
                        {link.url || `${BACKEND_URL}/checkout?ref=${link.slug}`}
                      </code>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyToClipboard(link.url || `${BACKEND_URL}/checkout?ref=${link.slug}`, link.id)}
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
                              <DialogDescription className="text-center sr-only">
                                QR code for payment link
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4 py-4">
                              <div className="p-4 bg-white rounded-xl shadow-lg">
                                <QRCodeSVG
                                  id={`qr-${link.id}`}
                                  value={link.url || `${BACKEND_URL}/checkout?ref=${link.slug}`}
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
                                  {link.chain ? CHAIN_CONFIG[link.chain as ChainType]?.name : 'Any Chain'}
                                </p>
                              </div>
                              <div className="flex gap-2 w-full">
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => copyToClipboard(link.url || `${BACKEND_URL}/checkout?ref=${link.slug}`, link.id)}
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
                                        downloadLink.download = `payment-qr-${link.slug}.png`;
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
                          <a href={link.url || `${BACKEND_URL}/checkout?ref=${link.slug}`} target="_blank" rel="noopener noreferrer">
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
