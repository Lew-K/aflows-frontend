import { changePassword } from '@/lib/api';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';
import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeamManagementModal } from '@/components/dashboard/modals/TeamManagementModal';
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useAccess } from "@/hooks/useAccess";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Settings,
  Eye,
  EyeOff,
  Check,
  Receipt,
  Tag,
  Upload,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─────────────────────────────────────────────
   RECEIPT PREVIEW
───────────────────────────────────────────── */
const ReceiptPreview = ({ settings }) => {
  const now = new Date();

  const dateStr = now.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const sampleItems = [
    { name: "Product A", qty: 2, price: 500 },
    { name: "Product B", qty: 1, price: 1200 },
    { name: "Service C", qty: 3, price: 350 },
  ];

  const subtotal = sampleItems.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

  const taxRate = parseFloat(settings.tax_rate) || 0;

  const discountValue = parseFloat(settings.discount_value) || 0;

  const discountAmount =
    settings.discount_type === "percentage"
      ? (subtotal * discountValue) / 100
      : discountValue;

  const discountedSubtotal = Math.max(
    0,
    subtotal - discountAmount
  );

  const taxAmount = (discountedSubtotal * taxRate) / 100;

  const total = discountedSubtotal + taxAmount;

  const fmt = (n) =>
    `KES ${n.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
    })}`;

  const Divider = () => (
    <div className="border-t border-dashed border-input my-2" />
  );

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-4 font-mono text-xs text-slate-950 max-w-xs mx-auto select-none">
      {/* HEADER */}
      <div className="text-center space-y-1 mb-3">
        {settings.business_logo_url ? (
          <img
            src={settings.business_logo_url}
            alt="logo"
            className="w-14 h-14 object-contain mx-auto"
          />
        ) : (
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary">
            {settings.business_name
              ?.split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "B"}
          </div>
        )}

        <p className="font-bold text-sm text-gray-900">
          {settings.business_name || "Your Business"}
        </p>

        {settings.location && (
          <p className="text-gray-500 text-[10px]">
            {settings.location}
          </p>
        )}

        {settings.phone && (
          <p className="text-gray-500 text-[10px]">
            {settings.phone}
          </p>
        )}

        {settings.kra_pin && (
          <p className="text-gray-500 text-[10px]">
            PIN: {settings.kra_pin}
          </p>
        )}
      </div>

      <Divider />

      {/* RECEIPT META */}
      <div className="flex justify-between text-[10px] text-gray-500 mb-2">
        <span>
          Receipt #
          {settings.receipt_prefix || "RCT"}-
          {String(settings.next_receipt_number || "42").padStart(4, "0")}
        </span>

        <span>{dateStr}</span>
      </div>

      <div className="text-[10px] text-gray-400 mb-2 text-right">
        {timeStr}
      </div>

      <Divider />

      {/* ITEMS */}
      <div className="space-y-1 mb-2">
        <div className="flex justify-between text-[10px] font-semibold text-gray-500 uppercase mb-1">
          <span className="flex-1">Item</span>
          <span className="w-8 text-center">Qty</span>
          <span className="w-20 text-right">Amount</span>
        </div>

        {sampleItems.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="flex-1 truncate">
              {item.name}
            </span>

            <span className="w-8 text-center">
              {item.qty}
            </span>

            <span className="w-20 text-right">
              {fmt(item.qty * item.price)}
            </span>
          </div>
        ))}
      </div>

      <Divider />

      {/* TOTALS */}
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

      {/* EXTRA BUSINESS INFO */}
      <div className="space-y-1 mt-2">
        {settings.paybill_number && (
          <p className="text-center text-[10px] text-gray-500">
            Paybill / Till: {settings.paybill_number}
          </p>
        )}

        {settings.website && (
          <p className="text-center text-[10px] text-gray-500 truncate">
            {settings.website}
          </p>
        )}
      </div>

      {/* FOOTER */}
      <p className="text-center text-[10px] text-gray-400 italic mt-3">
        {settings.receipt_footer || "Thank you for your business"}
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SETTINGS PAGE
───────────────────────────────────────────── */
export const SettingsPage = () => {

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  
  const { user, accessToken } = useAuth();

  const { addNotification } = useNotifications();

  const { business, refreshBusiness } = useData();

  const { can } = useAccess();

  /* ─────────────────────────────────────────────
     SETTINGS STATE
  ────────────────────────────────────────────── */
  const [settings, setSettings] = useState({
    business_name: "",
    phone: "",
    location: "Nairobi, Kenya",

    receipt_prefix: "RCT",
    next_receipt_number: "42",

    receipt_footer: "Thank you for your business",

    tax_rate: "0",

    business_logo_url: "",

    discount_type: "percentage",
    discount_value: "",

    kra_pin: "",
    paybill_number: "",
    website: "",
  });

  const [originalSettings, setOriginalSettings] = useState(null);

  const [logoPreview, setLogoPreview] = useState(null);

  const [isDragging, setIsDragging] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [isUploading, setIsUploading] = useState(false);

  /* ─────────────────────────────────────────────
     PASSWORD STATE
  ────────────────────────────────────────────── */
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

  /* ─────────────────────────────────────────────
     INIT
  ────────────────────────────────────────────── */
  useEffect(() => {
    if (!business) return;

    const loaded = {
      business_name: business.business_name || "",
      phone: business.phone || "",
      location: business.location || "Nairobi, Kenya",

      receipt_prefix: business.receipt_prefix || "RCT",

      next_receipt_number:
        business.next_receipt_number || "42",

      receipt_footer:
        business.receipt_footer ||
        "Thank you for your business",

      tax_rate: business.tax_rate ?? "0",

      business_logo_url: business.logo_url || "",

      discount_type:
        business.discount_type || "percentage",

      discount_value:
        business.discount_value ?? "",

      kra_pin: business.kra_pin || "",

      paybill_number:
        business.paybill_number || "",

      website: business.website || "",
    };

    setSettings(loaded);

    setOriginalSettings(loaded);
  }, [business]);

  /* ─────────────────────────────────────────────
     CHANGE DETECTION
  ────────────────────────────────────────────── */
  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  /* ─────────────────────────────────────────────
     HANDLERS
  ────────────────────────────────────────────── */
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ─────────────────────────────────────────────
     SAVE
  ────────────────────────────────────────────── */
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const res = await fetch(
        "https://api.aflows.uk/api/v1/business/settings",
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },

          body: JSON.stringify({
            business_name: settings.business_name,
            phone: settings.phone,
            location: settings.location,

            receipt_prefix: settings.receipt_prefix,
            next_receipt_number:
              settings.next_receipt_number,

            tax_rate: settings.tax_rate,

            receipt_footer:
              settings.receipt_footer,

            discount_type:
              settings.discount_type,

            discount_value:
              settings.discount_value,

            kra_pin: settings.kra_pin,

            paybill_number:
              settings.paybill_number,

            website: settings.website,
          }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(
          data.message || "Failed to save settings"
        );
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

  /* ─────────────────────────────────────────────
     LOGO
  ────────────────────────────────────────────── */
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

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

      xhr.open(
        "POST",
        "https://api.aflows.uk/api/v1/business/logo"
      );

      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round(
            (event.loaded / event.total) * 100
          );

          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);

        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);

          setSettings((prev) => ({
            ...prev,
            business_logo_url: res.logoUrl,
          }));

          setLogoPreview(null);

          toast.success("Logo uploaded successfully");

          addNotification(
            "success",
            "Logo updated",
            "Your new logo will appear on all receipts and documents going forward."
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

  /* ─────────────────────────────────────────────
     PASSWORD
  ────────────────────────────────────────────── */
  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 8) score++;

    if (/[A-Z]/.test(password)) score++;

    if (/[0-9]/.test(password)) score++;

    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1)
      return {
        label: "Weak",
        value: 25,
        color: "bg-red-400",
      };

    if (score === 2)
      return {
        label: "Medium",
        value: 50,
        color: "bg-yellow-400",
      };

    if (score === 3)
      return {
        label: "Strong",
        value: 75,
        color: "bg-blue-400",
      };

    return {
      label: "Very Strong",
      value: 100,
      color: "bg-green-500",
    };
  };

  const strength = getPasswordStrength(passwordData.new);

  const passwordError = useMemo(() => {
    if (!passwordData.new) return "";

    if (passwordData.new.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (passwordData.new !== passwordData.confirm) {
      return "Passwords do not match";
    }

    return "";
  }, [passwordData]);

  const handlePasswordUpdate = async () => {
    if (passwordError) return;

    if (!accessToken) return;

    try {
      const res = await changePassword(
        passwordData.current,
        passwordData.new,
        accessToken
      );

      setPasswordData({
        current: "",
        new: "",
        confirm: "",
      });

      toast.success(
        res.message || "Password updated successfully"
      );

      addNotification(
        "success",
        "Password changed",
        "Your password was updated successfully."
      );
    } catch (err) {
      console.error(err);

      toast.error("Failed to update password");
    }
  };

  /* ─────────────────────────────────────────────
     UI
  ────────────────────────────────────────────── */
  return (
    <div className="bg-background">
      {/* HEADER */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="w-full px-4 md:px-6 py-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Settings className="w-5 h-5 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Settings
              </h1>

              <p className="text-sm text-muted-foreground mt-1">
                Manage your business identity, receipts,
                security and access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full px-4 md:px-6 py-8 space-y-8">
        {/* BUSINESS PROFILE */}
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* LOGO */}
              <div className="flex flex-col items-center lg:items-start">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();

                    setIsDragging(false);

                    processFile(e.dataTransfer.files[0]);
                  }}
                  className={`relative group w-36 h-36 rounded-3xl overflow-hidden border bg-muted flex items-center justify-center ${
                    isDragging
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  {logoPreview ||
                  settings.business_logo_url ? (
                    <img
                      src={
                        logoPreview ||
                        settings.business_logo_url
                      }
                      alt="logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl font-bold text-muted-foreground">
                      {settings.business_name
                        ?.split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "B"}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  </div>

                  {isUploading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${uploadProgress}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  PNG or JPG • Max 5MB
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    processFile(e.target.files[0])
                  }
                />
              </div>

              {/* FIELDS */}
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    Business Profile
                  </h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Your business identity and branding.
                  </p>
                </div>

                <hr className="border-border/40" />

                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Business Name
                    </p>

                    <Input
                      value={settings.business_name}
                      onChange={(e) =>
                        handleChange(
                          "business_name",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Phone Number
                      </p>

                      <Input
                        value={settings.phone}
                        onChange={(e) =>
                          handleChange(
                            "phone",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Location
                      </p>

                      <Input
                        value={settings.location}
                        onChange={(e) =>
                          handleChange(
                            "location",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RECEIPT SETTINGS */}
        {can("settings_business") && (
          <Card className="border border-border/60 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* LEFT */}
                <div className="lg:col-span-7 p-8 space-y-8">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Receipt Customization
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1">
                      Configure how your receipts appear.
                    </p>
                  </div>

                  <hr className="border-border/40" />

                  {/* RECEIPT */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Receipt Prefix
                      </p>

                      <Input
                        value={settings.receipt_prefix}
                        onChange={(e) =>
                          handleChange(
                            "receipt_prefix",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Next Receipt Number
                      </p>

                      <Input
                        value={
                          settings.next_receipt_number
                        }
                        onChange={(e) =>
                          handleChange(
                            "next_receipt_number",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* TAX */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Tax Rate (%)
                      </p>

                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.tax_rate}
                        onChange={(e) =>
                          handleChange(
                            "tax_rate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        KRA PIN
                      </p>

                      <Input
                        placeholder="P051XXXXXXZ"
                        value={settings.kra_pin}
                        onChange={(e) =>
                          handleChange(
                            "kra_pin",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* PAYBILL */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Paybill / Till Number
                      </p>

                      <Input
                        value={
                          settings.paybill_number
                        }
                        onChange={(e) =>
                          handleChange(
                            "paybill_number",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Website / Social
                      </p>

                      <Input
                        placeholder="instagram.com/yourbusiness"
                        value={settings.website}
                        onChange={(e) =>
                          handleChange(
                            "website",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <hr className="border-border/40" />

                  {/* DISCOUNT */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-primary" />

                      <div>
                        <p className="font-medium">
                          Default Discount
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Applied automatically to new
                          receipts.
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Discount Type
                        </p>

                        <Select
                          value={
                            settings.discount_type
                          }
                          onValueChange={(value) =>
                            handleChange(
                              "discount_type",
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentage (%)
                            </SelectItem>

                            <SelectItem value="fixed">
                              Fixed Amount
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {settings.discount_type ===
                          "percentage"
                            ? "Discount %"
                            : "Amount (KES)"}
                        </p>

                        <Input
                          type="number"
                          value={
                            settings.discount_value
                          }
                          onChange={(e) =>
                            handleChange(
                              "discount_value",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-border/40" />

                  {/* FOOTER */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Receipt Footer
                    </p>

                    <Input
                      value={settings.receipt_footer}
                      onChange={(e) =>
                        handleChange(
                          "receipt_footer",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {/* RIGHT */}
                <div className="lg:col-span-5 border-l border-border/40 bg-muted/20">
                  <div className="lg:sticky lg:top-6 p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Receipt className="w-4 h-4 text-primary" />

                      <div>
                        <p className="font-medium">
                          Live Preview
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Updates instantly as you edit
                        </p>
                      </div>
                    </div>

                    <ReceiptPreview settings={settings} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SECURITY */}
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-8 space-y-8">
            <div>
              <h2 className="text-xl font-semibold">
                Security & Password
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Protect your business account.
              </p>
            </div>

            <hr className="border-border/40" />

            <div className="space-y-4 max-w-xl">
              {["current", "new", "confirm"].map(
                (field) => (
                  <div
                    key={field}
                    className="relative"
                  >
                    <Input
                      type={
                        showPassword[field]
                          ? "text"
                          : "password"
                      }
                      placeholder={`${field} password`}
                      value={passwordData[field]}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          [field]:
                            e.target.value,
                        }))
                      }
                    />

                    <button
                      className="absolute right-3 top-2"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          [field]:
                            !prev[field],
                        }))
                      }
                    >
                      {showPassword[field] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                )
              )}

              {passwordData.new && (
                <div>
                  <div className="h-2 bg-muted rounded">
                    <div
                      className={`h-2 rounded transition-all ${strength.color}`}
                      style={{
                        width: `${strength.value}%`,
                      }}
                    />
                  </div>

                  <p className="text-xs mt-1">
                    {strength.label}
                  </p>
                </div>
              )}

              {passwordError && (
                <p className="text-xs text-red-500">
                  {passwordError}
                </p>
              )}

              <Button
                onClick={handlePasswordUpdate}
                disabled={
                  !!passwordError ||
                  !passwordData.current ||
                  !passwordData.new
                }
              >
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ACCESS */}
        {can("team_management") && (
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="p-8 space-y-8">
              <div>
                <h2 className="text-xl font-semibold">
                  Access & Team Management
                </h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Manage permissions and active sessions.
                </p>
              </div>

              <hr className="border-border/40" />

              <div className="space-y-6">
                {/* OWNER */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      Owner
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>

                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Active
                  </span>
                </div>

                {/* TEAM */}
                <div className="flex justify-between items-center border-t border-border/40 pt-6">
                  <div>
                    <p className="font-medium">
                      Team Members
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Invite and manage staff access.
                    </p>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setTeamModalOpen(true)}>
                    Invite / Manage
                  </Button>
                </div>

                {/* SESSIONS */}
                <div className="flex justify-between items-center border-t border-border/40 pt-6">
                  <div>
                    <p className="font-medium">
                      Active Sessions
                    </p>

                    <p className="text-sm text-muted-foreground">
                      You are currently logged in on
                      this device.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                  >
                    View
                  </Button>
                </div>

                {/* DANGER */}
                <div className="border-t border-border/40 pt-6">
                  <Button
                    variant="destructive"
                    size="sm"
                  >
                    Sign Out of All Devices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {teamModalOpen && (
        <TeamManagementModal
          onClose={() => setTeamModalOpen(false)}
          businessName={business?.business_name || user?.businessName || ''}
        />
      )}

      {/* FLOATING SAVE BAR */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{
              opacity: 0,
              y: 100,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 100,
              scale: 0.95,
            }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-background/80 backdrop-blur-md border border-border/60 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />

                <span className="text-sm font-medium">
                  Unsaved changes
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSettings(originalSettings)
                  }
                >
                  Discard
                </Button>

                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
