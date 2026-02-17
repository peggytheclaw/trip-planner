// Event coordinate lookup — keyed by event ID
// Populated for the Tokyo demo trip; user-created events won't have coords
// unless we add a geocoding step in the future.

export const EVENT_COORDS: Record<string, [number, number]> = {
  // ── Tokyo demo ───────────────────────────────────────────────────────────
  'evt-flight-out':       [37.6213, -122.3790],   // SFO
  'evt-narita-express':   [35.7720,  140.3929],   // NRT
  'evt-hotel-checkin':    [35.6892,  139.6917],   // Park Hyatt Tokyo, Shinjuku
  'evt-hotel-checkout':   [35.6892,  139.6917],
  'evt-ichiran':          [35.6938,  139.7034],   // Ichiran Kabukicho
  'evt-tsukiji':          [35.6654,  139.7707],   // Tsukiji Outer Market
  'evt-sensoji':          [35.7147,  139.7967],   // Senso-ji
  'evt-subway-asakusa':   [35.7109,  139.7965],   // Asakusa Station
  'evt-shibuya':          [35.6595,  139.7004],   // Shibuya Crossing
  'evt-teamlab':          [35.6462,  139.7956],   // teamLab Planets, Toyosu
  'evt-sushi-dinner':     [35.6712,  139.7633],   // Ginza / Sukiyabashi Jiro
  'evt-harajuku':         [35.6703,  139.6958],   // Harajuku/Meiji Shrine
  'evt-akihabara':        [35.7022,  139.7741],   // Akihabara
  'evt-ramen-school':     [35.6812,  139.7671],   // Tokyo Station
  'evt-skytree':          [35.7101,  139.8107],   // Tokyo Skytree
  'evt-farewell-dinner':  [35.6596,  139.7288],   // Gonpachi, Nishi-Azabu
  'evt-flight-home':      [35.7720,  140.3929],   // NRT
  'evt-note-pack':        [37.6213, -122.3790],   // SFO area

  // ── NYC template ─────────────────────────────────────────────────────────
  'nyc-flight-in':        [40.6413, -73.7781],    // JFK
  'nyc-hotel-in':         [40.7401, -74.0066],    // Standard High Line
  'nyc-dinner-1':         [40.7305, -74.0026],    // Joe's Pizza, Greenwich Village
  'nyc-walk-highline':    [40.7480, -74.0048],    // High Line
  'nyc-central-park':     [40.7851, -73.9683],    // Central Park
  'nyc-moma':             [40.7615, -73.9777],    // MoMA
  'nyc-lunch':            [40.7224, -73.9875],    // Katz's
  'nyc-brooklyn':         [40.7061, -73.9969],    // Brooklyn Bridge
  'nyc-broadway':         [40.7590, -73.9845],    // Times Square theater
  'nyc-brunch':           [40.7215, -73.9868],    // Clinton St
  'nyc-checkout':         [40.7401, -74.0066],
  'nyc-flight-out':       [40.6413, -73.7781],

  // ── Euro template ─────────────────────────────────────────────────────────
  'euro-flight-in':       [48.8600,   2.3522],    // CDG / Paris
  'euro-paris-hostel':    [48.8710,   2.3696],    // Generator Paris
  'euro-eiffel':          [48.8584,   2.2945],    // Eiffel Tower
  'euro-louvre':          [48.8606,   2.3376],    // Louvre
  'euro-cafe':            [48.8540,   2.3332],    // Café de Flore
  'euro-thalys':          [48.8809,   2.3553],    // Gare du Nord
  'euro-ams-hostel':      [52.3600,   4.8800],    // Stayokay Amsterdam
  'euro-rijks':           [52.3600,   4.8852],    // Rijksmuseum
  'euro-canal-bike':      [52.3738,   4.8910],    // Amsterdam Centraal
  'euro-flixbus':         [52.3886,   4.8380],    // Sloterdijk
  'euro-berlin-hostel':   [52.4990,  13.3850],    // Meininger Berlin
  'euro-east-side':       [52.5051,  13.4398],    // East Side Gallery
  'euro-currywurst':      [52.4894,  13.3887],    // Curry 36
  'euro-flight-out':      [52.3667,  13.5033],    // BER

  // ── Bali template ─────────────────────────────────────────────────────────
  'bali-flight':          [37.6213, -122.3790],   // SFO
  'bali-ubud-villa':      [-8.5094,  115.2590],   // Ubud
  'bali-tegalalang':      [-8.4372,  115.2783],   // Tegalalang
  'bali-tanah-lot':       [-8.6215,  115.0862],   // Tanah Lot
  'bali-cooking-class':   [-8.5069,  115.2624],   // Ubud Market
  'bali-dinner':          [-8.5060,  115.2636],   // Locavore, Ubud
  'bali-mount-batur':     [-8.2421,  115.3751],   // Mount Batur
  'bali-flight-home':     [-8.7482,  115.1672],   // DPS
};

// Destination center coordinates for map backgrounds
export const DESTINATION_COORDS: Record<string, { center: [number, number]; zoom: number; name: string }> = {
  'Tokyo, Japan':         { center: [35.6762, 139.6503], zoom: 12, name: 'Tokyo' },
  'New York City, USA':   { center: [40.7128, -74.0060], zoom: 12, name: 'NYC' },
  'Paris → Amsterdam → Berlin': { center: [52.3200, 4.8952], zoom: 5, name: 'Europe' },
  'Bali, Indonesia':      { center: [-8.4095, 115.1889], zoom: 10, name: 'Bali' },
  'default':              { center: [35.6762, 139.6503], zoom: 10, name: '' },
};

export function getDestinationCoords(destination: string) {
  return DESTINATION_COORDS[destination] ?? DESTINATION_COORDS['default'];
}
