// Montclair Porchfest 2026 schedule data.
// Source: https://montclairporchfest.org — the live map page blocks scraping,
// so this file ships with a representative seed dataset modeled on the public
// info (May 16, 2026, ~220 acts on porches across town, 12–5 PM).
// Replace PORCHES / ACTS with the official feed when it's exposed as JSON.

const FESTIVAL = {
  name: "Montclair Porchfest",
  date: "2026-05-16",
  dateLabel: "Saturday, May 16, 2026",
  startMinutes: 12 * 60,   // 12:00 PM
  endMinutes:   17 * 60,   // 5:00 PM
  finale: {
    name: "Grammy Finale",
    venue: "Lackawanna Plaza",
    address: "1 Lackawanna Plaza, Montclair, NJ",
    startMinutes: 17 * 60,
    endMinutes: 22 * 60,
    lat: 40.8154,
    lng: -74.2099,
  },
  center: { lat: 40.8259, lng: -74.2090 }, // roughly Watchung Plaza
};

const PORCHES = [
  { id: "p01", address: "34 Walnut St",        area: "Walnut St",       lat: 40.83612, lng: -74.20492 },
  { id: "p02", address: "72 Walnut St",        area: "Walnut St",       lat: 40.83694, lng: -74.20683 },
  { id: "p03", address: "118 N Mountain Ave",  area: "Estate Section",  lat: 40.82834, lng: -74.21288 },
  { id: "p04", address: "9 Christopher St",    area: "Estate Section",  lat: 40.81781, lng: -74.21420 },
  { id: "p05", address: "44 Highland Ave",     area: "Upper Montclair", lat: 40.84452, lng: -74.20871 },
  { id: "p06", address: "21 Van Vleck St",     area: "Van Vleck",       lat: 40.82290, lng: -74.21135 },
  { id: "p07", address: "63 Lloyd Rd",         area: "Upper Montclair", lat: 40.84865, lng: -74.21024 },
  { id: "p08", address: "12 Park St",          area: "Downtown",        lat: 40.81930, lng: -74.21090 },
  { id: "p09", address: "55 Inwood Ave",       area: "Upper Montclair", lat: 40.84321, lng: -74.20055 },
  { id: "p10", address: "88 Cedar Ave",        area: "Downtown",        lat: 40.81654, lng: -74.20438 },
  { id: "p11", address: "16 Pine St",          area: "Pine St",         lat: 40.82120, lng: -74.20512 },
  { id: "p12", address: "245 Watchung Ave",    area: "Watchung Plaza",  lat: 40.84062, lng: -74.20755 },
  { id: "p13", address: "190 Watchung Ave",    area: "Watchung Plaza",  lat: 40.83830, lng: -74.20640 },
  { id: "p14", address: "27 Edgemont Rd",      area: "Edgemont",        lat: 40.82780, lng: -74.20015 },
  { id: "p15", address: "108 Forest St",       area: "Forest St",       lat: 40.82380, lng: -74.20720 },
  { id: "p16", address: "61 Glenridge Ave",    area: "Glenridge",       lat: 40.81512, lng: -74.20520 },
  { id: "p17", address: "14 Erwin Park Rd",    area: "Erwin Park",      lat: 40.83340, lng: -74.21370 },
  { id: "p18", address: "200 Lorraine Ave",    area: "Upper Montclair", lat: 40.84720, lng: -74.20460 },
  { id: "p19", address: "37 S Mountain Ave",   area: "Estate Section",  lat: 40.80910, lng: -74.21595 },
  { id: "p20", address: "82 Midland Ave",      area: "South End",       lat: 40.80284, lng: -74.21100 },
  { id: "p21", address: "19 Gordonhurst Ave",  area: "Upper Montclair", lat: 40.84955, lng: -74.20650 },
  { id: "p22", address: "44 Norman Rd",        area: "Estate Section",  lat: 40.81210, lng: -74.21810 },
  { id: "p23", address: "75 Claremont Ave",    area: "Downtown",        lat: 40.81995, lng: -74.20290 },
  { id: "p24", address: "16 Trinity Pl",       area: "Estate Section",  lat: 40.81120, lng: -74.21430 },
  { id: "p25", address: "133 Orange Rd",       area: "South End",       lat: 40.80450, lng: -74.20770 },
  { id: "p26", address: "9 Macopin Rd",        area: "Upper Montclair", lat: 40.85020, lng: -74.21490 },
  { id: "p27", address: "52 Buckingham Rd",    area: "Estate Section",  lat: 40.82085, lng: -74.21955 },
  { id: "p28", address: "211 Grove St",        area: "Downtown",        lat: 40.82150, lng: -74.19960 },
  { id: "p29", address: "30 Fernwood Ave",     area: "Upper Montclair", lat: 40.85130, lng: -74.20120 },
  { id: "p30", address: "97 Park St",          area: "Downtown",        lat: 40.82610, lng: -74.20880 },
];

