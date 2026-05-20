import CryptoJS from 'crypto-js';

const BASE_URL = 'https://n8n.aflows.uk/webhook';

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

interface RegisterData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  access_token?: string;
  refresh_token?: string;
  business_id?: string;
  business_name?: string;
  business_owner?: string;
  email?: string;
  role?: 'owner' | 'staff';
  staff_id?: string;
  subscription_tier?: 'starter' | 'growth' | 'pro';
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  trial_ends_at?: string | null;
}

export const registerBusiness = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/register-business`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      password: hashPassword(data.password),
    }),
  });

  const text = await response.text();

  if (!text) {
    throw new Error("Empty response from server");
  }

  const parsed = JSON.parse(text);

  if (!response.ok) {
    throw new Error(parsed.message || 'Registration failed');
  }

  return parsed;
};


// export const registerBusiness = async (data: RegisterData): Promise<AuthResponse> => {
//   const response = await fetch(`${BASE_URL}/register-business`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       ...data,
//       password: hashPassword(data.password),
//     }),
//   });

//   if (!response.ok) {
//     throw new Error('Registration failed');
//   }

//   return response.json();
// };

export const loginBusiness = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/login-business`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      password: hashPassword(data.password),
    }),
  });

  const json = await response.json();
  const parsed = Array.isArray(json) ? json[0] : json;

  if (!response.ok) {
    throw new Error(parsed.message || 'Login failed');
  }

  return parsed;
};

interface FileUploadData {
  file: File;
  fileType: string;
  token: string;
}

export const uploadBusinessFile = async ({ file, fileType, token }: FileUploadData): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  const response = await fetch(`${BASE_URL}/upload-business-file`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  return response.json();
};

interface SaleData {
  customerName: string;
  itemSold: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
}

export const recordSale = async (data: SaleData, token: string): Promise<{ success: boolean; message: string; receiptUrl?: string }> => {
  const response = await fetch(`${BASE_URL}/record-sale`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to record sale');
  }

  return response.json();
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${BASE_URL}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword: hashPassword(currentPassword),
      newPassword: hashPassword(newPassword),
    }),
  });

  const text = await response.text();

  if (!text) {
    throw new Error("Empty response from server");
  }

  const parsed = JSON.parse(text);

  if (!response.ok) {
    throw new Error(parsed.message || 'Failed to change password');
  }

  return parsed;
};
