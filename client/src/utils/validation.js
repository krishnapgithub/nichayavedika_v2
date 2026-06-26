export const isValidEmail = (email) => {
    const cleanEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(cleanEmail)) {
        return false;
    }

    // Common Gmail typos
    const blockedDomains = [
        "gmail.cm",
        "gmail.con",
        "gmail.cmo",
        "gmail.comm",
    ];

    const domain = cleanEmail.split("@")[1];

    return !blockedDomains.includes(domain);
};