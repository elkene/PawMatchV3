export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos una mayúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos un número' };
  }
  return { valid: true };
}

export function validateRegisterInput(email, password, name) {
  if (!email || !password || !name) {
    return { valid: false, error: 'Todos los campos son requeridos' };
  }
  if (!validateEmail(email)) {
    return { valid: false, error: 'Email inválido' };
  }
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return passwordCheck;
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  return { valid: true };
}
