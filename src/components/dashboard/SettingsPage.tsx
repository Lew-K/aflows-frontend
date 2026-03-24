import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Upload, Pencil, Check } from "lucide-react";

export const SettingsPage = () => {
  const { user } = useAuth();

  /* ---------------- STATE ---------------- */
  const [settings, setSettings] = useState({
    business_name: "",
    phone: "",
    location: "Nairobi, Kenya",
    currency: "KES",
    receipt_prefix: "RCT",
    receipt_footer: "Thank you for your business",
    tax_rate: "",
    business_logo_url: "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [editingFields, setEditingFields] = useState({
    business_name: false,
    phone: false,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------------- LOAD FROM AUTH ---------------- */
  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        business_name: user.businessName || "",
        phone: "", // will come from backend later
      }));
    }
  }, [user]);

  /* ---------------- CLEANUP ---------------- */
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleEdit = (field: string) => {
    setEditingFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Max file size is 2MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);

    // TODO: send to n8n
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFile(e.target.files[0]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);
  };

  /* ---------------- COMPONENT ---------------- */
  const EditableField = ({ label, field, value, placeholder }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleEdit(field)}
        >
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

      {/* 1️⃣ BUSINESS PROFILE */}
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
            />
          </div>

        </CardContent>
      </Card>

      {/* 1B️⃣ LOGO */}
      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-4 ${
              isDragging ? "border-primary bg-primary/5" : "border-muted"
            }`}
          >
            {(logoPreview || settings.business_logo_url) ? (
              <img
                src={logoPreview || settings.business_logo_url}
                className="w-24 h-24 object-contain border rounded-lg"
              />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary"
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

      {/* 2️⃣ TEAM & ACCESS */}
      <Card>
        <CardHeader>
          <CardTitle>Team & Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="text-sm text-muted-foreground">
            Manage who has access to your business
          </div>

          {/* Placeholder list */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{user?.ownerName} (You)</span>
              <span className="text-muted-foreground">Owner</span>
            </div>
          </div>

          <Button variant="outline" size="sm">
            Add User (coming soon)
          </Button>

        </CardContent>
      </Card>

      {/* 3️⃣ RECEIPT SETTINGS */}
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

      {/* 4️⃣ SECURITY */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                Change your account password
              </p>
            </div>

            <Button size="sm" variant="outline">
              Change Password
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Sessions</p>
              <p className="text-xs text-muted-foreground">
                Manage logged-in devices (coming soon)
              </p>
            </div>

            <Button size="sm" variant="ghost" disabled>
              Manage
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* SAVE */}
      <div className="flex justify-end pb-10">
        <Button onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
};
