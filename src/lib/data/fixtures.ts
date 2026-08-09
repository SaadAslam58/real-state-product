import type {
  ActivityItem,
  Agency,
  Agent,
  Correction,
  Lead,
  Listing,
  Turn,
} from "../types";

/**
 * Sample data. Lives BEHIND the `lib/data` boundary — UI code must never import
 * this file directly. ESLint enforces it (see eslint.config.mjs); if you find
 * yourself wanting to, add a function to `lib/data/*` instead.
 *
 * The data is deliberately realistic rather than lorem-ipsum: real Dubai
 * communities, plausible AED prices, WhatsApp conversations that sound like
 * actual property inquiries, and one thread in Arabic. Fake-looking sample data
 * makes a real product look like a prototype.
 *
 * Timestamps are generated relative to load time so the dashboard is never
 * showing "3 days ago" on every row.
 */

const now = Date.now();
const min = 60_000;
const hr = 60 * min;
const day = 24 * hr;

/** ISO string N minutes ago. */
const ago = (minutes: number) => new Date(now - minutes * min).toISOString();

// ─────────────────────────────────────────────────────────────
// Team
// ─────────────────────────────────────────────────────────────

export const AGENTS: Agent[] = [
  {
    id: "ag_owner",
    name: "Omar Al Nuaimi",
    role: "owner",
    email: "omar@meridianproperties.ae",
    phone: "+971501120044",
    avatarUrl: null,
    active: true,
    joinedAt: new Date(now - 620 * day).toISOString(),
  },
  {
    id: "ag_sara",
    name: "Sara Haddad",
    role: "agent",
    email: "sara@meridianproperties.ae",
    phone: "+971552208871",
    avatarUrl: null,
    active: true,
    joinedAt: new Date(now - 410 * day).toISOString(),
  },
  {
    id: "ag_rajesh",
    name: "Rajesh Menon",
    role: "agent",
    email: "rajesh@meridianproperties.ae",
    phone: "+971563301192",
    avatarUrl: null,
    active: true,
    joinedAt: new Date(now - 285 * day).toISOString(),
  },
  {
    id: "ag_lena",
    name: "Lena Kovač",
    role: "agent",
    email: "lena@meridianproperties.ae",
    phone: "+971544419903",
    avatarUrl: null,
    active: true,
    joinedAt: new Date(now - 96 * day).toISOString(),
  },
  {
    id: "ag_yusuf",
    name: "Yusuf Karim",
    role: "agent",
    email: "yusuf@meridianproperties.ae",
    phone: "+971509987412",
    avatarUrl: null,
    active: false,
    joinedAt: new Date(now - 500 * day).toISOString(),
  },
];

export const CURRENT_OWNER_ID = "ag_owner";
export const CURRENT_AGENT_ID = "ag_sara";

// ─────────────────────────────────────────────────────────────
// Listings
// ─────────────────────────────────────────────────────────────

/**
 * Fixture photography is vendored under `public/fixtures/listings/` rather than
 * hot-linked from a CDN. Two reasons, both learned the hard way in review:
 * remote images need `images.remotePatterns` allow-listing and fail at request
 * time rather than build time, and a demo that needs the internet to show
 * property photos is a demo that breaks in the one meeting that matters.
 *
 * Sources are Unsplash, used under the Unsplash License. Replace with the
 * agency's own photography before anything client-facing.
 */
const photo = (id: string) => `/fixtures/listings/${id.split("-")[0]}.jpg`;

