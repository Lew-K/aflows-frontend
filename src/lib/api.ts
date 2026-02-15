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
  message: string;
  token?: string;
  user?: {
    businessId: string;
    businessName: string;
    ownerName: string;
    email: string;
  };
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

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
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
