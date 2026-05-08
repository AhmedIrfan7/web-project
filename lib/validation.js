export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password) {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  return null;
}

export function validateRegister({ name, email, password }) {
  const errors = {};
  if (!name?.trim()) errors.name = "Name is required";
  else if (name.trim().length < 2) errors.name = "Name must be at least 2 characters";

  if (!email?.trim()) errors.email = "Email is required";
  else if (!validateEmail(email)) errors.email = "Invalid email address";

  if (!password) errors.password = "Password is required";
  else {
    const pwErr = validatePassword(password);
    if (pwErr) errors.password = pwErr;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email is required";
  else if (!validateEmail(email)) errors.email = "Invalid email address";
  if (!password) errors.password = "Password is required";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateIssue({ title, description, category, location }) {
  const errors = {};
  const validCategories = ["Road", "Water", "Electricity", "Garbage", "Park", "Other"];

  if (!title?.trim()) errors.title = "Title is required";
  else if (title.trim().length < 5) errors.title = "Title must be at least 5 characters";
  else if (title.trim().length > 100) errors.title = "Title must be under 100 characters";

  if (!description?.trim()) errors.description = "Description is required";
  else if (description.trim().length < 10) errors.description = "Description must be at least 10 characters";
  else if (description.trim().length > 1000) errors.description = "Description must be under 1000 characters";

  if (!category) errors.category = "Category is required";
  else if (!validCategories.includes(category)) errors.category = "Invalid category";

  if (!location?.lat || !location?.lng) errors.location = "Please pin a location on the map";

  return { valid: Object.keys(errors).length === 0, errors };
}

export function sanitizeString(str) {
  return str.trim().replace(/[<>]/g, "");
}
