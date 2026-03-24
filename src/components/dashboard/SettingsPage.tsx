import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Upload, Pencil, Check, X, Save } from "lucide-react";

export const SettingsPage = () => {
  /* ---------------- STATE ---------------- */
  const [settings, setSettings] = useState({
    business_name: "My Business",
    phone: "+254 700 000 000",
    location: "Nairobi, Kenya",
    currency: "KES",
    receipt_prefix: "RCT",
    receipt_footer: "Thank you for your business",
    tax_rate: "16", // Changed to string for input consistency
    business_logo_url: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Added loading state

  const [editingFields, setEditingFields] = useState({
    business_name: false,
    phone: false,
  });

  const fileInputRef = useRef(null);

  /* ---------------- EFFECTS ---------------- */
  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    
    // Revoke old preview before creating new one
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
  };

  const handleLogoUpload = (e) => processFile(e.target.files[0]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API Call
    console.log("Saving settings:", settings);
    setTimeout(() => {
      setIsSaving(false);
      // Here you'd trigger a Toast notification
      setEditingFields({ business_name: false, phone: false });
    }, 1000);
  };

  /* ---------------- UI HELPERS ---------------- */
  const EditableField = ({ label, field, value, placeholder }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-semibold">{label}</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => toggleEdit(field)}
          className="h-8 px-2"
        >
          {editingFields[field] ? (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <Check className="w-4 h-4" /> Save
            </span>
          ) : (
            <span className="flex items-center gap-1 text-primary">
              <Pencil className="w-3 h-3" /> Change
            </span>
          )}
        </Button>
      </div>
      <Input
        readOnly={!editingFields[field]}
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className={`${!editingFields[field] ? "bg-muted/30 cursor-not-allowed" : "ring-2 ring-primary/20"}`}
      />
    </div>
  );

  return (
    // Changed max-w-7xl to max-w-full and added padding
    <div className="w-full max-w-full mx-auto px-4 md:px-8 lg:px-12 py-6 space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure your business profile and application preferences.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
          {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN - Primary Settings */}
        <div className="lg:col-span-8 space-y-8">
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Public information about your company.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditableField
                  label="Business Name"
                  field="business_name"
                  value={settings.business_name}
                  placeholder="Enter business name"
                />
                <EditableField
                  label="Phone Number"
                  field="phone"
                  value={settings.phone}
                  placeholder="+254..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Location</Label>
                <Input
                  value={settings.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Physical Address"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Currency</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  value={settings.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                >
                  <option value="KES text-black">KES (Kenyan Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="UGX">UGX (Ugandan Shilling)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Receipt Customization</CardTitle>
              <CardDescription>How your customers see their invoices.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-semibold">Receipt Prefix</Label>
                <Input
                  value={settings.receipt_prefix}
                  onChange={(e) => handleChange("receipt_prefix", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={settings.tax_rate}
                  onChange={(e) => handleChange("tax_rate", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-semibold">Footer Message</Label>
                <Input
                  value={settings.receipt_footer}
                  onChange={(e) => handleChange("receipt_footer", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - Assets & Security */}
        <div className="lg:col-span-4 space-y-8">
          
          <Card className="shadow-sm border-dashed">
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                { (logoPreview || settings.business_logo_url) ? (
                  <div className="relative group">
                    <img
                      src={logoPreview || settings.business_logo_url}
                      className="w-32 h-32 object-contain border rounded-lg bg-white"
                      alt="Logo"
                    />
                    <button 
                      onClick={() => setLogoPreview(null)}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-4">PNG, JPG up to 5MB</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Security & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold">Owner Access</p>
                  <p className="text-xs text-muted-foreground text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active Session
                  </p>
                </div>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full" size="sm">
                  Sign Out of All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
