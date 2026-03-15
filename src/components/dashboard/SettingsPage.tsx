import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Upload, Pencil, Check } from "lucide-react";

export const SettingsPage = () => {
  /* ---------------- STATE ---------------- */
  const [settings, setSettings] = useState({
    business_name: "My Business",
    phone: "+254 700 000 000",
    location: "Nairobi, Kenya",
    currency: "KES",
    receipt_prefix: "RCT",
    receipt_footer: "Thank you for your business",
    tax_rate: "",
    business_logo_url: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Track which fields are in "Edit Mode"
  const [editingFields, setEditingFields] = useState({
    business_name: false,
    phone: false,
  });

  const fileInputRef = useRef(null);

  /* ---------------- EFFECTS ---------------- */
  // Clean up memory from object URLs
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleEdit = (field) => {
    setEditingFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    // Logic for Supabase upload would go here
  };

  const handleLogoUpload = (e) => {
    processFile(e.target.files[0]);
  };

  /* Drag and Drop Handlers */
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
  };

  /* ---------------- UI HELPERS ---------------- */
  const EditableField = ({ label, field, value, placeholder }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary h-8 px-2"
          onClick={() => toggleEdit(field)}
        >
          {editingFields[field] ? (
            <span className="flex items-center gap-1 text-green-600"><Check className="w-4 h-4" /> Done</span>
          ) : (
            <span className="flex items-center gap-1"><Pencil className="w-3 h-3" /> Change</span>
          )}
        </Button>
      </div>
      <Input
        disabled={!editingFields[field]}
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className={!editingFields[field] ? "bg-muted/50" : "border-primary"}
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage business profile and system configuration
          </p>
        </div>
      </div>

      {/* BUSINESS PROFILE */}
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          
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

          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={settings.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="City / Area"
            />
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={settings.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
            >
              <option value="KES">KES (Kenyan Shilling)</option>
              <option value="UGX">UGX (Ugandan Shilling)</option>
              <option value="NGN">NGN (Nigerian Naira)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* LOGO UPLOAD WITH DRAG & DROP */}
      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center gap-4 ${
              isDragging ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            {(logoPreview || settings.business_logo_url) ? (
              <div className="relative group">
                <img
                  src={logoPreview || settings.business_logo_url}
                  alt="logo preview"
                  className="w-32 h-32 object-contain bg-white border rounded-lg shadow-sm"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                   <p className="text-white text-xs">Drop new image to replace</p>
                </div>
              </div>
            ) : (
              <div className="bg-muted p-4 rounded-full">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm font-medium">
                Drag and drop your logo here, or{" "}
                <button 
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG or JPG (Max 2MB)
              </p>
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleLogoUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* RECEIPT SETTINGS */}
      <Card>
        <CardHeader>
          <CardTitle>Receipt Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Receipt Prefix</Label>
            <Input
              value={settings.receipt_prefix}
              onChange={(e) => handleChange("receipt_prefix", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt Footer Message</Label>
            <Input
              value={settings.receipt_footer}
              onChange={(e) => handleChange("receipt_footer", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              value={settings.tax_rate}
              onChange={(e) => handleChange("tax_rate", e.target.value)}
              placeholder="e.g. 16"
            />
          </div>
        </CardContent>
      </Card>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pb-10">
        <Button onClick={handleSave} size="lg" className="px-8">
          Save All Changes
        </Button>
      </div>
    </div>
  );
};
