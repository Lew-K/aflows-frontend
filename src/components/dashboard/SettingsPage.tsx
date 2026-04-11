import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// import { Settings, Upload, Save, Eye, EyeOff, Check, X } from "lucide-react";
import { Settings, Upload, Save, Eye, EyeOff, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SettingsPage = () => {
  const { user } = useAuth();

  const [openSections, setOpenSections] = useState({
    password: false,
    access: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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

  const processFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
  
    // instant preview (UX)
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("businessId", user?.businessId);
  
    try {
      setIsUploading(true);
      setUploadProgress(0);
  
      const xhr = new XMLHttpRequest();
  
      xhr.open("POST", "https://n8n.aflows.uk/webhook/upload-logo");
  
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };
  
      xhr.onload = () => {
        setIsUploading(false);
  
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);
  
          // ✅ AUTO REFRESH LOGO FROM SERVER
          setSettings((prev) => ({
            ...prev,
            business_logo_url: res.logoUrl,
          }));
  
          setLogoPreview(null); // clear temp preview
        } else {
          console.error("Upload failed");
        }
      };
  
      xhr.onerror = () => {
        setIsUploading(false);
        console.error("Upload error");
      };
  
      xhr.send(formData);
  
    } catch (err) {
      setIsUploading(false);
      console.error(err);
    }
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
            <CardContent className="space-y-6">

              {/* Business Name */}
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <Input
                  value={settings.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  className="mt-1"
                />
              </div>
            
              {/* Phone */}
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <Input
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="mt-1"
                />
              </div>
            
              {/* Location */}
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <Input
                  value={settings.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="mt-1"
                />
              </div>
            
              {/* Currency */}
              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="UGX">UGX (Ugandan Shilling)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
            </CardContent>
          </Card>

          {/* RECEIPT */}
          <Card>
            <CardHeader>
              <CardTitle>Receipt Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div>
                <p className="text-sm text-muted-foreground">Receipt Prefix</p>
                <Input
                  value={settings.receipt_prefix}
                  onChange={(e) => handleChange("receipt_prefix", e.target.value)}
                  className="mt-1"
                />
              </div>
            
              <div>
                <p className="text-sm text-muted-foreground">Tax Rate (%)</p>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={settings.tax_rate}
                    onChange={(e) => handleChange("tax_rate", e.target.value)}
                  />
                  <span>%</span>
                </div>
              </div>
            
              <div>
                <p className="text-sm text-muted-foreground">Footer Message</p>
                <Input
                  value={settings.receipt_footer}
                  onChange={(e) => handleChange("receipt_footer", e.target.value)}
                  className="mt-1"
                />
              </div>
            
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
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  processFile(e.dataTransfer.files[0]);
                }}
                className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition ${
                  isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
              >
                {(logoPreview || settings.business_logo_url) ? (
                  <div className="relative group">
                    <img
                      src={logoPreview || settings.business_logo_url}
                      className="w-24 h-24 object-contain mx-auto rounded-lg border bg-white"
                    />
                
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition rounded-lg">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Replace
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setLogoPreview(null);
                          setSettings((prev) => ({
                            ...prev,
                            business_logo_url: "",
                          }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                
                    {/* Initials Logo */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      {settings.business_name
                        ?.split(" ")
                        .map(word => word[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "B"}
                    </div>
                
                    {/* Business Name */}
                    <p className="font-semibold">
                      {settings.business_name || "Your Business"}
                    </p>
                
                    {/* Helper Text */}
                    <p className="text-xs text-muted-foreground">
                      Your logo will appear on receipts and customer documents
                    </p>
                
                    {/* Upload Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Logo
                    </Button>
                
                    <p className="text-xs text-muted-foreground">
                      or drag & drop (PNG, JPG up to 5MB)
                    </p>
                
                  </div>
                )}

                {/* ✅Progress Bar */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                

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
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection("password")}
            >
              <div className="flex justify-between items-center">
                <CardTitle>Change Password</CardTitle>
                {openSections.password ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openSections.password ? "max-h-[1000px] opacity-100 mt-2" : "max-h-0 opacity-0"
              }`}
            >
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
          </div>
          </Card>

          {/* ACCESS & SESSIONS */}
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection("access")}
            >
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Access & Sessions</CardTitle>
                  <CardDescription>
                    Manage who can access your business and active sessions
                  </CardDescription>
                </div>
            
                {openSections.access ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openSections.access ? "max-h-[1000px] opacity-100 mt-2" : "max-h-0 opacity-0"
              }`}
            >
              <CardContent className="space-y-6">
          
              {/* Owner */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold">Owner</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "Owner account"}
                  </p>
                </div>
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active
                </span>
              </div>
          
              {/* Team Access */}
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-sm font-semibold">Team Members</p>
                  <p className="text-xs text-muted-foreground">
                    Give staff access with controlled permissions
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Invite / Manage
                </Button>
              </div>
          
              {/* Sessions */}
              <div className="flex justify-between items-center border-t pt-4">
                <div>
                  <p className="text-sm font-semibold">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">
                    You're currently logged in on this device
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
          
              {/* Danger Zone */}
              <div className="pt-4 border-t">
                <Button variant="destructive" className="w-full" size="sm">
                  Sign Out of All Devices
                </Button>
              </div>
          
            </CardContent>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