export const LISTINGS: Listing[] = [
  {
    id: "li_001",
    reference: "MP-MAR-1184",
    title: "2-bed with full marina view, Sparkle Tower 2",
    area: "Dubai Marina",
    address: "Sparkle Tower 2, Marina Walk, Dubai Marina",
    priceAED: 2_450_000,
    pricePeriod: "sale",
    beds: 2,
    baths: 3,
    sizeSqft: 1_310,
    source: "synced",
    sourcePortal: "bayut",
    status: "available",
    photos: [
      photo("1545324418-cc1a3fa10c00"),
      photo("1502672260266-1c1ef2d93688"),
    ],
    description:
      "High-floor two bedroom with unobstructed marina views, upgraded kitchen, and two parking bays. Vacant on transfer.",
    updatedAt: ago(180),
  },
  {
    id: "li_002",
    reference: "MP-MAR-1190",
    title: "Marina studio, high floor",
    area: "Dubai Marina",
    address: "Marina Diamond 4, Dubai Marina",
    priceAED: 62_000,
    pricePeriod: "yearly",
    beds: 0,
    baths: 1,
    sizeSqft: 430,
    source: "synced",
    sourcePortal: "propertyfinder",
    status: "available",
    photos: [photo("1502672260266-1c1ef2d93688")],
    description:
      "Furnished studio on a high floor, chiller free, 4 cheques accepted.",
    updatedAt: ago(180),
  },
  {
    id: "li_003",
    reference: "MP-JVC-0442",
    title: "3-bed townhouse, corner plot",
    area: "Jumeirah Village Circle",
    address: "District 12, JVC",
    priceAED: 2_150_000,
    pricePeriod: "sale",
    beds: 3,
    baths: 4,
    sizeSqft: 2_100,
    source: "synced",
    sourcePortal: "bayut",
    status: "reserved",
    photos: [photo("1568605114967-8130f3a36994")],
    description:
      "Corner townhouse with a private garden, maid's room, and covered parking for two.",
    updatedAt: ago(180),
  },
  {
    id: "li_004",
    reference: "MP-DTN-2201",
    title: "1-bed in Burj Vista, Burj Khalifa view",
    area: "Downtown Dubai",
    address: "Burj Vista Tower 1, Downtown Dubai",
    priceAED: 2_890_000,
    pricePeriod: "sale",
    beds: 1,
    baths: 2,
    sizeSqft: 940,
    source: "synced",
    sourcePortal: "propertyfinder",
    status: "available",
    photos: [
      photo("1512917774080-9991f1c4c750"),
      photo("1600607687939-ce8a6c25118c"),
    ],
    description:
      "Direct Burj Khalifa and fountain view, fully furnished by the developer.",
    updatedAt: ago(180),
  },
  {
    id: "li_005",
    reference: "MP-PLM-0088",
    title: "Garden-home villa on the Palm",
    area: "Palm Jumeirah",
    address: "Frond K, Palm Jumeirah",
    priceAED: 21_500_000,
    pricePeriod: "sale",
    beds: 5,
    baths: 6,
    sizeSqft: 6_400,
    source: "manual",
    sourcePortal: null,
    status: "available",
    photos: [
      photo("1613977257363-707ba9348227"),
      photo("1600596542815-ffad4c1539a9"),
    ],
    description:
      "Off-market garden home with private beach access, upgraded throughout. Owner will consider a short handover.",
    updatedAt: ago(2_880),
  },
  {
    id: "li_006",
    reference: "MP-BUS-1502",
    title: "2-bed in Executive Towers",
    area: "Business Bay",
    address: "Executive Towers, Tower G, Business Bay",
    priceAED: 135_000,
    pricePeriod: "yearly",
    beds: 2,
    baths: 3,
    sizeSqft: 1_450,
    source: "synced",
    sourcePortal: "bayut",
    status: "available",
    photos: [photo("1560448204-e02f11c3d0e2")],
    description: "Canal-facing two bedroom, chiller free, 12 cheques.",
    updatedAt: ago(180),
  },
  {
    id: "li_007",
    reference: "MP-JBR-0710",
    title: "Beachfront 3-bed, Sadaf",
    area: "Jumeirah Beach Residence",
    address: "Sadaf 6, JBR",
    priceAED: 240_000,
    pricePeriod: "yearly",
    beds: 3,
    baths: 4,
    sizeSqft: 2_050,
    source: "synced",
    sourcePortal: "propertyfinder",
    status: "let",
    photos: [photo("1502005229762-cf1b2da7c5d6")],
    description: "Full sea view, direct beach access, upgraded kitchen.",
    updatedAt: ago(180),
  },
  {
    id: "li_008",
    reference: "MP-ARJ-0311",
    title: "Studio in Arjan, ready to move",
    area: "Arjan",
    address: "Miraclz Tower, Arjan",
    priceAED: 44_000,
    pricePeriod: "yearly",
    beds: 0,
    baths: 1,
    sizeSqft: 395,
    source: "manual",
    sourcePortal: null,
    status: "available",
    photos: [photo("1522708323590-d24dbb6b0267")],
    description: "Unfurnished studio, 6 cheques, near Miracle Garden.",
    updatedAt: ago(5_760),
  },
  {
    id: "li_009",
    reference: "MP-MAR-1201",
    title: "1-bed, Marina Gate 2",
    area: "Dubai Marina",
    address: "Marina Gate 2, Dubai Marina",
    priceAED: 1_780_000,
    pricePeriod: "sale",
    beds: 1,
    baths: 2,
    sizeSqft: 830,
    source: "synced",
    sourcePortal: "bayut",
    status: "available",
    photos: [photo("1493809842364-78817add7ffb")],
    description: "Bright one bedroom, partial marina view, tenanted until Q3.",
    updatedAt: ago(180),
  },
  {
    id: "li_010",
    reference: "MP-DHE-0955",
    title: "4-bed villa, Dubai Hills Estate",
    area: "Dubai Hills Estate",
    address: "Sidra 2, Dubai Hills Estate",
    priceAED: 8_900_000,
    pricePeriod: "sale",
    beds: 4,
    baths: 5,
    sizeSqft: 4_100,
    source: "synced",
    sourcePortal: "propertyfinder",
    status: "available",
    photos: [photo("1600585154340-be6161a56a0c")],
    description: "Backing onto the park, single row, landscaped garden and pool.",
    updatedAt: ago(180),
  },
  {
    id: "li_011",
    reference: "MP-CRK-0126",
    title: "2-bed, Dubai Creek Harbour",
    area: "Dubai Creek Harbour",
    address: "Creek Rise Tower 1, Dubai Creek Harbour",
    priceAED: 2_320_000,
    pricePeriod: "sale",
    beds: 2,
    baths: 3,
    sizeSqft: 1_180,
    source: "synced",
    sourcePortal: "bayut",
    status: "available",
    photos: [photo("1600566753086-00f18fb6b3ea")],
    description: "Skyline and creek view, handover complete, vacant.",
    updatedAt: ago(180),
  },
  {
    id: "li_012",
    reference: "MP-MAR-1155",
    title: "Marina studio, Bay Central",
    area: "Dubai Marina",
    address: "Bay Central West, Dubai Marina",
    priceAED: 58_000,
    pricePeriod: "yearly",
    beds: 0,
    baths: 1,
    sizeSqft: 410,
    source: "manual",
    sourcePortal: null,
    status: "available",
    photos: [photo("1554995207-c18c203602cb")],
    description: "Small studio, unfurnished, available immediately, 2 cheques.",
    updatedAt: ago(11_520),
  },
];

