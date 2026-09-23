// The public VIRAAS occasion system is intentionally compact: five worlds,
// each with a real catalog filter, a colour story and editorial guidance.
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
): Occasion => ({ id, tag: OCCASION_TAG_BY_ID[id], title, subtitle, image, intro, dressCode, styling, palette, related })

export const occasions: Occasion[] = [
  O('garba', 'Garba', 'Gujarati colour, craft and circular energy', '/images/occasion-navratri.jpg',
    ['Garba is the fashion brief at its most specific: a chaniya that opens when you turn, a choli built for movement, mirrorwork that catches the light and a dupatta that stays put after the third round. VIRAAS keeps the edit rooted in Gujarati craft without turning it into costume.', 'For men, printed and embroidered kurtas in black, burgundy, navy and green lead the edit, with ivory bottoms and selective Gujarati-inspired borders. Pair both sides in colour, never in identical outfits.'],
    { women: 'Chaniya-choli with mirrorwork, bandhani or Kutch-inspired details', men: 'Printed or embroidered festive kurta, ivory trousers and clean juttis' },
    ['Choose a flared hem that can clear your feet; dance is the fit test', 'Secure the dupatta with a hidden shoulder tack and a soft waist tie', 'Mirrorwork earns the spotlight — keep the rest of the jewellery edited'],
    ['Fuchsia', 'Peacock Teal', 'Mustard', 'Indigo', 'Terracotta'], ['navratri', 'festive-party']),
  O('navratri', 'Navratri', 'Nine nights of mirrorwork, colour and cardio', '/images/occasion-navratri.jpg',
    ['Navratri is the broader festive canvas around Garba: chaniya choli, lehenga, bandhani-inspired details and menswear with a point of view. The edit keeps the movement and colour, then shifts the setting from dance ground to decorated venue, temple courtyard and late-night lights.', 'Make the craft legible from across the circle, but keep the silhouette wearable. One strong textile story is more modern than piling every embellishment into one outfit.'],
    { women: 'Chaniya-choli, flared lehenga or mirror-work ethnic set with an odhani', men: 'Printed festive shirt or embroidered kurta with one considered stole' },
    ['Use one reflective surface and one matte surface so the outfit photographs with depth', 'A secure dupatta and shoes with a real sole matter more than extra trim', 'Choose jewellery that moves with the body instead of fighting the dance'],
    ['Rani Pink', 'Royal Blue', 'Emerald', 'Black', 'Mustard'], ['garba', 'festive-party']),
  O('diwali', 'Diwali', 'Warm light, diyas and considered Indian dressing', '/images/occasion-diwali.jpg',
    ['Diwali dressing is warm-light dressing: colours that read against marigold garlands and brass, fabrics that survive a full evening of moving between doorway, courtyard and balcony. The edit leans jewel-toned silk, refined sarees, lehengas and quiet menswear with one excellent detail.', 'The rule we style by: one shine, one matte. If the saree carries zari, keep jewellery antique and edited; if the kurta is quiet cotton, let the dupatta or footwear carry the glow.'],
    { women: 'Saree, pre-draped saree, lehenga or anarkali with refined festive detail', men: 'Textured kurta, printed festive shirt or contemporary ethnic jacket' },
    ['Keep footwear stable around rangoli and thresholds', 'Wine, emerald, ivory, navy and antique gold flatter warm bulb light', 'Carry one spare safety pin; Diwali is a two-lamp minimum'],
    ['Ivory', 'Wine', 'Emerald', 'Antique Gold', 'Terracotta'], ['festive-party', 'college-fest']),
  O('festive-party', 'Festive Party', 'Indian occasion dressing with a little more ease', '/images/occasion-festive.jpg',
    ['Festive Party sits between a family gathering and a night out: Indian enough to respect the season, sharp enough to leave on your best photograph. Pre-draped sarees, shararas, modern ethnic sets, printed shirts and textured jackets carry the brief without drifting into formalwear.', 'Dress for standing, eating and being photographed mid-laugh. The strongest outfit is the one with enough movement to survive the room.'],
    { women: 'Pre-draped saree, sharara, anarkali or an elevated ethnic set', men: 'Printed festive shirt, relaxed kurta or textured jacket over a quiet base' },
    ['Choose a bag that closes with one hand and shoes that survive the floor', 'One statement detail is more premium than a full surface of sparkle', 'Contrast texture before colour: matte cotton against satin or woven silk'],
    ['Forest Green', 'Wine', 'Rust', 'Blush', 'Midnight Navy'], ['diwali', 'college-fest']),
  O('college-fest', 'College Fest', 'Young, expressive and budget-aware Indian festive style', '/images/occasion-college.jpg',
    ['College Fest rewards clever over expensive: a printed kurta set, a chaniya skirt styled with a simple top, comfortable juttis or sneakers and one borrowed jewellery piece can out-style a rented costume. The edit is made for campus movement, friends and photographs.', 'Keep it breathable, re-wearable and personal. A dupatta, scarf or embroidered layer can move a weekday base into a festival without pretending to be a wedding guest.'],
    { women: 'Chaniya choli, sharara, gharara, colourful saree or festive kurta set', men: 'Printed ethnic shirt, short kurta, modern kediyu or relaxed festive layer' },
    ['Comfortable footwear survives the queue and the dance floor', 'Borrow or re-style one statement piece instead of buying a whole costume', 'Let one colour or textile detail carry the outfit story'],
    ['Teal', 'Rust', 'Butter Yellow', 'Ivory', 'Rani Pink'], ['garba', 'festive-party']),
]

export const PRIMARY_OCCASION_IDS = ['garba', 'navratri', 'diwali', 'festive-party', 'college-fest'] as const
export const featuredOccasions = [...occasions].sort((a,b) => ['garba','navratri','college-fest','diwali','festive-party'].indexOf(a.id) - ['garba','navratri','college-fest','diwali','festive-party'].indexOf(b.id))

export const getOccasion = (id: string) => occasions.find((o) => o.id === id)

export function occasionProducts(occasionId: string, gender?: 'women' | 'men'): Product[] {
  const occ = getOccasion(occasionId)
  if (!occ) return []
  const pool = getProductsByOccasion(occ.tag)
  return gender ? pool.filter((p) => p.gender === gender) : pool
}
