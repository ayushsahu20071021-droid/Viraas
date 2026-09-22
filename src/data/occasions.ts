// The public occasion system is deliberately small: five destinations, each
// backed by a real product filter and editorial styling guidance.
import { OCCASION_TAG_BY_ID, getProductsByOccasion, type Product } from './products'

export interface Occasion {
  id: string
  tag: string
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
  O('garba', 'Garba', 'Gujarati colour, craft and circular energy', '/images/occasion-navratri.jpg',
    ['Garba is the fashion brief at its most specific: a chaniya that opens when you turn, a choli built for movement, mirrorwork that catches the light and a dupatta that stays put after the third round. VIRAAS keeps the edit rooted in Gujarati craft without turning it into costume.', 'For men, the kediyu is the hero — contemporary proportions, breathable cotton and considered mirrorwork instead of a wall of decoration. Pair both sides in colour, never in identical outfits.'],
    { women: 'Chaniya-choli with mirrorwork, bandhani or Kutch-inspired details', men: 'Modern kediyu or kafni set with tapered trousers and clean juttis' },
    ['Choose a flared hem that can clear your feet; dance is the fit test', 'Secure the dupatta with a hidden shoulder tack and a soft waist tie', 'Mirrorwork earns the spotlight — keep the rest of the jewellery edited'],
    ['Fuchsia', 'Peacock Teal', 'Mustard', 'Indigo', 'Terracotta'], ['navratri', 'festive-party', 'college-fest']),
  O('navratri', 'Navratri', 'Nine nights of mirrorwork, kud and cardio', '/images/occasion-navratri.jpg',
    ['Navratri is sport disguised as festival: nine nights of circular sprinting under string lights. Everything in this edit is chosen for spin — flared lehengas that open when you turn, kediya cottons that breathe, bandhani that reads like static from three metres away.', 'Mirrorwork is the official craft of the season — it doubles your flash photography. Pair it with kolhapuris you can break in on night one without bleeding on night two.'],
    { women: 'Chaniya-choli or printed cotton lehenga with mirrorwork odhani', men: 'Kediyu or kafni set, one colour louder than your friends' },
    ['Belt the choli at the back with a cord, not a clasp — you will lose one clasp by hour two', 'Layers over the kurta buy warmth after 11pm', 'Hair in a braid with paranda; loose hair is a fidget spinner you cannot stop touching'],
    ['Hot Pink', 'Parrot Green', 'Sunflower Yellow', 'Copper'], ['garba', 'festive-party', 'college-fest']),
  O('diwali', 'Diwali', 'Lakshmi, lamps and the loudest colour of the year', '/images/occasion-diwali.jpg',
    ['Diwali is warm-light dressing: colours that read against marigold garlands and brass, fabrics that survive a full evening of hovering over thali tables. Our edit leans jewel-toned silk, handloom cotton for the puja hour and just enough zari to catch every diya.', 'The rule we style by: one shine, one matte. If the saree carries zari, keep jewellery antique and understated; if the kurta is quiet cotton, let the dupatta and jhumkas be loud.'],
    { women: 'Silk or tissue saree, or a chanderi kurta-set with a statement dupatta', men: 'Kurta-set in art silk or cotton silk with a Nehru jacket for evening' },
    ['Keep footwear closed-toe — puja thresholds and rangoli both eat straps', 'Choose colours that flatter warm bulb light: wine, emerald, mustard, antique gold', 'Pack a spare safety pin for the pallu; Diwali is a two-lamp minimum'],
    ['Mustard', 'Wine', 'Emerald', 'Antique Gold', 'Terracotta'], ['festive-party', 'garba', 'college-fest']),
  O('festive-party', 'Festive Party', 'The office-to-cousins crossover', '/images/occasion-festive.jpg',
    ['The festive party sits between a family gathering and a night out: ethnic enough to respect the season, sharp enough to leave on your best photograph. Co-ords, jacket-over-kurta combinations and the pre-draped saree are the three silhouettes that always land.', 'If it is a potluck, dress like you will be standing. If it is a venue, dress for the seating you will not get.'],
    { women: 'Sequin-lite pre-draped saree, or a satin co-ord with a statement belt', men: 'Printed kurta with a Nehru jacket; no tie, pocket square yes' },
    ['Wear something you can eat a full plate in', 'A clutch that closes with one hand frees the other for greetings', 'Dark shades near a buffet are practical, not boring'],
    ['Wine', 'Forest Green', 'Copper', 'Onyx Black'], ['diwali', 'garba', 'college-fest']),
  O('college-fest', 'College Fest', 'Budget-first, maximum signal', '/images/occasion-college.jpg',
    ['Fest season on campus rewards clever over expensive: a printed kurta set, kolhapuris and one borrowed jewellery piece will out-style a rented lehenga. Everything here is under student-achievable budgets and built for moving between stages, food stalls and friends.', 'Under-18? Perfectly fine to browse, shop, save and share. AI Try-On needs 18+, full stop — it is a photo of your face and that deserves consent rules.'],
    { women: 'Cotton co-ord, kurti-and-jeans with oxidised jhumkas', men: 'Printed short kurta over jeans or a cotton pathani set' },
    ['Borrow, do not rent: the group is your wardrobe pool', 'Comfortable flats survive the queue at the food stall', 'If you buy one festive thing, buy the dupatta — everything changes behind it'],
    ['Hot Pink', 'Parrot Green', 'Powder Blue', 'Sunflower Yellow'], ['garba', 'navratri', 'festive-party']),
]

export const PRIMARY_OCCASION_IDS = ['garba', 'navratri', 'diwali', 'festive-party', 'college-fest'] as const
export const featuredOccasions = occasions
export const getOccasion = (id: string) => occasions.find((o) => o.id === id)

export function occasionProducts(occasionId: string, gender?: 'women' | 'men'): Product[] {
  const occ = getOccasion(occasionId)
  if (!occ) return []
  const pool = getProductsByOccasion(occ.tag)
  return gender ? pool.filter((p) => p.gender === gender) : pool
}
