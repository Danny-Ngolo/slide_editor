export const COLORS = {
  card: "#ffffff",
  text: "#1f2328",
  label: "#374151",
  fieldBg: "#f6f8fa",
  fieldBorder: "#d0d7de",
  inputBg: "#ffffff",
  border: "#e2e5ea",
  placeholder: "#6b7280",
};

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
  border: `1px solid ${COLORS.fieldBorder}`,
  borderRadius: "4px",
  background: COLORS.inputBg,
  color: COLORS.text,
  fontSize: "12px",
  cursor: "pointer",
};