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

  const [editingFields, setEditingFields] = useState({
    business_name: false,
    phone: false,
  });

  const fileInputRef = useRef(null);

  /* ---------------- EFFECTS ---------------- */
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
  };

  const handleLogoUpload = (e) => {
    processFile(e.target.files[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
  };

  /* ---------------- UI HELPERS ---------------- */
  const EditableField = ({ label, field, value, placeholder }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <Button variant="ghost" size="sm" onClick={() => toggleEdit(field)}>
          {editingFields[field] ? (
            <span className="flex items-center gap-1 text-green-600">
              <Check className="w-4 h-4" /> Done
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Pencil className="w-3 h-3" /> Change
            </span>
          )}
        </Button>
      </div>
      <Input
        disabled={!editingFields[field]}
        value={value}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className={!editingFields[field] ? "bg-muted/50" : ""}
      />
    </div>
  );

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

      {/* HEADER */}
      <div className="flex items-start gap-3">
        <Settings className="w-6 h-6 text-primary mt-1" />
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage business profile and system configuration
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">

          {/* BUSINESS PROFILE */}
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:gap-6">

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
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={settings.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                >
                  <option value="KES">KES</option>
                  <option value="UGX">UGX</option>
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                </select>
              </div>

            </CardContent>
          </Card>

          {/* LOGO */}
          <Card>
            <CardHeader>
              <CardTitle>Business Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-6 md:p-8 flex flex-col items-center gap-4 ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted"
                }`}
              >
                {(logoPreview || settings.business_logo_url) ? (
                  <img
                    src={logoPreview || settings.business_logo_url}
                    className="w-28 h-28 object-contain border rounded-lg"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-primary hover:underline"
                >
                  Upload Logo
                </button>

                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
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
            <CardContent className="grid gap-5 sm:gap-6">

              <div className="space-y-2">
                <Label>Receipt Prefix</Label>
                <Input
                  value={settings.receipt_prefix}
                  onChange={(e) => handleChange("receipt_prefix", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Footer Message</Label>
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
                />
              </div>

            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">

          {/* TEAM */}
          <Card>
            <CardHeader>
              <CardTitle>Team & Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage users and roles
              </p>

              <div className="flex justify-between text-sm">
                <span>Owner (You)</span>
                <span className="text-muted-foreground">Owner</span>
              </div>

              <Button variant="outline" size="sm">
                Add User
              </Button>
            </CardContent>
          </Card>

          {/* SECURITY */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">
                    Change your password
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Change
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Sessions</p>
                  <p className="text-xs text-muted-foreground">
                    Manage devices (coming soon)
                  </p>
                </div>
                <Button size="sm" variant="ghost" disabled>
                  Manage
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-4 pb-10">
        <Button onClick={handleSave} size="lg" className="px-8">
          Save Changes
        </Button>
      </div>

    </div>
  );
};