// ─────────────────────────────────────────────────────────────
// Conversations
// ─────────────────────────────────────────────────────────────

const threads: Record<string, Turn[]> = {
  // Overdue handoff — the hero case for the dashboard's urgency language.
  ld_001: [
    {
      id: "t1",
      kind: "customer",
      at: ago(214),
      text: "Hi, saw the 2 bed in Sparkle Tower on Bayut. Still available?",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(213),
      text: "Hello! Yes, MP-MAR-1184 is still available — 2 bed, 3 bath, 1,310 sqft with a full marina view, at AED 2,450,000. Would you like to see photos?",
    },
    { id: "t3", kind: "customer", at: ago(211), text: "Yes please" },
    {
      id: "t4",
      kind: "image",
      at: ago(211),
      author: "ai",
      imageUrl: photo("1545324418-cc1a3fa10c00"),
      caption: "Living area, high floor — full marina view",
      listingId: "li_001",
      agentId: null,
    },
    {
      id: "t5",
      kind: "image",
      at: ago(211),
      author: "ai",
      imageUrl: photo("1502672260266-1c1ef2d93688"),
      caption: "Master bedroom",
      listingId: "li_001",
      agentId: null,
    },
    {
      id: "t6",
      kind: "customer",
      at: ago(205),
      text: "Nice. My budget is around 2.2 to 2.4. Is there movement on the price?",
    },
    {
      id: "t7",
      kind: "ai",
      at: ago(204),
      text: "That's close. Price discussions go through one of our agents — can I have someone call you today? Are you buying to live in or as an investment?",
    },
    {
      id: "t8",
      kind: "customer",
      at: ago(200),
      text: "To live in. We want to move before September. Yes please have someone call me.",
    },
    {
      id: "t9",
      kind: "handoff",
      at: ago(199),
      toAgentId: "ag_sara",
      reason: "Customer asked to negotiate price and requested a callback",
    },
  ],

  // Fresh handoff, minutes old — should read differently from the one above.
  ld_002: [
    {
      id: "t1",
      kind: "customer",
      at: ago(52),
      text: "Good evening, I'm looking for a 1 bedroom in Downtown with a Burj view. Budget up to 3M.",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(51),
      text: "Good evening! We have MP-DTN-2201 in Burj Vista — 1 bed, 940 sqft, direct Burj Khalifa and fountain view, AED 2,890,000, furnished by the developer.",
    },
    {
      id: "t3",
      kind: "image",
      at: ago(51),
      author: "ai",
      imageUrl: photo("1512917774080-9991f1c4c750"),
      caption: "MP-DTN-2201 — Burj Vista, direct fountain view",
      listingId: "li_004",
      agentId: null,
    },
    {
      id: "t4",
      kind: "customer",
      at: ago(20),
      text: "That looks right. Can I view it this weekend?",
    },
    {
      id: "t5",
      kind: "ai",
      at: ago(19),
      text: "Absolutely. I'll have an agent confirm a time with you shortly.",
    },
    {
      id: "t6",
      kind: "handoff",
      at: ago(18),
      toAgentId: "ag_rajesh",
      reason: "Viewing requested for this weekend",
    },
  ],

  // Arabic thread — dir="auto" has to carry this or it renders backwards.
  ld_003: [
    {
      id: "t1",
      kind: "customer",
      at: ago(1_450),
      text: "السلام عليكم، عندكم استوديو للإيجار في مارينا؟",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(1_449),
      text: "وعليكم السلام! نعم، عندنا استوديو في مارينا دايموند ٤ بسعر ٦٢٬٠٠٠ درهم سنوياً، مفروش وبدون رسوم تبريد.",
    },
    {
      id: "t3",
      kind: "image",
      at: ago(1_449),
      author: "ai",
      imageUrl: photo("1502672260266-1c1ef2d93688"),
      caption: "MP-MAR-1190 — استوديو مفروش، طابق عالي",
      listingId: "li_002",
      agentId: null,
    },
    {
      id: "t4",
      kind: "customer",
      at: ago(1_400),
      text: "ممكن أربع شيكات؟",
    },
    {
      id: "t5",
      kind: "ai",
      at: ago(1_399),
      text: "نعم، أربع شيكات مقبولة. متى تحب تشوف الاستوديو؟",
    },
  ],

  // Agent took over, then handed back to the AI — exercises both rail switches.
  ld_004: [
    {
      id: "t1",
      kind: "customer",
      at: ago(4_300),
      text: "Looking for a family villa, 4 bed, Dubai Hills or Arabian Ranches. Cash buyer.",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(4_299),
      text: "We have MP-DHE-0955 in Sidra 2, Dubai Hills — 4 bed, 4,100 sqft, backing onto the park, AED 8,900,000.",
    },
    {
      id: "t3",
      kind: "customer",
      at: ago(4_200),
      text: "What's the service charge and is it single row?",
    },
    {
      id: "t4",
      kind: "handoff",
      at: ago(4_190),
      toAgentId: "ag_lena",
      reason: "Detailed service-charge question outside the AI's knowledge",
    },
    {
      id: "t5",
      kind: "agent",
      at: ago(4_170),
      agentId: "ag_lena",
      text: "Hi, Lena here from Meridian. Yes, single row backing the park. Service charge is AED 3.80 per sqft. I can send the full statement.",
    },
    {
      id: "t6",
      kind: "customer",
      at: ago(4_100),
      text: "Perfect, please send it. I'll be in Dubai next week for viewings.",
    },
    {
      id: "t7",
      kind: "agent",
      at: ago(4_090),
      agentId: "ag_lena",
      text: "Sent. I'll line up three villas for you next week.",
    },
    { id: "t8", kind: "resume", at: ago(4_080), byAgentId: "ag_lena" },
    {
      id: "t9",
      kind: "customer",
      at: ago(600),
      text: "Can you also add something in Arabian Ranches to the list?",
    },
    {
      id: "t10",
      kind: "ai",
      at: ago(599),
      text: "Of course — I've noted Arabian Ranches. Lena will include it in next week's viewings.",
    },
  ],

  // The AI got it wrong. Source of the pending correction on the Knowledge screen.
  ld_005: [
    {
      id: "t1",
      kind: "customer",
      at: ago(2_700),
      text: "Do you handle office space in Business Bay? Need about 2000 sqft.",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(2_699),
      text: "Yes, we have a 2 bed in Executive Towers at 1,450 sqft for AED 135,000 per year — would that suit?",
    },
    {
      id: "t3",
      kind: "customer",
      at: ago(2_690),
      text: "No, I need commercial office, not residential.",
    },
    {
      id: "t4",
      kind: "handoff",
      at: ago(2_685),
      toAgentId: "ag_sara",
      reason: "Flagged: AI offered a residential unit for a commercial request",
    },
    {
      id: "t5",
      kind: "agent",
      at: ago(2_600),
      agentId: "ag_sara",
      text: "Apologies for that — we're residential only, we don't handle commercial. I can refer you to a commercial brokerage if that helps.",
    },
  ],

  ld_006: [
    {
      id: "t1",
      kind: "customer",
      at: ago(96),
      text: "hi is the jvc townhouse still there",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(95),
      text: "Hi! MP-JVC-0442 in District 12 is currently reserved. I can show you two similar townhouses in JVC if you'd like?",
    },
    { id: "t3", kind: "customer", at: ago(90), text: "yes ok" },
    {
      id: "t4",
      kind: "ai",
      at: ago(89),
      text: "Great — what's your budget range, and are you buying or renting?",
    },
  ],

  ld_007: [
    {
      id: "t1",
      kind: "customer",
      at: ago(340),
      text: "Interested in the JBR 3 bed on the beach",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(339),
      text: "MP-JBR-0710 in Sadaf 6 was let last week, I'm sorry. We have a 2 bed in Business Bay and a 3 bed in Dubai Marina in a similar range — would either work?",
    },
    { id: "t3", kind: "customer", at: ago(330), text: "no thanks, only JBR" },
  ],

  ld_008: [
    {
      id: "t1",
      kind: "customer",
      at: ago(9_000),
      text: "Hello, I want to buy a studio as an investment. What yields are you seeing in Arjan?",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(8_999),
      text: "Arjan studios are currently letting around AED 44,000 per year. Are you looking at a specific budget?",
    },
    {
      id: "t3",
      kind: "customer",
      at: ago(8_900),
      text: "Under 600k. I'll take the Arjan one if the numbers work.",
    },
    {
      id: "t4",
      kind: "handoff",
      at: ago(8_890),
      toAgentId: "ag_rajesh",
      reason: "Ready to transact",
    },
    {
      id: "t5",
      kind: "agent",
      at: ago(8_800),
      agentId: "ag_rajesh",
      text: "Rajesh here — I'll send you the full yield breakdown and the service charges today.",
    },
    {
      id: "t6",
      kind: "customer",
      at: ago(4_000),
      text: "Received, thank you. We closed on it — appreciate the quick turnaround.",
    },
  ],

  ld_009: [
    {
      id: "t1",
      kind: "customer",
      at: ago(150),
      text: "Marina Gate 2 one bed — what floor and is it tenanted?",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(149),
      text: "MP-MAR-1201 is tenanted until Q3 at AED 1,780,000. I can confirm the exact floor with the listing agent — shall I have them message you?",
    },
    { id: "t3", kind: "customer", at: ago(140), text: "yes" },
    {
      id: "t4",
      kind: "handoff",
      at: ago(139),
      toAgentId: "ag_sara",
      reason: "Floor and tenancy detail requested",
    },
    {
      id: "t5",
      kind: "agent",
      at: ago(130),
      agentId: "ag_sara",
      text: "Hi, it's on the 34th floor, tenant vacates 12 September. Happy to arrange a viewing after that.",
    },
  ],

  ld_010: [
    {
      id: "t1",
      kind: "customer",
      at: ago(30),
      text: "Do you have anything in Creek Harbour around 2.3M?",
    },
    {
      id: "t2",
      kind: "ai",
      at: ago(29),
      text: "Yes — MP-CRK-0126 in Creek Rise Tower 1, 2 bed, 1,180 sqft, skyline and creek view, AED 2,320,000, vacant.",
    },
    {
      id: "t3",
      kind: "image",
      at: ago(29),
      author: "ai",
      imageUrl: photo("1600566753086-00f18fb6b3ea"),
      caption: "MP-CRK-0126 — Creek Rise Tower 1",
      listingId: "li_011",
      agentId: null,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// Leads
// ─────────────────────────────────────────────────────────────

export const LEADS: Lead[] = [
  {
    id: "ld_001",
    contactName: "Faisal Rahman",
    phone: "+971502284419",
    stage: "ready_to_view",
    closedOutcome: null,
    assignedAgentId: "ag_sara",
    listingId: "li_001",
    createdAt: ago(214),
    lastMessageAt: ago(199),
    handoff: { requestedAt: ago(199), agentId: "ag_sara", acknowledgedAt: null },
    aiPaused: true,
    extraction: {
      budgetMinAED: 2_200_000,
      budgetMaxAED: 2_400_000,
      intent: "buy",
      areas: ["Dubai Marina"],
      timeline: "before September",
      urgency: "high",
    },
    messageCount: 9,
  },
  {
    id: "ld_002",
    contactName: "Priya Nair",
    phone: "+971558830012",
    stage: "ready_to_view",
    closedOutcome: null,
    assignedAgentId: "ag_rajesh",
    listingId: "li_004",
    createdAt: ago(52),
    lastMessageAt: ago(18),
    handoff: { requestedAt: ago(18), agentId: "ag_rajesh", acknowledgedAt: null },
    aiPaused: true,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: 3_000_000,
      intent: "buy",
      areas: ["Downtown Dubai"],
      timeline: "viewing this weekend",
      urgency: "high",
    },
    messageCount: 6,
  },
  {
    id: "ld_003",
    contactName: null,
    phone: "+971561174420",
    stage: "qualifying",
    closedOutcome: null,
    assignedAgentId: "ag_lena",
    listingId: "li_002",
    createdAt: ago(1_450),
    lastMessageAt: ago(1_399),
    handoff: null,
    aiPaused: false,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: 62_000,
      intent: "rent",
      areas: ["Dubai Marina"],
      timeline: null,
      urgency: "medium",
    },
    messageCount: 5,
  },
  {
    id: "ld_004",
    contactName: "James Whitfield",
    phone: "+447700900412",
    stage: "ready_to_view",
    closedOutcome: null,
    assignedAgentId: "ag_lena",
    listingId: "li_010",
    createdAt: ago(4_300),
    lastMessageAt: ago(599),
    handoff: {
      requestedAt: ago(4_190),
      agentId: "ag_lena",
      acknowledgedAt: ago(4_175),
    },
    aiPaused: false,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: 9_500_000,
      intent: "buy",
      areas: ["Dubai Hills Estate", "Arabian Ranches"],
      timeline: "viewings next week",
      urgency: "high",
    },
    messageCount: 10,
  },
  {
    id: "ld_005",
    contactName: "Karim Boulos",
    phone: "+971503398871",
    stage: "closed",
    closedOutcome: "lost",
    assignedAgentId: "ag_sara",
    listingId: null,
    createdAt: ago(2_700),
    lastMessageAt: ago(2_600),
    handoff: {
      requestedAt: ago(2_685),
      agentId: "ag_sara",
      acknowledgedAt: ago(2_640),
    },
    aiPaused: false,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: null,
      intent: "rent",
      areas: ["Business Bay"],
      timeline: null,
      urgency: "low",
    },
    messageCount: 5,
  },
  {
    id: "ld_006",
    contactName: null,
    phone: "+971555512203",
    stage: "qualifying",
    closedOutcome: null,
    assignedAgentId: "ag_rajesh",
    listingId: "li_003",
    createdAt: ago(96),
    lastMessageAt: ago(89),
    handoff: null,
    aiPaused: false,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: null,
      intent: null,
      areas: ["Jumeirah Village Circle"],
      timeline: null,
      urgency: "medium",
    },
    messageCount: 4,
  },
  {
    id: "ld_007",
    contactName: "Nadia Haidar",
    phone: "+971509911784",
    stage: "closed",
    closedOutcome: "lost",
    assignedAgentId: "ag_lena",
    listingId: "li_007",
    createdAt: ago(340),
    lastMessageAt: ago(330),
    handoff: null,
    aiPaused: false,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: 250_000,
      intent: "rent",
      areas: ["Jumeirah Beach Residence"],
      timeline: null,
      urgency: "low",
    },
    messageCount: 3,
  },
  {
    id: "ld_008",
    contactName: "Wei Chen",
    phone: "+8613800138000",
    stage: "closed",
    closedOutcome: "won",
    assignedAgentId: "ag_rajesh",
    listingId: "li_008",
    createdAt: ago(9_000),
    lastMessageAt: ago(4_000),
    handoff: {
      requestedAt: ago(8_890),
      agentId: "ag_rajesh",
      acknowledgedAt: ago(8_850),
    },
    aiPaused: false,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: 600_000,
      intent: "buy",
      areas: ["Arjan"],
      timeline: "immediate",
      urgency: "high",
    },
    messageCount: 6,
  },
  {
    id: "ld_009",
    contactName: "Aisha Mubarak",
    phone: "+971544402219",
    stage: "qualifying",
    closedOutcome: null,
    assignedAgentId: "ag_sara",
    listingId: "li_009",
    createdAt: ago(150),
    lastMessageAt: ago(130),
    handoff: {
      requestedAt: ago(139),
      agentId: "ag_sara",
      acknowledgedAt: ago(135),
    },
    aiPaused: false,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: 1_800_000,
      intent: "buy",
      areas: ["Dubai Marina"],
      timeline: "after September",
      urgency: "medium",
    },
    messageCount: 5,
  },
  {
    id: "ld_010",
    contactName: null,
    phone: "+971582204471",
    stage: "new",
    closedOutcome: null,
    assignedAgentId: "ag_lena",
    listingId: "li_011",
    createdAt: ago(30),
    lastMessageAt: ago(29),
    handoff: null,
    aiPaused: false,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: 2_300_000,
      intent: "buy",
      areas: ["Dubai Creek Harbour"],
      timeline: null,
      urgency: "medium",
    },
    messageCount: 3,
  },
  {
    id: "ld_011",
    contactName: null,
    phone: "+971507789012",
    stage: "new",
    closedOutcome: null,
    assignedAgentId: "ag_sara",
    listingId: null,
    createdAt: ago(12),
    lastMessageAt: ago(11),
    handoff: null,
    aiPaused: false,
    extraction: {
      budgetMinAED: null,
      budgetMaxAED: null,
      intent: null,
      areas: [],
      timeline: null,
      urgency: null,
    },
    messageCount: 2,
  },
  {
    id: "ld_012",
    contactName: "Tom Becker",
    phone: "+491701234567",
    stage: "new",
    closedOutcome: null,
    assignedAgentId: "ag_rajesh",
    listingId: "li_005",
    createdAt: ago(8),
    lastMessageAt: ago(7),
    handoff: null,
    aiPaused: false,
    extraction: {
      budgetMinAED: 18_000_000,
      budgetMaxAED: 24_000_000,
      intent: "buy",
      areas: ["Palm Jumeirah"],
      timeline: null,
      urgency: "medium",
    },
    messageCount: 2,
  },
];

