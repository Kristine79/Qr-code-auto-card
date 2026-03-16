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
    const json = JSON.stringify(data);
    // Use btoa for base64 encoding, making it URL safe by replacing + and /
    const base64 = btoa(unescape(encodeURIComponent(json)))
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
    const json = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(json);
  } catch (e) {
    console.error('Decoding error:', e);
    return null;
  }
}
