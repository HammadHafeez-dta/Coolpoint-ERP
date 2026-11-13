/**
 * Formats a string to a CNIC pattern: XXXXX-XXXXXXX-X
 */
export function formatCNIC(val: string): string {
    const clean = val.replace(/\D/g, '').slice(0, 13);
    const parts = [];
    if (clean.length > 0) parts.push(clean.slice(0, 5));
    if (clean.length > 5) parts.push(clean.slice(5, 12));
    if (clean.length > 12) parts.push(clean.slice(12, 13));
    return parts.join('-');
}

/**
 * Formats a string to a phone number pattern: +92XXXXXXXXXX (10 digits after +92)
 */
export function formatPhoneNumber(val: string): string {
    let clean = val.replace(/[^\d+]/g, '');
    if (!clean) return '';

    // Handle leading 0 to replace it with +92
    if (clean.startsWith('0')) {
        clean = '+92' + clean.slice(1);
    } else if (clean.startsWith('92') && !clean.startsWith('+')) {
        clean = '+' + clean;
    } else if (!clean.startsWith('+92') && !clean.startsWith('+')) {
        clean = '+92' + clean;
    }

    if (clean.startsWith('+92')) {
        const digits = clean.slice(3).replace(/\D/g, '').slice(0, 10);
        return '+92' + digits;
    }
    return clean.slice(0, 13);
}