export function threadFor(leadId: string): Turn[] {
  return (
    threads[leadId] ?? [
      {
        id: "t1",
        kind: "customer",
        at: ago(10),
        text: "Hi, I'd like some information about a property.",
      },
      {
        id: "t2",
        kind: "ai",
        at: ago(9),
        text: "Of course — which area are you looking in, and are you buying or renting?",
      },
    ]
  );
}

// ─────────────────────────────────────────────────────────────
// Corrections
// ─────────────────────────────────────────────────────────────

export const CORRECTIONS: Correction[] = [
  {
    id: "cr_001",
    status: "pending",
    leadId: "ld_005",
    leadContactLabel: "Karim Boulos",
    aiSaid:
      "Yes, we have a 2 bed in Executive Towers at 1,450 sqft for AED 135,000 per year — would that suit?",
    whatWasWrong:
      "Customer asked for commercial office space. The AI offered a residential apartment instead of saying we don't cover commercial.",
    correctAnswer:
      "We are residential only — we do not handle commercial or office space. Offer to refer the customer to a commercial brokerage.",
    flaggedByAgentId: "ag_sara",
    flaggedAt: ago(2_580),
    approvedByAgentId: null,
    approvedAt: null,
  },
  {
    id: "cr_002",
    status: "pending",
    leadId: "ld_007",
    leadContactLabel: "Nadia Haidar",
    aiSaid:
      "MP-JBR-0710 in Sadaf 6 was let last week, I'm sorry. We have a 2 bed in Business Bay and a 3 bed in Dubai Marina in a similar range — would either work?",
    whatWasWrong:
      "Suggesting a completely different community to someone who named one specific building loses the lead. She only wanted JBR.",
    correctAnswer:
      "When a customer names one specific building or community, only suggest alternatives inside that same community. If nothing is available there, say so and offer to notify them when something comes up.",
    flaggedByAgentId: "ag_lena",
    flaggedAt: ago(300),
    approvedByAgentId: null,
    approvedAt: null,
  },
  {
    id: "cr_003",
    status: "approved",
    leadId: null,
    leadContactLabel: null,
    aiSaid: "Marina studios start at around AED 45,000 per year.",
    whatWasWrong: "Out of date — nothing in Marina has gone below 55k this year.",
    correctAnswer: "Dubai Marina studios start at AED 55,000 per year.",
    flaggedByAgentId: "ag_rajesh",
    flaggedAt: ago(14_400),
    approvedByAgentId: "ag_owner",
    approvedAt: ago(14_100),
  },
  {
    id: "cr_004",
    status: "approved",
    leadId: null,
    leadContactLabel: null,
    aiSaid: "I can arrange the Ejari registration for you.",
    whatWasWrong: "We don't do Ejari. That's the tenant's responsibility.",
    correctAnswer:
      "We do not handle Ejari registration, tenancy contracts, or any legal paperwork. Direct the customer to their agent for the tenancy contract and to the Dubai REST app for Ejari.",
    flaggedByAgentId: "ag_sara",
    flaggedAt: ago(20_000),
    approvedByAgentId: "ag_owner",
    approvedAt: ago(19_800),
  },
  {
    id: "cr_005",
    status: "approved",
    leadId: null,
    leadContactLabel: null,
    aiSaid: "We can hold the unit for you for two weeks.",
    whatWasWrong:
      "The AI has no authority to hold a unit. Only the owner can agree to that.",
    correctAnswer:
      "Never offer to hold or reserve a property. If a customer asks, say a hold needs to be agreed with the landlord and hand off to an agent.",
    flaggedByAgentId: "ag_lena",
    flaggedAt: ago(28_000),
    approvedByAgentId: "ag_owner",
    approvedAt: ago(27_800),
  },
  {
    id: "cr_006",
    status: "dismissed",
    leadId: null,
    leadContactLabel: null,
    aiSaid: "Our office is open Sunday to Thursday, 9am to 6pm.",
    whatWasWrong: "Thought we were open Saturdays now.",
    correctAnswer: "Office is open Saturday too.",
    flaggedByAgentId: "ag_rajesh",
    flaggedAt: ago(33_000),
    approvedByAgentId: null,
    approvedAt: null,
  },
];

