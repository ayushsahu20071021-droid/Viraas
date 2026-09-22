// Occasion edits — each page is a real filter over the catalog plus handwritten
// styling guidance, not a static shell. Product rails on the page come from the
// occasion tag; if an occasion ever has too few products the generator warns.
import { OCCASION_TAG_BY_ID, getProductsByOccasion, type Product } from './products'

export interface Occasion {
  id: string
  tag: string
  /** Extra product occasion tags this edit also draws from (e.g. Garba ∪ Navratri). */
  tags?: string[]
  title: string
  subtitle: string
  image: string
  intro: [string, string]
  dressCode: { women: string; men: string }
  styling: string[]
  palette: string[]
  related: string[]
}

const O = (
  id: string, title: string, subtitle: string, image: string,
  intro: [string, string], dressCode: { women: string; men: string },
  styling: string[], palette: string[], related: string[],
): Occasion => ({ id, tag: OCCASION_TAG_BY_ID[id] || title, title, subtitle, image, intro, dressCode, styling, palette, related })

export const occasions: Occasion[] = [
  O('diwali', 'Diwali', 'Lakshmi, lamps and the loudest colour of the year', '/images/occasion-diwali.jpg',
    ['Diwali dressing is warm-light dressing: colours that read against marigold garlands and brass, fabrics that survive a full evening of hovering over thali tables. Our edit leans jewel-toned silk, handloom cotton for the puja hour and just enough zari to catch every diya.', 'The rule we style by: one shine, one matte. If the saree carries zari, keep jewellery antique and understated; if the kurta is quiet cotton, let the dupatta and jhumkas be loud.'],
    { women: 'Silk or tissue saree, or a chikan kurta-set with a statement dupatta', men: 'Kurta-set in art silk or cotton silk with a Nehru jacket for evening' },
    ['Keep footwear closed-toe — puja thresholds and rangoli both eat straps', 'Choose colours that flatter warm bulb light: wine, emerald, mustard, antique gold', 'Pack a spare safety pin for the pallu; Diwali is a two-lamp minimum'],
    ['Mustard', 'Wine', 'Emerald', 'Antique Gold', 'Terracotta'], ['puja', 'family-function', 'festive-party']),
  O('navratri', 'Navratri', 'Nine nights of mirrorwork, kud and cardio', '/images/occasion-navratri.jpg',
    ['Garba is sport disguised as festival: nine nights of circular sprinting under string lights. Everything in this edit is chosen for spin — flared lehengas that open when you turn, kediya cottons that breathe, bandhani that reads like static from three metres away.', 'Mirrorwork is the official craft of the season — it doubles your flash photography. Pair it with kolhapuris you can break in on night one without bleeding on night two.'],
    { women: 'Chaniya-choli or printed cotton lehenga with mirrorwork odhani', men: 'Kediyu or kafni set, one colour louder than your friends' },
    ['Belt the choli at the back with a cord, not a clasp — you will lose one clasp by hour two', 'Layers over the kurta (vest, bandhani stole) buy you warmth after 11pm', 'Hair in a braid with paranda; loose hair is a fidget spinner you cannot stop touching'],
    ['Hot Pink', 'Parrot Green', 'Sunflower Yellow', 'Copper'], ['sangeet', 'college-fest', 'festive-party']),
  O('wedding', 'Wedding', 'Heirloom weight, modern restraint', '/images/occasion-wedding.jpg',
    ['Wedding-week dressing runs long: functions from breakfast mehendi to the 11pm reception. The edit is built as a kit — one silk saree, one organza, one pre-draped number, a jacket that turns any kurta into a groom-side guest outfit.', 'Buy for the photographs you will keep: weave density reads in print; surface sparkle reads on screen. Our picks do both without borrowing from the bride\'s palette.'],
    { women: 'Banarasi or Chanderi silk for rituals; pre-draped satin for the reception', men: 'Bandhgala or sherwani weight kurta-set; brocade jacket over ivory linen for day functions' },
    ['Reserve red and deep maroon for the bride; wine, emerald and bottle green guest beautifully', 'Carry a compact clutch that fits a tissue, lipstick and a note of blessing money', 'Break in wedding shoes by walking on carpet, not tile'],
    ['Emerald', 'Wine', 'Bottle Green', 'Ivory', 'Antique Gold'], ['engagement', 'reception', 'sangeet']),
  O('sangeet', 'Sangeet', 'Performance lighting, performance fabrics', '/images/occasion-sangeet.jpg',
    ['Sangeet is the one night the dress code is "come as your best idea" — sequin lehengas, cape sets, a saree worn as a gown. Movement is the brief: if it cannot survive a dhol beat and a group photo scrum, it is not sangeet.', 'Make-up and fabric behave the same under stage light: matte disappears, shine scatters. This edit is chosen for how light leaves it.'],
    { women: 'Sequin or net lehenga, pre-draped gown-saree, cape kurta-set', men: 'Kurta with jacket in raw-mango or brocade; pocket square earns its place tonight' },
    ['Hemline above the ankle reads as movement; below it reads as drag', 'Choose a jacket with structure — it photographs like a suit and moves like a kurta', 'Wedges beat stilettos on decorated floors, every time'],
    ['Midnight Navy', 'Plum', 'Fuchsia', 'Champagne'], ['reception', 'night-out', 'navratri']),
  O('reception', 'Reception', 'The evening the photographs live on', '/images/occasion-reception.jpg',
    ['A reception asks for one thing: polish that survives four hours of handshakes. Satin slip sarees, velvet jackets, a single serious jewellery piece. The palette narrows to deep tones and metallics; everything else is texture.', 'If you are hosting-side, dress one notch above the invite; if you are guest-side, dress one notch below. VIRAAS styles the guest side.'],
    { women: 'Satin pre-draped saree or evening lehenga with fine stone work', men: 'Velvet or silk bandhgala; polished loafers, minimal visible jewellery' },
    ['Pick one statement earring and delete the necklace — or keep the necklace and delete everything else', 'A wrap or stole doubles as warmth for air-conditioned halls', 'Matte the shoes before the venue carpet; gloss scuffs show instantly'],
    ['Wine', 'Onyx Black', 'Antique Gold', 'Emerald'], ['wedding', 'engagement', 'date-night']),
  O('mehendi', 'Mehendi', 'Yellow, marigold and zero regret about getting henna on the outfit', '/images/occasion-mehendi.jpg',
    ['Mehendi is the daytime wedding function: marigold strings, sweet counter, hands in henna for two hours. Dress in yellow-to-ochre, choose fabrics that do not mind a stain, and wear jewellery you can remove with one wet hand.', 'Organza, cotton-silk and thread-embroidered everything. This is the one function where "effortless" is the actual brief.'],
    { women: 'Organza or cotton-silk in marigold and leaf tones, floral jewellery', men: 'Curta-pyjama in mustard or off-white cotton; gajra-free but with a bright stole' },
    ['Sleeves to the wrist — henna on the sleeve is still on the sleeve next week', 'Flower jewellery (gajra, floral rings) beats metal near henna', 'Skip the bindi on day one — mehendi hands will adjust it anyway'],
    ['Marigold', 'Peach', 'Lilac', 'Mint'], ['wedding', 'family-function', 'festive-party']),
  O('engagement', 'Engagement', 'The ring function — small room, close-up light', '/images/occasion-reception.jpg',
    ['Engagement photographs are shot close: collars, cuffs, the ring hand, your face. We style for macro — refined weaves over loud embellishment, pearl and polki over plated sparkle, tailoring that fits at the shoulder.', 'This is also the day family looks at the two of you as a pair. Harmonise one colour with your partner; do not match head-to-toe.'],
    { women: 'Fine silk or Chanderi saree with tone-on-tone work; pearl studs', men: 'Well-cut kurta with a waistcoat; watch visible under the cuff, bracelet off' },
    ['Matte your lips before the ring shot — gloss eats flash', 'One shared colour between the couple, everywhere else free', 'Practise the ring-hand rest: wrist forward, fingers relaxed'],
    ['Ivory', 'Blush Pink', 'Sage', 'Rose Gold'], ['wedding', 'reception', 'family-function']),
  O('wedding-guest', 'Wedding Guest', 'All the rules for dressing when it is not your day', '/images/occasion-guest.jpg',
    ['Guest dressing is arithmetic: how much shine is one notch below the family, how much colour photographs well in their venue light, how comfortable you need hour nine to feel. Our guest edit answers all three.', 'Off-limits: bridal reds in South Indian ceremonies, heavy gold bridal borders, white sarees at North Indian day functions unless invited. Everything else is fair game.'],
    { women: 'Chanderi, raw silk or pre-draped saree; a jacket kurta-set reads "considered"', men: 'Kurta with printed jacket, or a linen co-ord for daytime receptions' },
    ['Carry a shawl or dupatta you can actually use — halls are cold, gardens are not', 'Black is acceptable in metros; avoid it at day-time temple ceremonies', 'Leave the bridal-jewellery cosplay at home; one polished piece reads richer'],
    ['Sage', 'Peach', 'Rust', 'Stone Grey', 'Olive'], ['wedding', 'reception', 'family-function']),
  O('family-function', 'Family Function', 'Respectful, warm and photographed mid-laugh', '/images/occasion-family-function.jpg',
    ['Family functions are the tests of fit: you will be seated on floor cushions, greeting elders, holding a thali. Modest necklines, non-restrictive flare, fabrics that do not crease when you sit. Anarkali suits and soft-silk sarees carry this brief perfectly.', 'Colours: warm and approachable. The aunties notice effort more than expense — a crisply ironed cotton-silk beats a tired satin, always.'],
    { women: 'Anarkali or palazzo kurta-set in Chanderi, modest zari border', men: 'Kurta-set with stole; chikan work reads thoughtful, not showy' },
    ['Shoes you can remove and re-find in one motion', 'Deep necklines need an inner layer — pin it, do not hope', 'Spare dupatta pin: you will lend it, then need it yourself'],
    ['Peach', 'Olive', 'Mustard', 'Sand'], ['puja', 'festive-party', 'mehendi']),
  O('puja', 'Puja & Temple', 'Sacred dress code, simplified', '/images/occasion-wedding.jpg',
    ['Temple and puja dressing is about respect coded in fabric: covered shoulders, hemlines that sit, colours that do not shout against brass and marigold. Cotton-silk, Chanderi, handloom weaves with a small zari line.', 'Jewellery stays traditional — temple jewellery reads perfect here and elsewhere. Shoes: easy on, easy off, leather-free if the shrine is strict.'],
    { women: 'Silk or cotton-silk saree, or a straight kurta with leggings; gold-thread jewellery', men: 'Kurta-pyjama or dhoti-vesti where tradition asks; short-sleeve linen for daytime' },
    ['One-piece overlayers beat scarves that slide', 'Fragrance minimal — incense wins', 'Tuck the pallu before entering; the garbhagriha is not a photo set'],
    ['Turmeric', 'Kumkum Red', 'Ivory', 'Deep Green'], ['diwali', 'family-function', 'winter']),
  O('festive-party', 'Festive Party', 'The office-to-cousins crossover', '/images/occasion-festive.jpg',
    ['The festive party sits between a wedding guest and a night out: ethnic enough to respect the season, sharp enough to leave on your best photograph. Co-ords, jacket-over-kurta combos and the pre-draped saree are the three silhouettes that always land.', 'If it is a potluck, dress like you will be standing. If it is a venue, dress for the seating you will not get.'],
    { women: 'Sequin-lite pre-draped saree, or a satin co-ord with a statement belt', men: 'Printed kurta with Nehru jacket; no tie, pocket square yes' },
    ['Wear something you can eat a full plate in (elastic backs, not hooks)', 'A clutch that closes with one hand frees the other for greetings', 'Dark shades near sambar; you will not get the spot out, but you will not see it either'],
    ['Wine', 'Forest Green', 'Copper', 'Onyx Black'], ['diwali', 'night-out', 'sangeet']),
  O('college-fest', 'College Fest', 'Budget-first, maximum signal', '/images/occasion-college.jpg',
    ['Fest season on campus rewards clever over expensive: a ₹1,199 printed kurta set, kolhapuris, and one borrowed jewellery piece from a mother\'s box will out-style a rented lehenga. Everything here is under student-achievable budgets.', 'Under-18? Perfectly fine to browse, shop, save and share. AI Try-On needs 18+, full stop — it is a photo of your face and that deserves consent rules.'],
    { women: 'Cotton co-ord, kurti-and-jeans with oxidised jhumkas', men: 'Printed short kurta over jeans or a cotton pathani set' },
    ['Borrow, do not rent: the group is your wardrobe pool', 'Comfortable flats survive the queue at the food stall', 'If you buy one festive thing, buy the dupatta — everything changes behind it'],
    ['Hot Pink', 'Parrot Green', 'Powder Blue', 'Sunflower Yellow'], ['navratri', 'daywear', 'date-night']),
  O('workwear', 'Work-to-Dinner', 'Same outfit, two lighting rigs', '/images/occasion-women.jpg',
    ['The workwear-festive crossover is the most underused outfit in India: linen co-ords, Chanderi kurtas and structured jackets that outlive the 6pm email. Day version: minimal, flat, professional. Evening version: add the gold earring and the belt.', 'We test every workwear pick against a laptop bag, an air-conditioned room and a 90-minute commute. If it survives, it stays in the edit.'],
    { women: 'Straight kurta-set with a jacket, or a soft-silk saree without sparkle', men: 'Shirt-and-trouser in Chanderi, linen co-ord, or a kurta with a waistcoat' },
    ['Neutral base, one festive accent — the accent is where the party lives', 'A foldable stole turns a meeting room dress into a dinner outfit', 'Shoes: leather sole for office hours, rubber for monsoon evenings'],
    ['Ivory', 'Stone Grey', 'Olive', 'Navy'], ['daywear', 'night-out', 'family-function']),
  O('night-out', 'Night Out', 'Where the city goes after ten', '/images/occasion-festive.jpg',
    ['City nights want darker palettes, sharper shoulders and fabrics with a little weight. Satin, crepe, velvet in winter. This is the one occasion where Indo-Western is the baseline, not the experiment.', 'Dance floors break delicate hooks and expensive pearls — choose pieces that move with you.'],
    { women: 'Draped gown-saree, co-ord in satin, statement-earring-only', men: 'Short kurta over tailored trousers, or a jacket over a plain shirt' },
    ['Cross-body over clutch — you will need hands', 'Matte base, gloss lip (or the reverse); both gloss reads like a spill', 'One backup pin in your pocket is the whole survival kit'],
    ['Onyx Black', 'Wine', 'Emerald', 'Midnight Navy'], ['date-night', 'festive-party', 'sangeet']),
  O('date-night', 'Date Night', 'Dinner for two, dressing for one', '/images/couple-edit.jpg',
    ['Date-night festive dressing should say "I tried, lightly" — a kurti-jacket combo, a pre-draped saree without bridal weight, a bandhgala without the wedding entourage. Fit matters more than fabric. Comfort matters more than sparkle.', 'Plan around the venue: courtyard = linens; AC restaurant = satins; rooftop = bring a stole and share it.'],
    { women: 'Slip-saree or asymmetric hem set, small necklace', men: 'Linen kurta with jacket, or a clean co-ord suit with a watch' },
    ['Avoid jhumkas over hoop earrings — tangles are real', 'Scent applied to clothes, not wrists, survives dinner', 'The best couple look is harmonised, not matched'],
    ['Plum', 'Wine', 'Dusty Rose', 'Onyx Black'], ['night-out', 'reception', 'travel']),
  O('destination-wedding', 'Destination Wedding', 'Three days, one suitcase', '/images/occasion-destination.jpg',
    ['Destination dressing is packing strategy disguised as fashion: three bases that interlock into five looks, colours that work against sand and marble, fabrics that do not panic in humidity. Tissue and organza stay home; cotton-silk, chiffon and linen travel.', 'Reef-safe hair, low block heels for lawns, one structured jacket for the evening ceremony. If the venue is beach-side, bring a shawl for 8pm winds.'],
    { women: 'Two sarees (light + evening), one co-ord, one gown set', men: 'Two kurta-sets, one linen suit, one jacket that pairs with both' },
    ['Packing rule: everything in the bag must mix with everything else', 'White/cream for day, deep jewel tones for evening on the same palette family', 'Steam, not iron — hotel hangers over hot shower steam saves the outfit'],
    ['Sand', 'Sea Blue', 'Terracotta', 'Copper'], ['travel', 'wedding', 'reception']),
  O('daywear', 'Daywear', 'Festive-adjacent, all-day comfortable', '/images/occasion-women.jpg',
    ['Daywear festive means the soft version of everything: cotton-silk instead of silk, chikan instead of zardozi, kolhapuri instead of heels. For pujas at noon, lunch after the aarti and a 4pm family photo you almost skipped.', 'This edit is also the most giftable — sizes forgive, fabrics forgive, everyone owns a straight kurta by the end.'],
    { women: 'Handloom cotton or linen saree, straight kurta-set', men: 'Cotton or linen kurta set, kolhapuris, a stole for temple hours' },
    ['Matte sun protection on skin, matte fabric on outfit — shine in daylight reads sweaty', 'Wider hems breathe; tapered ones photograph better — choose your war', 'Block-print creases are a feature, not a bug'],
    ['Ivory', 'Mint', 'Powder Blue', 'Oat Melange'], ['college-fest', 'workwear', 'puja']),
  O('winter', 'Winter Festive', 'Layering as a craft', '/images/occasion-men.jpg',
    ['North-Indian winter festive dressing is built in layers: velvet and wool-blend bandhgalas over silk kurtas, shawls instead of dupattas, closed juttis. December-February weddings run after dark anyway, so evening palettes apply all day.', 'South-Indian winter is just... festive with a stole. We carry both climates in the edit.'],
    { women: 'Velvet lehenga or a wool-blend anarkali with a lined jacket', men: 'Velvet bandhgala, jamawar shawl, mojaris with a thicker sole' },
    ['Layer weight on top, warmth at the ankle — feet decide the evening length', 'Deep jewel tones read richer than black in winter light', 'Carry a compact stole; it doubles as warmth, temple cover and camera prop'],
    ['Bottle Green', 'Plum', 'Chocolate', 'Wine'], ['reception', 'diwali', 'night-out']),
  O('garba', 'Garba', 'Mirrorwork, spin-tested hems and nine-night stamina', '/images/occasion-garba.jpg',
    ['Garba is the sport of Navratri: circular sprinting around a garbo under string lights, in outfits engineered for spin. This edit pairs classic chaniya choli energy with 2026 proportions — contemporary lehenga flares, mirror work placed where flash finds it, kediya cuts that actually breathe.',
     'Men keep it current: a modern Garba jacket or kediya over tapered trousers, one loud colour, bandhani done properly. Dandiya optional, stamina mandatory.'],
    { women: 'Chaniya choli or contemporary lehenga with mirror-work odhani', men: 'Modern kediyu or Garba jacket with tapered trousers and a festive stole' },
    ['Flare radius decides how your spin photographs — test it in the mirror, not the trial room', 'Mirror work doubles flash photography; bandhani doubles crowd photos', 'Break in your footwear on night one — nine nights is a marathon'],
    ['Hot Pink', 'Peacock Teal', 'Parrot Green', 'Coral'], ['navratri', 'sangeet', 'college-fest']),
  O('haldi', 'Haldi', 'Turmeric-yellow dressing with zero stain regrets', '/images/occasion-haldi.jpg',
    ['The haldi ceremony is daylight, marigolds and a crowd determined to dab turmeric on everything you wear — including you. Dress in yellows, ivories and florals that celebrate the stain rather than fear it. Cotton-silk, organza and threadwork over anything precious.',
     'Couples style it complementary: her in a mastani yellow or ivory floral, him in cream or ivory kurta with a mustard accent. Keep jewellery light, waterproof and removable with one hand.'],
    { women: 'Ivory or yellow floral outfit — organza kurta set, cotton-silk saree or lehenga', men: 'Cream or ivory kurta with a mustard or saffron stole accent' },
    ['Wear what you can launder — haldi stories are the best photos', 'Flower jewellery beats metal near turmeric and mehendi hands', 'Ivory photographs beautifully against marigold backdrops — lean into it'],
    ['Butter Yellow', 'Ivory', 'Marigold', 'Peach'], ['mehendi', 'wedding', 'family-function']),
]

