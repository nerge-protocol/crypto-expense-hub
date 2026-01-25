import { useState } from 'react';
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
import { Building2, Globe, Bell, Key, Copy, Eye, EyeOff, RefreshCw, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { merchantData, secretKey } = useAuth();
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [autoSettle, setAutoSettle] = useState(true);
  const [settlementSchedule, setSettlementSchedule] = useState('instant');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

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
                    defaultValue={merchantData?.businessName}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={merchantData?.email}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button onClick={handleSave} className="gradient-primary">
                  <Save className="w-4 h-4 mr-2" />
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
                  <Select defaultValue="058">
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
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="Business Name Ltd"
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button onClick={handleSave} className="gradient-primary">
                  <Save className="w-4 h-4 mr-2" />
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
                  {merchantData?.testMode ? 'Active - No real payments will be processed' : 'Inactive - Live payments enabled'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Public Key</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value="pk_test_xxxxxxxxxxxx"
                      readOnly
                      className="bg-muted/50 font-mono"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard('pk_test_xxxxxxxxxxxx', 'Public key')}
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
                      value={secretKey || 'sk_test_xxxxxxxxxxxx'}
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
                      onClick={() => copyToClipboard(secretKey || 'sk_test_xxxxxxxxxxxx', 'Secret key')}
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
                <Button variant="destructive" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Receive real-time notifications when payment events occur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://yourserver.com/webhook"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  We'll send POST requests to this URL for payment events
                </p>
              </div>

              <div className="space-y-4">
                <Label>Events</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <p className="font-medium">payment.success</p>
                      <p className="text-sm text-muted-foreground">When a payment is completed</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <p className="font-medium">payment.failed</p>
                      <p className="text-sm text-muted-foreground">When a payment fails</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div>
                      <p className="font-medium">settlement.completed</p>
                      <p className="text-sm text-muted-foreground">When funds are sent to your bank</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex gap-3">
                <Button onClick={handleSave} className="gradient-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Webhook Settings
                </Button>
                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Webhook Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlements */}
        <TabsContent value="settlements" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Settlement Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive your funds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="font-medium">Auto-Settlement</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically send funds to your bank account
                  </p>
                </div>
                <Switch checked={autoSettle} onCheckedChange={setAutoSettle} />
              </div>

              <div className="space-y-2">
                <Label>Settlement Schedule</Label>
                <Select value={settlementSchedule} onValueChange={setSettlementSchedule}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant (after each payment)</SelectItem>
                    <SelectItem value="daily">Daily (once per day)</SelectItem>
                    <SelectItem value="weekly">Weekly (every Sunday)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  When auto-settlement is enabled, funds will be transferred based on this schedule
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm">
                  <span className="font-semibold text-primary">Platform Fee:</span>{' '}
                  1.5% of each payment amount is deducted before settlement
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <Button onClick={handleSave} className="gradient-primary">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settlement Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
