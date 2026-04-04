import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Upload, Save, Eye, EyeOff, Check, X } from "lucide-react";

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
    tax_rate: "16",
    business_logo_url: "",
  });

  const [originalSettings, setOriginalSettings] = useState(null);

  const [logoPreview, setLogoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* ---------------- PASSWORD STATE ---------------- */
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  /* ---------------- INIT FROM AUTH ---------------- */
  useEffect(() => {
    if (user) {
      const initial = {
        business_name: user.businessName || "",
        phone: "",
        location: "Nairobi, Kenya",
        currency: "KES",
        receipt_prefix: "RCT",
        receipt_footer: "Thank you for your business",
        tax_rate: "16",
        business_logo_url: "",
      };

      setSettings(initial);
      setOriginalSettings(initial);
    }
  }, [user]);

  /* ---------------- CHANGE DETECTION ---------------- */
  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    console.log("Saving settings:", settings);

    setTimeout(() => {
      setIsSaving(false);
      setOriginalSettings(settings);
    }, 1000);
  };

  /* ---------------- LOGO ---------------- */
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
  };

  /* ---------------- PASSWORD LOGIC ---------------- */

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: "Weak", value: 25 };
    if (score === 2) return { label: "Medium", value: 50 };
    if (score === 3) return { label: "Strong", value: 75 };
    return { label: "Very Strong", value: 100 };
  };

  const strength = getPasswordStrength(passwordData.new);

  const passwordError = useMemo(() => {
    if (!passwordData.new) return "";
    if (passwordData.new.length < 8) return "Password must be at least 8 characters";
    if (passwordData.new !== passwordData.confirm) return "Passwords do not match";
    return "";
  }, [passwordData]);

  const handlePasswordUpdate = () => {
    if (passwordError) return;

    console.log("Updating password...");
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full max-w-full mx-auto px-4 md:px-8 lg:px-12 py-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your business settings</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasChanges && <span className="text-sm text-orange-500">● Unsaved changes</span>}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-8 space-y-8">

          {/* BUSINESS */}
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Your business details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">

              <Input
                value={settings.business_name}
                onChange={(e) => handleChange("business_name", e.target.value)}
                placeholder="Business Name"
              />

              <Input
                value={settings.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+254..."
              />

              <Input
                value={settings.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Location"
              />

              <select
                value={settings.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                className="h-10 border rounded-md px-3"
              >
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="UGX">UGX</option>
              </select>

            </CardContent>
          </Card>

          {/* RECEIPT */}
          <Card>
            <CardHeader>
              <CardTitle>Receipt Customization</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">

              <Input
                value={settings.receipt_prefix}
                onChange={(e) => handleChange("receipt_prefix", e.target.value)}
              />

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={settings.tax_rate}
                  onChange={(e) => handleChange("tax_rate", e.target.value)}
                />
                <span>%</span>
              </div>

              <Input
                value={settings.receipt_footer}
                onChange={(e) => handleChange("receipt_footer", e.target.value)}
              />

            </CardContent>
          </Card>

        </div>

        {/* RIGHT */}
        <div className="lg:col-span-4 space-y-8">

          {/* BRANDING */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }}
                className={`border-2 border-dashed rounded-xl p-6 text-center ${isDragging ? "border-primary" : ""}`}
              >
                {logoPreview ? (
                  <img src={logoPreview} className="w-24 mx-auto" />
                ) : (
                  <p>Upload Logo</p>
                )}

                <Button onClick={() => fileInputRef.current?.click()} className="mt-4">
                  Choose File
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => processFile(e.target.files[0])}
                />
              </div>
            </CardContent>
          </Card>

          {/* PASSWORD */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {["current", "new", "confirm"].map((field) => (
                <div key={field} className="relative">
                  <Input
                    type={showPassword[field] ? "text" : "password"}
                    placeholder={field + " password"}
                    value={passwordData[field]}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                  />
                  <button
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
                    }
                    className="absolute right-3 top-2"
                  >
                    {showPassword[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ))}

              {/* STRENGTH */}
              {passwordData.new && (
                <div>
                  <div className="h-2 bg-muted rounded">
                    <div
                      className="h-2 bg-primary rounded"
                      style={{ width: `${strength.value}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1">{strength.label}</p>
                </div>
              )}

              {passwordError && (
                <p className="text-xs text-red-500">{passwordError}</p>
              )}

              <Button onClick={handlePasswordUpdate} disabled={!!passwordError}>
                Update Password
              </Button>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
