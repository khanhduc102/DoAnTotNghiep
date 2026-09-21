// Rang buoc du lieu dau vao cho cac API xac thuc
const { z } = require('zod');

// SDT Viet Nam: bat dau 0 (10 so) hoac +84 (9 so sau ma vung)
const phoneSchema = z
  .string({ error: 'Số điện thoại không hợp lệ' })
  .trim()
  .regex(/^(0\d{9}|\+84\d{9})$/, 'Số điện thoại không hợp lệ');

const passwordSchema = z
  .string({ error: 'Vui lòng nhập mật khẩu' })
  .min(6, 'Mật khẩu tối thiểu 6 ký tự')
  .max(50, 'Mật khẩu tối đa 50 ký tự');

const emailSchema = z
  .string({ error: 'Vui lòng nhập email' })
  .trim()
  .toLowerCase()
  .email('Email không hợp lệ');

const fullNameSchema = z
  .string({ error: 'Vui lòng nhập họ tên' })
  .trim()
  .min(2, 'Họ tên tối thiểu 2 ký tự')
  .max(120, 'Họ tên tối đa 120 ký tự');

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  phone: phoneSchema.optional(),
  // Khong cho tu dang ky ADMIN - tai khoan ADMIN chi tao bang seed
  role: z
    .enum(['OWNER', 'TENANT'], { error: 'Vai trò chỉ được là TENANT hoặc OWNER' })
    .default('TENANT'),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: 'Vui lòng nhập mật khẩu' }).min(1, 'Vui lòng nhập mật khẩu'),
});

const updateProfileSchema = z
  .object({
    fullName: fullNameSchema.optional(),
    phone: phoneSchema.optional(),
    avatar: z.string().trim().max(255, 'Đường dẫn ảnh tối đa 255 ký tự').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Không có trường nào để cập nhật',
  });

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: 'Vui lòng nhập mật khẩu hiện tại' })
      .min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
  });

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