// Garba draws from both the Garba tag and the wider Navratri pool.
const garbaOccasion = occasions.find((o) => o.id === 'garba')
if (garbaOccasion) garbaOccasion.tags = ['Garba', 'Navratri']

export const getOccasion = (id: string) => occasions.find((o) => o.id === id)

// ── retained user-facing occasion system (directive §1/§36/§48) ─────────────
// Exactly five public edits. The other editorial occasions remain as internal
// product metadata (search/tags stay intact) but are no longer navigable pages;
// their old routes redirect to the nearest retained edit.
export const USER_OCCASION_IDS = ['diwali', 'navratri', 'garba', 'festive-party', 'college-fest'] as const
export const userOccasions: Occasion[] = USER_OCCASION_IDS.map((id) => getOccasion(id)).filter(Boolean) as Occasion[]
export const OCCASION_REDIRECT: Record<string, string> = {
  wedding: 'diwali', reception: 'diwali', engagement: 'diwali', 'wedding-guest': 'diwali',
  'destination-wedding': 'diwali', puja: 'diwali', winter: 'diwali',
  sangeet: 'festive-party', mehendi: 'festive-party', haldi: 'festive-party',
  'family-function': 'festive-party', 'night-out': 'festive-party', 'date-night': 'festive-party',
  daywear: 'festive-party', workwear: 'festive-party',
}

export function occasionProducts(occasionId: string, gender?: 'women' | 'men'): Product[] {
  const occ = getOccasion(occasionId)
  if (!occ) return []
  const tags = occ.tags?.length ? occ.tags : [occ.tag]
  const pool = getProductsByOccasion(tags[0]).concat(
    ...tags.slice(1).map((t) => getProductsByOccasion(t)),
  )
  const unique = [...new Map(pool.map((p) => [p.id, p])).values()]
  return gender ? unique.filter((p) => p.gender === gender) : unique
}