// ─────────────────────────────────────────────────────────────
// Agency
// ─────────────────────────────────────────────────────────────

export const AGENCY: Agency = {
  id: "agc_meridian",
  name: "Meridian Properties",
  tradeLicense: "CN-1094427",
  email: "hello@meridianproperties.ae",
  phone: "+97143889100",
  address: "Office 1204, Bay Square Building 8, Business Bay, Dubai",
  whatsapp: {
    connected: true,
    number: "+97143889100",
    displayName: "Meridian Properties",
    verification: "verified",
    connectedAt: new Date(now - 118 * day).toISOString(),
  },
  aiPaused: false,
  overdueThresholdMinutes: 60,
  notifications: {
    handoffChannel: "both",
    recipients: ["omar@meridianproperties.ae", "+971501120044"],
  },
  sync: {
    status: "ok",
    attemptedAt: ago(180),
    succeededAt: ago(180),
    imported: 9,
    failed: 0,
    message: null,
  },
  onboardingComplete: true,
};

// ─────────────────────────────────────────────────────────────
// Activity feed
// ─────────────────────────────────────────────────────────────

export const ACTIVITY: ActivityItem[] = [
  {
    id: "av_01",
    kind: "handoff_requested",
    at: ago(18),
    summary: "Priya Nair asked to view Burj Vista — Rajesh Menon notified",
    leadId: "ld_002",
    agentId: "ag_rajesh",
  },
  {
    id: "av_02",
    kind: "lead_created",
    at: ago(30),
    summary: "New inquiry about Creek Rise Tower 1 from +971 58 220 4471",
    leadId: "ld_010",
    agentId: "ag_lena",
  },
  {
    id: "av_03",
    kind: "message_filtered",
    at: ago(44),
    summary: "3 inbound messages classified as not property-related",
    leadId: null,
    agentId: null,
  },
  {
    id: "av_04",
    kind: "agent_took_over",
    at: ago(130),
    summary: "Sara Haddad took over the conversation with Aisha Mubarak",
    leadId: "ld_009",
    agentId: "ag_sara",
  },
  {
    id: "av_05",
    kind: "listing_synced",
    at: ago(180),
    summary: "9 listings synced from Bayut and Property Finder",
    leadId: null,
    agentId: null,
  },
  {
    id: "av_06",
    kind: "handoff_requested",
    at: ago(199),
    summary: "Faisal Rahman asked to negotiate — Sara Haddad notified",
    leadId: "ld_001",
    agentId: "ag_sara",
  },
  {
    id: "av_07",
    kind: "correction_flagged",
    at: ago(300),
    summary: "Lena Kovač flagged a reply about JBR availability",
    leadId: "ld_007",
    agentId: "ag_lena",
  },
  {
    id: "av_08",
    kind: "ai_resumed",
    at: ago(4_080),
    summary: "Lena Kovač handed James Whitfield back to the AI",
    leadId: "ld_004",
    agentId: "ag_lena",
  },
  {
    id: "av_09",
    kind: "lead_resolved",
    at: ago(4_000),
    summary: "Wei Chen closed on the Arjan studio — won",
    leadId: "ld_008",
    agentId: "ag_rajesh",
  },
  {
    id: "av_10",
    kind: "correction_approved",
    at: ago(14_100),
    summary: "Omar Al Nuaimi approved “Marina studios start at AED 55,000”",
    leadId: null,
    agentId: "ag_owner",
  },
];

/** Inbound messages the classifier rejected today. Shown as a count, not a list. */
export const FILTERED_TODAY = 7;
