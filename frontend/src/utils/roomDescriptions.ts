import type { TFunction } from 'i18next';
import type { Room } from '../context/HotelContext';

const hasAmenity = (room: Room, amenity: string) => room.amenities.includes(amenity);

const getViewKey = (room: Room) => {
  const description = room.description?.toLowerCase() || '';

  if (hasAmenity(room, 'Balcony') && room.floor >= 3) return 'panoramic';
  if (description.includes('city view')) return 'city';
  if (description.includes('courtyard')) return 'courtyard';
  if (room.floor >= 3) return 'topFloor';
  if (hasAmenity(room, 'Balcony')) return 'balcony';

  return 'quiet';
};

const getExtraFeatures = (room: Room, t: TFunction) => {
  const extras = [
    t('roomDescription.feature.hairDryer'),
    t('roomDescription.feature.mirror'),
    t(hasAmenity(room, 'Mini Bar') ? 'roomDescription.feature.miniFridge' : 'roomDescription.feature.refreshmentCorner'),
    t('roomDescription.feature.breakfast'),
  ];

  if (hasAmenity(room, 'Balcony')) extras.push(t('roomDescription.feature.privateBalcony'));
  if (hasAmenity(room, 'Jacuzzi')) extras.push(t('roomDescription.feature.jacuzzi'));

  return extras.join(', ');
};

export const getRoomDescriptionLines = (room: Room, t: TFunction) => {
  const view = t(`roomDescription.view.${getViewKey(room)}`);
  const extras = getExtraFeatures(room, t);
  const priceTone = room.pricePerNight >= 180 ? 'premium' : 'standard';

  return [
    room.description,
    t(`roomDescription.type.${room.type}`, { extras, guests: room.capacity }),
    t(`roomDescription.price.${priceTone}`, { view }),
  ].filter(Boolean);
};