// Helper: time(h, m) → minutes
const T = (h, m = 0) => h * 60 + m;

const ACTS = [
  // 12:00 slot
  { id: "a001", artist: "The Cedar Hollows",      genre: "Indie Folk",     porchId: "p01", start: T(12),     end: T(12,45) },
  { id: "a002", artist: "Brass Knuckle Brunch",   genre: "Brass / Jazz",   porchId: "p06", start: T(12),     end: T(12,45) },
  { id: "a003", artist: "Lila & the Loom",        genre: "Singer-Songwriter", porchId: "p11", start: T(12),  end: T(12,45) },
  { id: "a004", artist: "Saturday Static",        genre: "Garage Rock",    porchId: "p17", start: T(12),     end: T(12,45) },
  { id: "a005", artist: "Porch Light Choir",      genre: "Gospel / Soul",  porchId: "p12", start: T(12),     end: T(12,45) },
  { id: "a006", artist: "Watchung Bluegrass Co.", genre: "Bluegrass",      porchId: "p05", start: T(12),     end: T(12,45) },
  { id: "a007", artist: "Nine-Volt Wildflower",   genre: "Dream Pop",      porchId: "p03", start: T(12),     end: T(12,45) },
  { id: "a008", artist: "Café Mañana",            genre: "Latin Jazz",     porchId: "p23", start: T(12),     end: T(12,45) },
  { id: "a009", artist: "The Lackawanna Three",   genre: "Roots / Americana", porchId: "p28", start: T(12),  end: T(12,45) },
  { id: "a010", artist: "Glenridge Glow",         genre: "Synth-pop",      porchId: "p16", start: T(12),     end: T(12,45) },
  { id: "a011", artist: "Iron Forest",            genre: "Indie Rock",     porchId: "p15", start: T(12),     end: T(12,45) },
  { id: "a012", artist: "Honey Index",            genre: "R&B",            porchId: "p20", start: T(12),     end: T(12,45) },
  { id: "a013", artist: "Estate Sale Strings",    genre: "Classical",      porchId: "p22", start: T(12),     end: T(12,45) },
  { id: "a014", artist: "Pine Cone Disco",        genre: "Funk",           porchId: "p25", start: T(12),     end: T(12,45) },
  { id: "a015", artist: "Tin Roof Quartet",       genre: "Jazz",           porchId: "p18", start: T(12),     end: T(12,45) },

  // 1:00 slot
  { id: "a016", artist: "Cardamom Sky",           genre: "Indie Pop",      porchId: "p01", start: T(13),     end: T(13,45) },
  { id: "a017", artist: "Bloomfield Boys Choir",  genre: "Choral",         porchId: "p08", start: T(13),     end: T(13,45) },
  { id: "a018", artist: "Mountainstone",          genre: "Folk Rock",      porchId: "p19", start: T(13),     end: T(13,45) },
  { id: "a019", artist: "Lorraine & the Avenue",  genre: "Soul",           porchId: "p18", start: T(13),     end: T(13,45) },
  { id: "a020", artist: "Velvet Caboose",         genre: "Psych Rock",     porchId: "p13", start: T(13),     end: T(13,45) },
  { id: "a021", artist: "Highland Heatwave",      genre: "Reggae",         porchId: "p05", start: T(13),     end: T(13,45) },
  { id: "a022", artist: "Paper Antlers",          genre: "Indie Folk",     porchId: "p07", start: T(13),     end: T(13,45) },
  { id: "a023", artist: "The Watchung Watchmen",  genre: "Blues",          porchId: "p12", start: T(13),     end: T(13,45) },
  { id: "a024", artist: "Estate of Mind",         genre: "Hip Hop / Live", porchId: "p04", start: T(13),     end: T(13,45) },
  { id: "a025", artist: "Cousin Audrey",          genre: "Country",        porchId: "p11", start: T(13),     end: T(13,45) },
  { id: "a026", artist: "Steel City Steel Band",  genre: "Steel Drums",    porchId: "p10", start: T(13),     end: T(13,45) },
  { id: "a027", artist: "Sundial Hymns",          genre: "Ambient",        porchId: "p06", start: T(13),     end: T(13,45) },
  { id: "a028", artist: "Park Street Funk",       genre: "Funk",           porchId: "p30", start: T(13),     end: T(13,45) },
  { id: "a029", artist: "Northwood Brass",        genre: "Brass",          porchId: "p29", start: T(13),     end: T(13,45) },
  { id: "a030", artist: "Aurora & the North",     genre: "Indie",          porchId: "p21", start: T(13),     end: T(13,45) },

  // 2:00 slot
  { id: "a031", artist: "Walnut Street Stomp",    genre: "Bluegrass",      porchId: "p02", start: T(14),     end: T(14,45) },
  { id: "a032", artist: "Mango Lassi Jazz Trio",  genre: "Jazz Fusion",    porchId: "p09", start: T(14),     end: T(14,45) },
  { id: "a033", artist: "Pinegrove Type Beat",    genre: "Indie Rock",     porchId: "p14", start: T(14),     end: T(14,45) },
  { id: "a034", artist: "The Greater Goods",      genre: "Power Pop",      porchId: "p15", start: T(14),     end: T(14,45) },
  { id: "a035", artist: "Marigold Reverb",        genre: "Shoegaze",       porchId: "p27", start: T(14),     end: T(14,45) },
  { id: "a036", artist: "South End Sound System", genre: "Dub",            porchId: "p20", start: T(14),     end: T(14,45) },
  { id: "a037", artist: "Penny Loafer",           genre: "Doo-Wop",        porchId: "p23", start: T(14),     end: T(14,45) },
  { id: "a038", artist: "Hex & the Vibe",         genre: "Alt Rock",       porchId: "p17", start: T(14),     end: T(14,45) },
  { id: "a039", artist: "Watercress",             genre: "Folk",           porchId: "p26", start: T(14),     end: T(14,45) },
  { id: "a040", artist: "Lo-Fi Lobby",            genre: "Lo-Fi",          porchId: "p08", start: T(14),     end: T(14,45) },
  { id: "a041", artist: "The Gordonhurst Five",   genre: "Jazz Standards", porchId: "p21", start: T(14),     end: T(14,45) },
  { id: "a042", artist: "Olive & Ash",            genre: "Acoustic Duo",   porchId: "p03", start: T(14),     end: T(14,45) },
  { id: "a043", artist: "Lemonshade",             genre: "Indie Pop",      porchId: "p13", start: T(14),     end: T(14,45) },
  { id: "a044", artist: "Trinity Place Trio",     genre: "Classical",      porchId: "p24", start: T(14),     end: T(14,45) },
  { id: "a045", artist: "Macopin Hill Mountain Band", genre: "Country Rock", porchId: "p26", start: T(14),   end: T(14,45) },

  // 3:00 slot
  { id: "a046", artist: "Buckingham Buckers",     genre: "Punk",           porchId: "p27", start: T(15),     end: T(15,45) },
  { id: "a047", artist: "Tigerlily Theory",       genre: "Math Rock",      porchId: "p11", start: T(15),     end: T(15,45) },
  { id: "a048", artist: "The Beech Street Band",  genre: "Roots Rock",     porchId: "p01", start: T(15),     end: T(15,45) },
  { id: "a049", artist: "Norman Road Ramblers",   genre: "Americana",      porchId: "p22", start: T(15),     end: T(15,45) },
  { id: "a050", artist: "Glassine",               genre: "Dream Pop",      porchId: "p06", start: T(15),     end: T(15,45) },
  { id: "a051", artist: "Quiet Tigers",           genre: "Indie Folk",     porchId: "p04", start: T(15),     end: T(15,45) },
  { id: "a052", artist: "Inwood Avenue All-Stars",genre: "Funk / Soul",    porchId: "p09", start: T(15),     end: T(15,45) },
  { id: "a053", artist: "Grove Street Groove",    genre: "Disco / Boogie", porchId: "p28", start: T(15),     end: T(15,45) },
  { id: "a054", artist: "Backyard Brass Co.",     genre: "New Orleans Brass", porchId: "p12", start: T(15),  end: T(15,45) },
  { id: "a055", artist: "Coldspring Hymnal",      genre: "Indie Folk",     porchId: "p07", start: T(15),     end: T(15,45) },
  { id: "a056", artist: "The Midland Marauders",  genre: "Garage",         porchId: "p20", start: T(15),     end: T(15,45) },
  { id: "a057", artist: "Soft Static",            genre: "Synthwave",      porchId: "p16", start: T(15),     end: T(15,45) },
  { id: "a058", artist: "Velour Letters",         genre: "Soul",           porchId: "p18", start: T(15),     end: T(15,45) },
  { id: "a059", artist: "Erwin Park Ensemble",    genre: "Chamber",        porchId: "p17", start: T(15),     end: T(15,45) },
  { id: "a060", artist: "Cedar Smoke",            genre: "Jam Band",       porchId: "p10", start: T(15),     end: T(15,45) },

  // 4:00 slot
  { id: "a061", artist: "Fernwood Field Recordings", genre: "Experimental", porchId: "p29", start: T(16),    end: T(16,45) },
  { id: "a062", artist: "Edge of Edgemont",       genre: "Alt Folk",       porchId: "p14", start: T(16),     end: T(16,45) },
  { id: "a063", artist: "Postcard Audio",         genre: "Indie Pop",      porchId: "p15", start: T(16),     end: T(16,45) },
  { id: "a064", artist: "Watchung Avenue Sessions", genre: "Live Jazz",    porchId: "p13", start: T(16),     end: T(16,45) },
  { id: "a065", artist: "Clementine Falls",       genre: "Folk Rock",      porchId: "p03", start: T(16),     end: T(16,45) },
  { id: "a066", artist: "The Forest Street Folk", genre: "Folk Trio",      porchId: "p15", start: T(16),     end: T(16,45) },
  { id: "a067", artist: "Hot Sauce Standards",    genre: "Funk / Jazz",    porchId: "p23", start: T(16),     end: T(16,45) },
  { id: "a068", artist: "Pinewood Coda",          genre: "Post-Rock",      porchId: "p25", start: T(16),     end: T(16,45) },
  { id: "a069", artist: "Lloyd Road Lullaby",     genre: "Singer-Songwriter", porchId: "p07", start: T(16),  end: T(16,45) },
  { id: "a070", artist: "Big Yellow House",       genre: "Indie Rock",     porchId: "p02", start: T(16),     end: T(16,45) },
  { id: "a071", artist: "Anderson Park Players",  genre: "Brass / Jazz",   porchId: "p18", start: T(16),     end: T(16,45) },
  { id: "a072", artist: "Saltwater Taffy",        genre: "Surf Rock",      porchId: "p19", start: T(16),     end: T(16,45) },
  { id: "a073", artist: "Spruce + Sparrow",       genre: "Acoustic Duo",   porchId: "p24", start: T(16),     end: T(16,45) },
  { id: "a074", artist: "Hometown Heretics",      genre: "Alt Country",    porchId: "p30", start: T(16),     end: T(16,45) },
  { id: "a075", artist: "The Last Encore",        genre: "Rock",           porchId: "p08", start: T(16),     end: T(16,45) },
];

// Build helper indices
const PORCH_BY_ID = Object.fromEntries(PORCHES.map(p => [p.id, p]));

const SCHEDULE = ACTS.map(a => ({
  ...a,
  porch: PORCH_BY_ID[a.porchId],
})).sort((a, b) => a.start - b.start || a.artist.localeCompare(b.artist));

// Expose as a module-ish global for the no-build app
window.PorchfestData = { FESTIVAL, PORCHES, ACTS, PORCH_BY_ID, SCHEDULE };
