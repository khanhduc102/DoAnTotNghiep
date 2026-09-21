// Goi API bang fetch co san. Tu gan token, doc dinh dang { success, data, message, errors }.
import { API_URL, REQUEST_TIMEOUT_MS } from '../config';

let authToken = null;
let onUnauthorized = null;

export const setAuthToken = (token) => {
  authToken = token;
};

// AuthContext dang ky ham nay: token het han / da logout / bi thu hoi -> dua ve man dang nhap
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status; // 0 = khong ket noi duoc server
    this.errors = errors; // [{ field, message }] khi loi validate
  }
}

// Doi mang errors [{ field, message }] cua API thanh { field: message } de hien duoi tung o nhap
export const toFieldErrors = (errors = []) =>
  Object.fromEntries(errors.map((e) => [e.field, e.message]));

export async function request(path, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Kiểm tra mạng và địa chỉ API.', 0);
  } finally {
    clearTimeout(timer);
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Chi coi la het phien khi dang co token; 401 luc dang nhap sai mat khau thi khong
    if (res.status === 401 && authToken && onUnauthorized) {
      onUnauthorized();
    }
    throw new ApiError(json.message || 'Có lỗi xảy ra, vui lòng thử lại', res.status, json.errors || []);
  }

  return json.data;
}
