/**
 * Stateless data encoding/decoding for CarQR
 */

import pako from 'pako';

export interface CarCardData {
  carModel: string;
  plateNumber: string;
  ownerName: string;
  phone1: string;
  phone2?: string;
  email?: string;
  telegram?: string;
  whatsapp?: string;
  max?: string;
  showContact: boolean;
  quickButtons: string[];
  themeColor?: string;
  backgroundColor?: string;
  textColor?: string;
  qrText?: string;
}

const KEY_MAP: Record<string, string> = {
  carModel: 'cm',
  plateNumber: 'pn',
  ownerName: 'on',
  phone1: 'p1',
  phone2: 'p2',
  email: 'em',
  telegram: 'tg',
  whatsapp: 'wa',
  max: 'mx',
  showContact: 'sc',
  quickButtons: 'qb',
  themeColor: 'tc',
  backgroundColor: 'bc',
  textColor: 'lc',
  qrText: 'qt'
};

const REVERSE_KEY_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

/**
 * Encodes car card data into a compressed URL-safe base64 string
 */
export function encodeCardData(data: CarCardData): string {
  try {
    // Shorten keys and remove empty values
    const shortened: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === '' || value === null || value === undefined) continue;
      if (Array.isArray(value) && value.length === 0) continue;
      const shortKey = KEY_MAP[key] || key;
      shortened[shortKey] = value;
    }
    
    const json = JSON.stringify(shortened);
    // Compress with pako
    const compressed = pako.deflate(json);
    // Convert to base64
    const binString = Array.from(compressed, (byte) => String.fromCharCode(byte)).join("");
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
 * Decodes car card data from a compressed URL-safe base64 string
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
    
    let json: string;
    try {
      // Try to decompress
      const decompressed = pako.inflate(bytes);
      json = new TextDecoder().decode(decompressed);
    } catch (e) {
      // Fallback for old uncompressed data
      json = new TextDecoder().decode(bytes);
    }

    const parsed = JSON.parse(json);
    
    // Expand keys
    const expanded: any = {
      quickButtons: [] // Default to empty array
    };
    for (const [key, value] of Object.entries(parsed)) {
      const longKey = REVERSE_KEY_MAP[key] || key;
      expanded[longKey] = value;
    }

    return expanded as CarCardData;
  } catch (e) {
    console.error('Decoding error:', e);
    return null;
  }
}
