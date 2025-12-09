import * as yup from 'yup';

const usernameSchema = yup.string().trim().min(3).max(32).matches(/^[a-zA-Z0-9_.-]+$/);
const passwordSchema = yup.string().min(8).max(128);

export function validateRegister({ username, password }) {
  try {
    usernameSchema.validateSync(username);
    passwordSchema.validateSync(password);
  } catch (e) {
    throw new Error('INVALID_INPUT');
  }
}

export function validateLogin({ username, password }) {
  try {
    usernameSchema.validateSync(username);
    passwordSchema.validateSync(password);
  } catch (e) {
    throw new Error('INVALID_INPUT');
  }
}
