// LOCAL-FUNCTION: mask email -----------------------------
export const maskEmailSimple = (email) => {
    if (!email || typeof email !== "string") return "";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const firstTwo = local.slice(0, 2);
    return `${firstTwo}****@${domain}`;
};
