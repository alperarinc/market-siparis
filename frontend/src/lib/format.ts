export function formatPrice(value: number): string {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

/**
 * Telefon numarasini +90 formatina sokar.
 * "5445583016" -> "05445583016"
 * "05445583016" -> "05445583016"
 * "+905445583016" -> "05445583016"
 * "905445583016" -> "05445583016"
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return digits;
  }
  if (digits.length === 10 && digits.startsWith('5')) {
    return '0' + digits;
  }
  return digits;
}
