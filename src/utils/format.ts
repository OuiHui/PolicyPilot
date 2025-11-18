export function formatPolicyType(
  type: "comprehensive" | "supplementary" | string
): string {
  if (!type) return "";
  if (type === "comprehensive") return "Comprehensive";
  if (type === "supplementary") return "Supplementary";
  // fallback: capitalize first letter
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default formatPolicyType;
