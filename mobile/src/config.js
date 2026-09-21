// Expo chi nhung bien EXPO_PUBLIC_* vao bundle khi viet dung nguyen van process.env.EXPO_PUBLIC_...
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Qua thoi gian nay ma server chua tra loi thi bao loi ket noi (thuong do sai IP hoac chan firewall)
export const REQUEST_TIMEOUT_MS = 10000;
