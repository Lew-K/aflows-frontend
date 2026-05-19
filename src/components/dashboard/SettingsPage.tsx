import { changePassword } from '@/lib/api';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useAccess } from "@/hooks/useAccess";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save, Eye, EyeOff, Check, ChevronDown, ChevronUp, Receipt, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─────────────────────────────────────────────
   Inline Receipt Preview Component
───────────────────────────────────────────── */
const ReceiptPreview = ({ settings }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-KE", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-KE", {
    hour: "2-digit", minute: "2-digit",
  });

  const sampleItems = [
    { name: "Product A", qty: 2, price: 500 },
    { name: "Product B", qty: 1, price: 1200 },
    { name: "Service C", qty: 3, price: 350 },
  ];

  const subtotal = sampleItems.reduce((sum, i) => sum + i.qty * i.price, 0);
  const taxRate = parseFloat(settings.tax_rate) || 0;

  /* ── Discount calculation ── */
  const discountValue = parseFloat(settings.discount_value) || 0;
  const discountAmount =
    settings.discount_type === "percentage"
      ? (subtotal * discountValue) / 100
      : discountValue;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  const taxAmount = (discountedSubtotal * taxRate) / 100;
  const total = discountedSubtotal + taxAmount;

  const fmt = (n) => `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

  const Divider = () => (
    <div className="border-t border-dashed border-input my-2" />
  );

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 font-mono text-xs text-slate-950 max-w-xs mx-auto select-none">
      {/* Header */}
      <div className="text-center space-y-1 mb-3">
        {settings.business_logo_url ? (
          <img
            src={settings.business_logo_url}
            alt="logo"
            className="w-12 h-12 object-contain mx-auto"
          />
        ) : (
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary">
            {settings.business_name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "B"}
          </div>
        )}
        <p className="font-bold text-sm text-gray-900">
          {settings.business_name || "Your Business"}
        </p>
        {settings.location && (
          <p className="text-gray-500 text-[10px]">{settings.location}</p>
        )}
        {settings.phone && (
          <p className="text-gray-500 text-[10px]">{settings.phone}</p>
        )}
      </div>

      <Divider />

      {/* Receipt Meta */}
      <div className="flex justify-between text-[10px] text-gray-500 mb-2">
        <span>Receipt #{settings.receipt_prefix || "RCT"}-0042</span>
        <span>{dateStr}</span>
      </div>
      <div className="text-[10px] text-gray-400 mb-2 text-right">{timeStr}</div>

      <Divider />

      {/* Items */}
      <div className="space-y-1 mb-2">
        <div className="flex justify-between text-[10px] font-semibold text-gray-500 uppercase mb-1">
          <span className="flex-1">Item</span>
          <span className="w-8 text-center">Qty</span>
          <span className="w-20 text-right">Amount</span>
        </div>
        {sampleItems.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="flex-1 truncate">{item.name}</span>
            <span className="w-8 text-center">{item.qty}</span>
            <span className="w-20 text-right">{fmt(item.qty * item.price)}</span>
          </div>
        ))}
      </div>

      <Divider />

      {/* Totals */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span>Subtotal</span>
          <span>{fmt(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-[10px] text-green-600">
            <span>
              Discount{" "}
              {settings.discount_type === "percentage"
                ? `(${discountValue}%)`
                : "(Fixed)"}
            </span>
            <span>- {fmt(discountAmount)}</span>
          </div>
        )}

        {taxRate > 0 && (
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>VAT ({taxRate}%)</span>
            <span>{fmt(taxAmount)}</span>
          </div>
        )}

        <Divider />

        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL</span>
          <span>{fmt(total)}</span>
        </div>
      </div>

      <Divider />

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-400 italic mt-2">
        {settings.receipt_footer || "Thank you for your business"}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Settings Page
───────────────────────────────────────────── */
export const SettingsPage = () => {
  const { user, accessToken } = useAuth();
  const { addNotification } = useNotifications();
  const { business, refreshBusiness } = useData();
  const { can } = useAccess();

  const [openSections, setOpenSections] = useState({
    password: false,
    access: false,
    receiptPreview: false,  // open by default so live changes are visible
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  /* ── STATE ── */
  const [settings, setSettings] = useState({
    business_name: "",
    phone: "",
    location: "Nairobi, Kenya",
    receipt_prefix: "RCT",
    receipt_footer: "Thank you for your business",
    tax_rate: "0",
    business_logo_url: "",
    discount_type: "percentage",   // "percentage" | "fixed"
    discount_value: "",
  });

  const [originalSettings, setOriginalSettings] = useState(null);

  const [logoPreview, setLogoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  /* ── PASSWORD STATE ── */
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

  /* ── INIT FROM AUTH + FETCH SAVED SETTINGS ──
     FIX: populate business_logo_url from your API so the
     logo persists across page loads.
     Replace the fetch URL / response shape to match your API.
  ── */
  useEffect(() => {
    if (!business) return;

    const loaded = {
      business_name: business.business_name || "",
      phone: business.phone || "",
      location: business.location || "Nairobi, Kenya",
      receipt_prefix: business.receipt_prefix || "RCT",
      receipt_footer: business.receipt_footer || "Thank you for your business",
      tax_rate: business.tax_rate ?? "0",
      business_logo_url: business.logo_url || "",   // note: your API returns logo_url not business_logo_url
      discount_type: business.discount_type || "percentage",
      discount_value: business.discount_value ?? "",
    };
    setSettings(loaded);
    setOriginalSettings(loaded);
  }, [business]);

  /* ── CHANGE DETECTION ── */
  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  /* ── HANDLERS ── */
  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(
        "https://n8n.aflows.uk/webhook/update-business-settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            business_name: settings.business_name,
            phone: settings.phone,
            location: settings.location,
            receipt_prefix: settings.receipt_prefix,
            tax_rate: settings.tax_rate,
            receipt_footer: settings.receipt_footer,
            discount_type: settings.discount_type,
            discount_value: settings.discount_value,
          }),
        }
      );
  
      const data = await res.json();
  
      if (!data.success) {
        throw new Error(data.message || "Failed to save settings");
      }
  
      if (user?.businessId) {
        await refreshBusiness(user.businessId);
      }
  
      setOriginalSettings(settings);
      toast.success("Settings saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── LOGO ──
     FIX: stopPropagation is handled at call-sites of fileInputRef.current.click()
     inside the logo overlay buttons, so the outer div's onClick doesn't double-fire.
  ── */
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    // File size guard (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

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
          setSettings((prev) => ({ ...prev, business_logo_url: res.logoUrl }));
          setLogoPreview(null); // server URL takes over
          toast.success("Logo uploaded successfully");
          addNotification(
            'success',
            'Logo updated',
            'Your new logo will appear on all receipts and documents going forward.'
          );
        } else {
          toast.error("Logo upload failed");
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast.error("Logo upload error");
      };

      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      console.error(err);
    }
  };

  /* ── PASSWORD ── */
  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak", value: 25, color: "bg-red-400" };
    if (score === 2) return { label: "Medium", value: 50, color: "bg-yellow-400" };
    if (score === 3) return { label: "Strong", value: 75, color: "bg-blue-400" };
    return { label: "Very Strong", value: 100, color: "bg-green-500" };
  };

  const strength = getPasswordStrength(passwordData.new);

  const passwordError = useMemo(() => {
    if (!passwordData.new) return "";
    if (passwordData.new.length < 8) return "Password must be at least 8 characters";
    if (passwordData.new !== passwordData.confirm) return "Passwords do not match";
    return "";
  }, [passwordData]);

  const handlePasswordUpdate = async () => {
    if (passwordError) return;
    if (!accessToken) { console.error("No access token"); return; }
    try {
      const res = await changePassword(passwordData.current, passwordData.new, accessToken);
      setPasswordData({ current: "", new: "", confirm: "" });
      toast.success(res.message || "Password updated successfully");
      addNotification(
        'success',
        'Password changed',
        "Your password was updated successfully. If you didn't make this change, contact support immediately."
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update password");
    }
  };

  /* ─────────────────────────────────────────────
     UI
  ───────────────────────────────────────────── */
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
          {hasChanges && (
            <span className="text-sm text-orange-500">● Unsaved changes</span>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-7 space-y-8">

          {/* BUSINESS PROFILE */}
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <Input
                  value={settings.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <Input
                  value={settings.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <Input
                  value={settings.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* RECEIPT CUSTOMIZATION */}
          {can('settings_business') && <Card>
            <CardHeader>
              <CardTitle>Receipt Customization</CardTitle>
              <CardDescription>
                Configure how your receipts look. Toggle the preview to see changes live.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Receipt Prefix */}
              <div>
                <p className="text-sm text-muted-foreground">Receipt Prefix</p>
                <Input
                  value={settings.receipt_prefix}
                  onChange={(e) => handleChange("receipt_prefix", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Tax Rate */}
              <div>
                <p className="text-sm text-muted-foreground">Tax Rate (%)</p>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.tax_rate}
                    onChange={(e) => handleChange("tax_rate", e.target.value)}
                  />
                  <span>%</span>
                </div>
              </div>}

              {/* Footer Message */}
              <div>
                <p className="text-sm text-muted-foreground">Footer Message</p>
                <Input
                  value={settings.receipt_footer}
                  onChange={(e) => handleChange("receipt_footer", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* ── NEW: Discount Settings ── */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">Default Discount</p>
                </div>
                <p className="text-xs text-foreground -mt-2">
                  Set a default discount applied to all receipts. You can override this per transaction.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Discount Type */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Discount Type</p>
                    <Select
                      value={settings.discount_type}
                      onValueChange={(value) => handleChange("discount_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {settings.discount_type === "percentage" ? "Discount %" : "Amount (KES)"}
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={settings.discount_type === "percentage" ? "100" : undefined}
                        placeholder={settings.discount_type === "percentage" ? "e.g. 10" : "e.g. 200"}
                        value={settings.discount_value}
                        onChange={(e) => handleChange("discount_value", e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {settings.discount_type === "percentage" ? "%" : "KES"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="lg:col-span-5 space-y-8">

          {/* BRANDING / LOGO */}
          {can('settings_business') && <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent>
              {/*
                FIX: The outer div handles drag-and-drop and clicks on the
                *empty* area only. Inner buttons call e.stopPropagation()
                so the outer onClick never double-fires the file dialog.
              */}
              <div className="space-y-4">

                {/* Drop zone / preview area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    processFile(e.dataTransfer.files[0]);
                  }}
                  className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition min-h-[220px] ${
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                >
                  {(logoPreview || settings.business_logo_url) ? (
                    <img
                      src={logoPreview || settings.business_logo_url}
                      alt="Business logo"
                      className="w-48 h-48 object-contain rounded-lg border bg-white"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-48 h-48 rounded-xl bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                        {settings.business_name
                          ?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "B"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Drag & drop or use the button below
                      </p>
                    </div>
                  )}
              
                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="absolute bottom-3 left-4 right-4">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-center text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              
                {/* Business name + file info */}
                <div className="text-center space-y-0.5">
                  <p className="text-sm font-medium">
                    {settings.business_name || "Your Business"}
                  </p>
                  {(logoPreview || settings.business_logo_url) ? (
                    <p className="text-xs text-muted-foreground">
                      Logo uploaded · tap Replace to change
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      PNG or JPG · up to 5 MB
                    </p>
                  )}
                </div>
              
                {/* Action buttons — always visible, no hover tricks */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {(logoPreview || settings.business_logo_url) ? "Replace Logo" : "Upload Logo"}
                  </Button>
              
                  {(logoPreview || settings.business_logo_url) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setLogoPreview(null);
                        setSettings((prev) => ({ ...prev, business_logo_url: "" }));
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => processFile(e.target.files[0])}
                />
              
              </div>
            </CardContent>
          </Card>}

          {/* LIVE RECEIPT PREVIEW */}
          {can('settings_business') && <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection("receiptPreview")}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <CardTitle>Receipt Preview</CardTitle>
                </div>
                {openSections.receiptPreview ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <CardDescription>
                Updates live as you edit receipt settings
              </CardDescription>
            </CardHeader>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                openSections.receiptPreview
                  ? "max-h-[900px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <CardContent>
                <div className="bg-muted/20 rounded-lg px-2 py-8">
                  <ReceiptPreview settings={settings} />
                </div>
              </CardContent>
            </div>
          </Card>}

          {/* CHANGE PASSWORD */}
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
                      aria-label={showPassword[field] ? "Hide password" : "Show password"}
                      onClick={() =>
                        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
                      }
                      className="absolute right-3 top-2"
                    >
                      {showPassword[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                ))}

                {/* Strength Meter */}
                {passwordData.new && (
                  <div>
                    <div className="h-2 bg-muted rounded">
                      <div
                        className={`h-2 rounded transition-all ${strength.color}`}
                        style={{ width: `${strength.value}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1">{strength.label}</p>
                  </div>
                )}

                {passwordError && (
                  <p className="text-xs text-red-500">{passwordError}</p>
                )}

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={!!passwordError || !passwordData.current || !passwordData.new}
                >
                  Update Password
                </Button>
              </CardContent>
            </div>
          </Card>

          {/* ACCESS & SESSIONS */}
          {can('settings_business') && <Card>
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
          </Card>}

        </div>
      </div>
    </div>
  );
};
