// const BASE_URL = 'https://n8n.aflows.uk/webhook';
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.aflows.co.ke/api/v1';

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
  subscription_tier?: 'starter' | 'growth' | 'pro';
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  trial_ends_at?: string | null;
  user?: {
    businessId: string;
    businessName: string;
    ownerName: string;
    email?: string;
    role?: 'owner' | 'staff';
    staffId?: string;
    mustChangePassword?: boolean;
  };
}

export const registerBusiness = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
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



export const loginBusiness = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || 'Login failed');
  }
  
  return parsed;
};

interface FileUploadData {
  file: File;
  fileType: string;
}

export const uploadBusinessFile = async ({ file, fileType }: FileUploadData): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);

  const response = await fetch(`${API_BASE_URL}/business/upload-file`, {
    method: 'POST',
    credentials: 'include',
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

export const recordSale = async (data: SaleData): Promise<{ success: boolean; message: string; receiptUrl?: string }> => {
  const response = await fetch(`${API_BASE_URL}/record-sale`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
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
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      currentPassword,
      newPassword,
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

export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const parsed = await response.json();
  if (!response.ok) throw new Error(parsed.message || 'Token refresh failed');
  return parsed;
};

export const verifyEmailToken = async (token: string): Promise<{ success: boolean; message: string; email?: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || 'Email verification failed');
  }

  return parsed;
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || 'Failed to request password reset');
  }

  return parsed;
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newPassword }),
  });

  const parsed = await response.json();

  if (!response.ok) {
    throw new Error(parsed.message || 'Failed to reset password');
  }

  return parsed;
};

export const changePasswordStaff = async (
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/staff/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      currentPassword,
      newPassword,
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
