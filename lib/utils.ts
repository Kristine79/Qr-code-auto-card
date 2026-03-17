/**
 * Stateless data encoding/decoding for CarQR
 */

export interface CarCardData {
  carModel: string;
  plateNumber: string;
  ownerName: string;
  phone1: string;
  phone2?: string;
  email?: string;
  telegram?: string;
  whatsapp?: string;
  showText: boolean;
  text?: string;
  showContact: boolean;
  quickButtons: string[];
}

/**
 * Encodes car card data into a URL-safe base64 string
 */
export function encodeCardData(data: CarCardData): string {
  try {
    // Create a copy and remove empty strings to keep the QR code small
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => {
        if (v === '' || v === null || v === undefined) return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
      })
    );
    
    const json = JSON.stringify(cleanData);
    // Use a more robust way to handle UTF-8 for base64
    const bytes = new TextEncoder().encode(json);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    const base64 = btoa(binString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } catch (e) {
    console.error('Encoding error:', e);
    return '';
  }
}

/**
 * Decodes car card data from a URL-safe base64 string
 */
export function decodeCardData(encoded: string): CarCardData | null {
  try {
    // Restore base64 characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (e) {
    console.error('Decoding error:', e);
    return null;
  }
}
