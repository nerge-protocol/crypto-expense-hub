import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Globe, Bell, Key, Copy, Eye, EyeOff, RefreshCw, Save, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useMerchantProfile, useUpdateProfile, useUpdateBankAccount, useApiKeys, useRegenerateApiKeys } from '@/hooks/useMerchant';
import { Skeleton } from '@/components/ui/skeleton';

export default function Settings() {
  const { data: profile, isLoading: isProfileLoading } = useMerchantProfile();
  const { data: apiKeys, isLoading: isKeysLoading } = useApiKeys();
  const updateProfile = useUpdateProfile();
  const updateBankAccount = useUpdateBankAccount();
  const regenerateKeys = useRegenerateApiKeys();

  const [showSecretKey, setShowSecretKey] = useState(false);

  // Local state for forms
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    email: '',
    businessWebsite: '',
  });

  const [bankForm, setBankForm] = useState({
    accountNumber: '',
    accountName: '',
    bankCode: '',
    bankName: '',
  });

  // Sync state when data loads
  useEffect(() => {
    if (profile) {
      setBusinessForm({
        businessName: profile.businessName || '',
        email: profile.email || '',
        businessWebsite: profile.businessWebsite || '',
      });
      if (profile.bankAccount) {
        setBankForm({
          accountNumber: profile.bankAccount.accountNumber || '',
          accountName: profile.bankAccount.accountName || '',
          bankCode: profile.bankAccount.bankCode || '058',
          bankName: profile.bankAccount.bankName || '',
        });
      }
    }
  }, [profile]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleUpdateProfile = () => {
    updateProfile.mutate(businessForm);
  };

  const handleUpdateBank = () => {
    updateBankAccount.mutate(bankForm);
  };

  const handleRegenerateKeys = () => {
    if (confirm('Are you sure? This will invalidate your existing keys immediately.')) {
      regenerateKeys.mutate({ testMode: profile?.testMode || false });
    }
  };

  if (isProfileLoading || isKeysLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="business" className="data-[state=active]:bg-card">
            <Building2 className="w-4 h-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="data-[state=active]:bg-card">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-card">
            <Globe className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="settlements" className="data-[state=active]:bg-card">
            <Bell className="w-4 h-4 mr-2" />
            Settlements
          </TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessForm.businessName}
                    onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={businessForm.businessWebsite}
                    onChange={(e) => setBusinessForm({ ...businessForm, businessWebsite: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button onClick={handleUpdateProfile} className="gradient-primary" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Bank Account</CardTitle>
              <CardDescription>Your settlement destination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Select
                    value={bankForm.bankCode}
                    onValueChange={(v) => setBankForm({ ...bankForm, bankCode: v, bankName: v === '058' ? 'GTBank' : 'Other Bank' })}
                  >
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="058">GTBank</SelectItem>
                      <SelectItem value="044">Access Bank</SelectItem>
                      <SelectItem value="011">First Bank</SelectItem>
                      <SelectItem value="033">UBA</SelectItem>
                      <SelectItem value="057">Zenith Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="0123456789"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="Business Name Ltd"
                    value={bankForm.accountName}
                    onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button onClick={handleUpdateBank} className="gradient-primary" disabled={updateBankAccount.isPending}>
                  {updateBankAccount.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Update Bank Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Use these keys to authenticate API requests. Never share your secret key.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm text-warning flex items-center gap-2">
                  <span className="font-semibold">Test Mode:</span>
                  {profile?.testMode ? 'Active - No real payments will be processed' : 'Inactive - Live payments enabled'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Public Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={apiKeys?.publicKey || 'Loading...'}
                      readOnly
                      className="bg-muted/50 font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiKeys?.publicKey || '', 'Public key')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Safe to use in frontend code and checkout widgets
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showSecretKey ? 'text' : 'password'}
                      value={apiKeys?.secretKey || 'Loading...'}
                      readOnly
                      className="bg-muted/50 font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                    >
                      {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiKeys?.secretKey || '', 'Secret key')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep this secret! Only use in your backend server.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button variant="destructive" className="gap-2" onClick={handleRegenerateKeys} disabled={regenerateKeys.isPending}>
                  {regenerateKeys.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Regenerate Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks (Placeholder) */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Receive real-time notifications when payment events occur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground">Webhook configuration will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlements (Placeholder) */}
        <TabsContent value="settlements" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Settlement Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive your funds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-muted-foreground">Settlement preferences will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
