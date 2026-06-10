const toKebabCase = (value?: string | null) =>
  (value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();

export const normalizeRoomStatus = (status?: string | null) => {
  const normalized = toKebabCase(status);

  if (normalized === 'outoforder') return 'out-of-order';
  if (normalized === 'outofservice') return 'out-of-service';

  return normalized;
};

export const normalizeBookingStatus = (status?: string | null) => toKebabCase(status);

export const normalizePaymentStatus = (status?: string | null) => toKebabCase(status);

export const getRoomAvailabilityState = (room: { status: string; nextAvailableDate?: string | null; nextAvailableAt?: string | null }) => {
  const normalizedStatus = normalizeRoomStatus(room.status);

  if (normalizedStatus === 'out-of-order' || normalizedStatus === 'out-of-service') {
    return 'unavailable';
  }

  if (room.nextAvailableAt || room.nextAvailableDate) {
    return 'available-soon';
  }

  return 'available';
};

export const formatStatusLabel = (value?: string | null) =>
  toKebabCase(value)
    .split('-')
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');

export const formatCurrency = (value: number, currency = localStorage.getItem('smart-hotel-currency') || 'MDL') =>
  new Intl.NumberFormat('ro-MD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
