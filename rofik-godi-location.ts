/**
 * Rofik Godi Centre — exact Google Maps location
 *
 * Use this destination in @navigatr/web route calls:
 * nav.route({ origin: userLocation, destination: rofikGodiCentre.location, mode: 'drive' })
 */

export const rofikGodiCentre = {
  name: 'Rofik Godi Centre',
  location: {
    lat: 24.0973125,
    lng: 88.2735625,
  },
  plusCode: '37WF+WC',
  address:
    'Kadbeltal, Petrol Pump More, Raninagar, Keshobnagar, Berhampore, West Bengal 742101, India',
  phone: '+91 94348 86786',
  phoneUrl: 'tel:+919434886786',
  googleMapsUrl: 'https://maps.app.goo.gl/nasrFpHJTByb4Yh49',
} as const

// Example:
// import { rofikGodiCentre } from './rofik-godi-location'
// const route = await nav.route({
//   origin: { lat: 24.1044927, lng: 88.2510635 },
//   destination: rofikGodiCentre.location,
//   mode: 'drive',
// })
