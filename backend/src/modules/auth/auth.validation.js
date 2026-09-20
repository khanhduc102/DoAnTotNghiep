// Rang buoc du lieu dau vao cho cac API xac thuc
const { z } = require('zod');

// SDT Viet Nam: bat dau 0 (10 so) hoac +84 (9 so sau ma vung)
const phoneSchema = z
  .string()
  .trim()
  .regex(/^(0\d{9}|\+84\d{9})$/, 'So dien thoai khong hop le');

const passwordSchema = z
  .string()
  .min(6, 'Mat khau toi thieu 6 ky tu')
  .max(50, 'Mat khau toi da 50 ky tu');

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email khong hop le'),
  password: passwordSchema,
  fullName: z
    .string()
    .trim()
    .min(2, 'Ho ten toi thieu 2 ky tu')
    .max(120, 'Ho ten toi da 120 ky tu'),
  phone: phoneSchema.optional(),
  // Khong cho tu dang ky ADMIN - tai khoan ADMIN chi tao bang seed
  role: z.enum(['OWNER', 'TENANT']).default('TENANT'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email khong hop le'),
  password: z.string().min(1, 'Vui long nhap mat khau'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Thieu refresh token'),
});

const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Ho ten toi thieu 2 ky tu').max(120).optional(),
    phone: phoneSchema.optional(),
    avatar: z.string().trim().max(255).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Khong co truong nao de cap nhat',
  });

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui long nhap mat khau hien tai'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mat khau moi phai khac mat khau hien tai',
    path: ['newPassword'],
  });

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
};
