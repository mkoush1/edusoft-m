// Email validation regex
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    return 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
  }
  return '';
};

// Password validation check
export const isValidPassword = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return !!password && strongPasswordRegex.test(password);
};

// Name validation
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// Role validation
export const validateRole = (role) => {
  if (!role) return 'Role is required';
  const validRoles = ['student', 'instructor', 'admin', 'supervisor'];
  if (!validRoles.includes(role)) return 'Invalid role selected';
  return '';
};

// Validation messages
export const validationMessages = {
  name: {
    required: 'Name is required',
    invalid: 'Name must be at least 2 characters long'
  },
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address'
  },
  password: {
    required: 'Password is required',
    invalid: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
  },
  role: {
    required: 'Role is required',
    invalid: 'Please select a valid role'
  }
};

// Form validation
export const validateForm = (formData) => {
  const errors = {};

  if (!isValidName(formData.name)) {
    errors.name = validationMessages.name.invalid;
  }

  if (!isValidEmail(formData.email)) {
    errors.email = validationMessages.email.invalid;
  }

  if (!isValidPassword(formData.password)) {
    errors.password = validationMessages.password.invalid;
  }

  if (formData.role && !isValidRole(formData.role)) {
    errors.role = validationMessages.role.invalid;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 