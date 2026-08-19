export const COLORS = {
  card: "var(--surface)",
  text: "var(--text)",
  label: "#374151",
  fieldBg: "#f6f8fa",
  fieldBorder: "#d0d7de",
  inputBg: "#ffffff",
  border: "var(--border)",
  placeholder: "#6b7280",

  brandNavy: "#1d2b64",
  brandBlue: "#1d2b64",
  brandBlueText: "#1d2b64",
  brandBlueSoft: "#e8e9f4",

  accent: "#1d2b64",
  accentSoft: "#e8e9f4",
  accentBorder: "#c9cbe2",
  accentText: "#1d2b64",

  danger: "#dc2626",
  dangerSoft: "#fef2f2",

  success: "#16a34a",
  successSoft: "#f0fdf4",

  warn: "#b45309",
  warnSoft: "#fffbeb",

  surface: "var(--surface)",
  surfaceAlt: "var(--surface-alt)",
};

export const RADIUS = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  pill: "999px",
};

export const SHADOWS = {
  card: "0 1px 2px rgba(16, 24, 40, 0.06)",
  pop: "0 6px 24px rgba(16, 24, 40, 0.14)",
  float: "0 6px 20px rgba(16, 24, 40, 0.35)",
};

export const FOCUS_RING = `0 0 0 3px ${COLORS.accentSoft}`;

export const LABEL_STYLE = {
  fontSize: "11px",
  fontWeight: "bold",
  color: COLORS.label,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  marginBottom: "6px",
};

export const INPUT_STYLE = {
  padding: "4px 6px",
  border: `1px solid ${COLORS.fieldBorder}`,
  borderRadius: "4px",
  background: COLORS.inputBg,
  color: COLORS.text,
};

export const rowButtonStyle = (disabled) => ({
  display: "flex",
  alignItems: "center",
  background: "transparent",
  border: "none",
  cursor: disabled ? "default" : "pointer",
  color: disabled ? COLORS.placeholder : COLORS.label,
  padding: "2px",
  borderRadius: "4px",
  flexShrink: 0,
});

export const addButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 10px",
  border: `1px solid ${COLORS.brandBlue}`,
  borderRadius: "4px",
  background: COLORS.brandBlueSoft,
  color: COLORS.brandBlueText,
  fontSize: "12px",
  cursor: "pointer",
};

export const cardStyle = {
  background: COLORS.card,
  color: COLORS.text,
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS.lg,
  padding: "12px 14px",
  boxShadow: SHADOWS.card,
};

export const menuStyle = {
  background: COLORS.card,
  color: COLORS.text,
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS.lg,
  boxShadow: SHADOWS.pop,
  padding: "6px",
};

export const dragHandleStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  borderRadius: RADIUS.sm,
  color: COLORS.placeholder,
  cursor: "grab",
  touchAction: "none",
};

export const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "8px 14px",
  border: "none",
  borderRadius: RADIUS.md,
  background: COLORS.brandNavy,
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: SHADOWS.card,
  transition: "background 0.15s ease",
};

export const ghostIconButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px",
  border: "none",
  borderRadius: RADIUS.md,
  background: "transparent",
  color: COLORS.placeholder,
  cursor: "pointer",
  transition: "background 0.15s ease, color 0.15s ease",
};
