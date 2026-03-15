import React, { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Settings, Upload } from "lucide-react";

export const SettingsPage = () => {

  /* ---------------- STATE ---------------- */

  const [settings, setSettings] = useState({
    business_name: "",
    phone: "",
    location: "",
    currency: "KES",

    receipt_prefix: "RCT",
    receipt_footer: "Thank you for your business",
    tax_rate: "",

    business_logo_url: "",
  });

  const [logoPreview, setLogoPreview] = useState(null);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);

    // Later this will upload to Supabase
  };

  const handleSave = () => {
    console.log("Saving settings:", settings);

    // Later call API
  };

  /* ---------------- PAGE ---------------- */

  return (
    <div className="space-y-6">

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

        <CardContent className="grid gap-4">

          <div>
            <Label>Business Name</Label>
            <Input
              value={settings.business_name}
              onChange={(e) =>
                handleChange("business_name", e.target.value)
              }
              placeholder="My Business"
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              value={settings.phone}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
              placeholder="+254..."
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={settings.location}
              onChange={(e) =>
                handleChange("location", e.target.value)
              }
              placeholder="City / Area"
            />
          </div>

          <div>
            <Label>Currency</Label>

            <select
              className="w-full border rounded-md p-2 text-sm"
              value={settings.currency}
              onChange={(e) =>
                handleChange("currency", e.target.value)
              }
            >
              <option value="KES">KES</option>
              <option value="UGX">UGX</option>
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
            </select>

          </div>

        </CardContent>
      </Card>

      {/* LOGO UPLOAD */}

      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {(logoPreview || settings.business_logo_url) && (
            <img
              src={logoPreview || settings.business_logo_url}
              alt="logo preview"
              className="w-24 h-24 object-contain border rounded-lg"
            />
          )}

          <div>
            <Label>Upload Logo</Label>

            <Input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleLogoUpload}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Accepted formats: PNG, JPG
          </p>

        </CardContent>
      </Card>

      {/* RECEIPT SETTINGS */}

      <Card>
        <CardHeader>
          <CardTitle>Receipt Settings</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">

          <div>
            <Label>Receipt Prefix</Label>
            <Input
              value={settings.receipt_prefix}
              onChange={(e) =>
                handleChange("receipt_prefix", e.target.value)
              }
            />
          </div>

          <div>
            <Label>Receipt Footer Message</Label>
            <Input
              value={settings.receipt_footer}
              onChange={(e) =>
                handleChange("receipt_footer", e.target.value)
              }
            />
          </div>

          <div>
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              value={settings.tax_rate}
              onChange={(e) =>
                handleChange("tax_rate", e.target.value)
              }
              placeholder="Optional"
            />
          </div>

        </CardContent>
      </Card>

      {/* SAVE BUTTON */}

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>

    </div>
  );
};
