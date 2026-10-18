// Real places for the live Relay map (LiveMap): where each pick with a pin
// sits in New York, her home, and the neighborhood names drawn on the map.
// Keyed by Relay item id, so Relay data stays as it is.
export type LngLat = { lng: number; lat: number }

export const relaySpots: Record<string, LngLat> = {
  gym: { lat: 40.7337, lng: -73.9897 }, // Crunch, 14th St
  'gym-late': { lat: 40.7345, lng: -73.9884 }, // Maya's gym, same Crunch
  cafe: { lat: 40.7163, lng: -73.9646 }, // Devoción, Grand St
  'ana-cafe': { lat: 40.7172, lng: -73.9628 }, // Ana's café, same Devoción
  studio: { lat: 40.7247, lng: -74.0018 }, // Spring Studio, SoHo
  market: { lat: 40.7369, lng: -73.9903 }, // Union Square Greenmarket
  potatoes: { lat: 40.7318, lng: -73.9890 }, // Key Food, 3rd Ave
  library: { lat: 40.6726, lng: -73.9682 }, // Brooklyn Public Library
  laundry: { lat: 40.7302, lng: -73.9812 }, // Bubbles, E 13th St
  greenway: { lat: 40.7335, lng: -74.0105 }, // Hudson River Greenway
  falafel: { lat: 40.7303, lng: -74.0004 }, // Mamoun's, MacDougal St
  citibike: { lat: 40.7290, lng: -73.9845 }, // 1st Ave & E 10th St dock
  greenpoint: { lat: 40.7293, lng: -73.9540 }, // Greenpoint
  domino: { lat: 40.7145, lng: -73.9680 }, // Domino Park
  hmart: { lat: 40.7475, lng: -73.9868 }, // H Mart, 32nd St
  bridge: { lat: 40.7135, lng: -73.9735 }, // Williamsburg Bridge
  climbing: { lat: 40.7205, lng: -73.9560 }, // VITAL, Williamsburg
  blick: { lat: 40.7262, lng: -73.9935 }, // Blick, Bond St
  diner: { lat: 40.7290, lng: -73.9873 }, // Veselka, 2nd Ave
}

// Her place in the East Village
export const homeSpot: LngLat = { lat: 40.7262, lng: -73.9838 }

export const mapNeighborhoods: (LngLat & { name: string })[] = [
  { name: 'East Village', lat: 40.7275, lng: -73.9775 },
  { name: 'West Village', lat: 40.7345, lng: -74.0045 },
  { name: 'Lower East Side', lat: 40.7155, lng: -73.9865 },
  { name: 'Chelsea', lat: 40.7465, lng: -74.0010 },
  { name: 'Williamsburg', lat: 40.7110, lng: -73.9555 },
  { name: 'Greenpoint', lat: 40.7290, lng: -73.9530 },
  { name: 'Downtown Brooklyn', lat: 40.6935, lng: -73.9880 },
  { name: 'Park Slope', lat: 40.6700, lng: -73.9810 },
  { name: 'Long Island City', lat: 40.7445, lng: -73.9480 },
  { name: 'Jersey City', lat: 40.7190, lng: -74.0440 },
]
