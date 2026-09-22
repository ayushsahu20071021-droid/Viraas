// The Journal — 16 handwritten editorial pieces. Product rails inside articles
// are live queries against the catalog (occasion/craft/colour), so a refresh of
// the generated data updates them automatically.
import { products, type Product } from './products'

export interface ArticleSection { heading: string; paras: string[] }
export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  category: 'Craft' | 'Styling' | 'Care' | 'Occasion' | 'Index'
  readTime: number
  date: string
  image: string
  tags: string[]
  intro: string
  sections: ArticleSection[]
  rail?: { title: string; note: string; select: (all: Product[]) => Product[] }
}

export const byColour = (c: string, n = 4, gender?: 'women' | 'men') => (all: Product[]) =>
  all.filter((p) => p.colour === c && (!gender || p.gender === gender) && p.category !== 'couple-edit').slice(0, n)
const byOccasion = (o: string, n = 4, gender?: 'women' | 'men') => (all: Product[]) =>
  all.filter((p) => p.occasions.includes(o) && (!gender || p.gender === gender) && p.category !== 'couple-edit').slice(0, n)
const byCraft = (c: string, n = 4) => (all: Product[]) =>
  all.filter((p) => [p.embroidery, p.pattern, p.weave].includes(c) && p.category !== 'couple-edit').slice(0, n)

export const articles: Article[] = [
  {
    id: 'a1', slug: 'the-organza-decode', title: 'The Organza Decode: why the sheer saree outlived every trend prediction',
    excerpt: 'Two years ago organza was a "moment". Today it is the default festive daytime fabric — here is what actually changed in the mills, and how to wear it like you are not cosplaying.',
    category: 'Craft', readTime: 6, date: '2026-09-02', image: '/images/journal-saree-drape.jpg', tags: ['Saree', 'Fabric', 'Festive'],
    intro: 'Organza arrived in Indian festive dressing as a western export filtered through Bengal and Varanasi weavers — and then refused to leave. The reason is not Instagram. It is that a 40-gram saree that holds a pleat, photographs like satin and costs less than a mediocre georgette solved a real problem for real events.',
    sections: [
      { heading: 'What changed on the loom side', paras: [
        'Fine denier filament organzas stopped being stiff. Early versions scored against the skin and stood up like lampshades. Current Indian-woven stock, especially Varanasi silk-organza blends, carries a soft finish and, more importantly, accepts embroidery without puckering — which is why buti and tone-on-tone work exploded alongside the fabric.',
        'The second change was borders. Power-loom zari borders woven onto organza grounds replaced glued-on trims, which is the difference between a saree that looks expensive on a zoom call and one that looks it in person.',
      ] },
      { heading: 'How to actually wear it', paras: [
        'Treat organza as a daylight fabric. Under hard evening light the sheerness reads as "unfinished" unless the blouse lining is dense — so insist on full-lined blouses, and if yours does not come with one, get one; it costs less than the saree and doubles its lifespan.',
        'Petticoat: matte cotton or satin, never the same colour as the saree. A contrast shade of ivory, taupe or deep base-colour lets the sheer read as a deliberate layer instead of an accident. Pleat your falls with the petticoat slightly shorter — organza shows every millimetre.',
      ] },
      { heading: 'Buying checks that matter', paras: [
        'Hold it up to light and look for reedy slubs (fine, even ones are the handloom signature; clumps are defects). Pull a single thread at the selvedge — good organza resists. And ask for the fall/ticket piece: organza snags in storage, and a replacement fall is the cheapest insurance you will ever buy.',
      ] },
    ],
    rail: { title: 'The organza shelf at VIRAAS', note: 'Every organza piece currently in the edit, checked against our sheer-fabric criteria.', select: (all) => all.filter((p) => /organza/i.test(p.fabric) && p.category !== 'couple-edit').slice(0, 6) },
  },
  {
    id: 'a2', slug: 'chikankari-every-single-stitch', title: 'Chikankari: every single stitch, and which ones are worth the wait',
    excerpt: 'Thirty-two named stitches, one ghost-white craft. A working guide to judging Lucknow chikan by the back of the fabric — the only side that tells the truth.',
    category: 'Craft', readTime: 8, date: '2026-08-19', image: '/images/journal-chikankari.jpg', tags: ['Chikankari', 'Lucknow', 'Handwork'],
    intro: 'Chikankari is the only Indian embroidery where the connoisseur looks at the wrong side of the cloth first. The front can be charmingly uneven; the back is either a controlled lattice of knotless runs or it is a machine imitation wearing a heritage word. Learn to check and nobody can upsell you.',
    sections: [
      { heading: 'The stitches that carry price', paras: [
        'Murri (puffed pearl dots), phanda (knot clusters), bakhiya (shadow-work runs, symmetrical on both faces) and pechni (fine scalloped filling) are where the days of labour live. A kurta yoke dense in pechni at a "bargain" price means the work is not what the label says.',
        'Gitti — small dense darns outlining motifs — is the honest entry-level stitch: fast enough to keep cotton chikan under a believable price, distinctive enough to read as chikan from a metre away.',
      ] },
      { heading: 'Fabric and thread handshake', paras: [
        'Chikan was born on muslin because the thread count must match the needle: on stiff, tightly finished cottons the runs pucker the cloth; on floaty synthetics the stitches collapse. Chanderi, mulmul-grade cotton and fine linen are the modern sweet spots. Viscose "chikan-style" pieces are machine-embroidered — often perfectly nice, but shop them for their true price.',
      ] },
      { heading: 'Care, or you lose the work in two seasons', paras: [
        'Soak, do not scrub: cool water, mild liquid detergent, ten minutes, gentle squeeze. Dry flat in shade with the embroidery face up, never on a line (stretches run). Store folded with a cotton layer between folds so thread ridges do not print into the next fabric. Press on the reverse with a iron on silk setting — an iron touching raised murri flattens it forever.',
      ] },
    ],
    rail: { title: 'Chikankari, currently in stock at VIRAAS', note: 'Filtered by our catalog craft field — pieces labelled for chikan work.', select: byCraft('Chikankari', 6) },
  },
  {
    id: 'a3', slug: 'garba-physics', title: 'Garba physics: the complete kit for nine nights without chafing, blisters or wardrobe failure',
    excerpt: 'A round of garba is a 40-minute cardio set in formalwear. Here is the load-bearing kit: chaniya engineering, footwear rules, and the safety-pin map.',
    category: 'Styling', readTime: 5, date: '2026-08-06', image: '/images/journal-garba-night.jpg', tags: ['Navratri', 'Garba', 'Kit'],
    intro: 'Navratri defeats outfits that worked at weddings. The dance is a continuous centrifuge: lehengas need weight at the hem or they flip over your head, blouses need back security or the mirrorwork is everyone\'s property by midnight, and shoes are either kolhapuri-grade or irrelevant.',
    sections: [
      { heading: 'Chaniya and kedaau engineering', paras: [
        'Look for panels cut on-swing with a weighted or gota border at the fall line — that is what makes the flare open. A lehenga that looks identical flat on a hanger to one at the dance floor is not garba gear. Katchali (the inner waist tape) must be cotton, stitched through the lehenga, not glued — glue lets go at hour two of sweat.',
        'Kediyu for men: vent the side slits to mid-thigh minimum; straight hems restrict the spin step. Kafni wearers: tie the knot at the left hip, the right hip will punch out by night three.',
      ] },
      { heading: 'Footwear', paras: [
        'Kolhapuris and flat juttis with stitched soles; no glue-only soles on concrete floors. Two nights on the same pair max before blisters compound; carry mole skin in your bag like it is a phone charger. Heels are a costume decision, not a footwear decision.',
      ] },
      { heading: 'The pin map', paras: [
        'One at each shoulder strap inside the blouse (anti-slip), one at the odhani-to-kediyu crossing (keeps the drape from whipping into dancers behind you), two spares in a zip pocket. That is the entire emergency kit.',
      ] },
    ],
    rail: { title: 'Navratri kit from the edit', note: 'Mirrorwork, bandhani and dance-tested cottons from the VIRAAS garba rail.', select: byOccasion('Navratri', 6) },
  },
  {
    id: 'a4', slug: 'the-men-s-fit-law', title: 'The men\'s fit law: shoulder first, everything else negotiable',
    excerpt: 'Nine out of ten ethnic menswear fails on one seam. A fitting-room protocol for kurta-sets, jackets and bandhgalas that works even when you buy online.',
    category: 'Care', readTime: 6, date: '2026-07-24', image: '/images/journal-mens-tailoring.jpg', tags: ['Menswear', 'Fit', 'Tailoring'],
    intro: 'A kurta is forgiving at the waist, a bandhgala is not forgiving anywhere — which is why the men\'s festive fit problem is really a shoulder problem wearing other people\'s complaints. Here is the order of operations, measured against a tape you own, not a tailor\'s opinion.',
    sections: [
      { heading: 'Shoulder seam', paras: [
        'The seam must end exactly at the acromion bone — the bumpy shelf you can feel at the end of your shoulder. One centimetre over and the sleeve twists; one under and the jacket sits like borrowed scaffolding. This is the only number that cannot be let out cheaply.',
        'Chest: two fingers of ease across the pectoral, flat, when buttoned. Bandhgala specifically: the placket must hang parallel, not splay at the third button. Splay means your size is up, not that the fit is "snug".',
      ] },
      { heading: 'Length, not drama', paras: [
        'Kurtas to mid-thigh (the hem should land where your thumb curls when relaxed) — below the knee turns daytime cotton into evening velvet by accident. Churidar gathers at the ankle are intended; a straight trouser pooling on shoes is not.',
      ] },
      { heading: 'The online order protocol', paras: [
        'Order two sizes, plan returns before you pay. When it arrives: try it on with the shoes and undershirt you will actually wear, stand at a mirror at an angle (front seams lie head-on), and check the shoulder with a 20-second side view before touching the tag. Keep the packaging until you decide. VIRAAS product pages list the brand and the retailer — the return rules live with the retailer, not us.',
      ] },
    ],
    rail: { title: 'Structured starts for men', note: 'Jackets and bandhgalas with shoulder-first construction.', select: (all) => all.filter((p) => p.gender === 'men' && (p.category === 'jackets' || p.category === 'kurta-sets')).slice(0, 6) },
  },
  {
    id: 'a5', slug: 'accessory-architecture', title: 'Accessory architecture: jhumka, kada, potli — building a look in three pieces',
    excerpt: 'Most festive accessorising fails by addition. The three-point system — anchor, bridge, utility — gets it right with less.',
    category: 'Styling', readTime: 5, date: '2026-07-11', image: '/images/journal-accessory-styling.jpg', tags: ['Jewellery', 'Bags', 'Styling'],
    intro: 'The outfit is a sentence; accessories are punctuation. Too many commas and nobody hears the point. At VIRAAS we style every look with exactly three accessory roles: one anchor at the face or wrist, one bridge that ties colours, one utility piece that is allowed to look expensive because it is doing actual work.',
    sections: [
      { heading: 'The anchor', paras: [
        'Choose face or wrist, never both. Jhumka or chandbali when the neckline is high or the hair is up; a kada or a watch when the neck is bare and the hair is down. Weight matters: a 45-gram jhumka is a fashion decision; an 80-gram one is an ophthalmology decision. Real weight for evening gold-tones sits between 20 and 50 grams per side.',
      ] },
      { heading: 'The bridge', paras: [
        'The bridge repeats one colour from the outfit in a different material — a rust enamel bangle picking up the border, a pearl choker echoing an ivory blouse. It never introduces a fourth colour. If you cannot explain what it is echoing, it is not a bridge, it is noise.',
      ] },
      { heading: 'The utility piece', paras: [
        'Potli, belt bag or kolhapuri. This is where you spend: a good bag and real-leather footwear read as wealth in photographs from any social class. No one remembers your choker; everyone notices the shoes.',
      ] },
    ],
    rail: { title: 'Three-role starter kit', note: 'Curated pieces that slot straight into anchor/bridge/utility.', select: (all) => all.filter((p) => p.category === 'jewellery' || p.category === 'footwear').slice(0, 6) },
  },
  {
    id: 'a6', slug: 'festive-budget-playbook', title: 'The ₹3,000 festive playbook: one event, full outfit, zero debt',
    excerpt: 'A complete worked example of building a Diwali-to-wedding-season wardrobe on a hard three-thousand budget, with the exact allocation logic.',
    category: 'Index', readTime: 6, date: '2026-06-27', image: '/images/journal-budget-festive.jpg', tags: ['Budget', 'Capsule', 'Diwali'],
    intro: 'Budget festive dressing fails when it is spent evenly. The winning allocation is barbell: heavy on what photographs and survives (footwear, one anchor piece), light on what is decorative from the waist up (the kurta body), zero on things only you notice (lining thread colour).',
    sections: [
      { heading: 'The 3,000 split', paras: [
        '₹1,100–1,400: the anchor — a cotton-silk or Chanderi saree, or a printed kurta-set in a deep tone. This carries the entire event. ₹700–900: footwear you already own-adjacent (kolhapuri or block heels — buy one, wear both days). ₹300–400: one earring set and one bangle set from a verified seller, gold-plated brass — not fast fashion metal, not real gold, the middle exists. Remainder: emergency — tailoring, petticoat, the spare fall.',
      ] },
      { heading: 'Where budget shows (and does not)', paras: [
        'Shows: fit, pressing, shoe condition, and a bag with a broken clasp. Does not show: thread colour inside the hem, brand tags, the price of the lining fabric. Spend accordingly. Photographers and relatives both care about the drape line, not the label.',
      ] },
      { heading: 'The VIRAAS filter path', paras: [
        'Use the budget tiles on the category pages — Under ₹1,499 for the anchor, Under ₹799 for the support cast. We flag every item\'s last verification date; prices move, so confirm on the retailer page before checkout. If a link reads "affiliate not configured", the retailer button still takes you to the exact product search.',
      ] },
    ],
    rail: { title: 'Everything under ₹1,499 in this season\'s edit', note: 'Budget-first picks, live from the catalog.', select: (all) => all.filter((p) => p.price <= 1499 && p.category !== 'couple-edit').slice(0, 6) },
  },
  {
    id: 'a7', slug: 'the-couple-harmony-rule', title: 'The couple harmony rule: match the palette, not the outfit',
    excerpt: 'Twinning is a costume. Here is the professional styling logic behind the two-shot that makes both people look deliberately dressed.',
    category: 'Styling', readTime: 4, date: '2026-06-13', image: '/images/journal-couple-edit.jpg', tags: ['Couple', 'Festive Party', 'Styling'],
    intro: 'Every couple photograph that ages well runs on one principle: shared colour, separate silhouettes. The eye reads "together" from a 20% colour overlap anywhere in the frame — not from identical fabric. This is why our Couple Edit styles her saree against his stole, not his matching set.',
    sections: [
      { heading: 'The 20% rule', paras: [
        'Pick one colour from the fuller outfit (usually hers) and place it at 20% coverage on him: a pocket square, a stole edge, the inner border of a kurta, a safa pin. If it covers more than a third of his frame, he becomes an accessory. If it is absent, you are two solo photographs standing near each other.',
      ] },
      { heading: 'Contrast and craft echo', paras: [
        'Second move: echo the craft, not the colour. Her chikan kurta and his chikan placket on kurta read as styled; her chikan and his sequin read as two invitations to the same event. One echo maximum per frame.',
      ] },
      { heading: 'Logistics nobody tells couples', paras: [
        'Finish dressing 30 minutes apart, not together — matching schedules produce matching creases, and one of you will need a stitch fixed. Shoot the formal set before the mehendi gets fully dark: henna transfer on ivory silk is the one styling failure that ends in tears. And keep the shoes you will actually dance in visible in the frame — comfort reads as confidence in the last four hours of any event.',
      ] },
    ],
    rail: { title: 'Couple Edit looks', note: 'Already styled to the 20% rule across her/him pieces.', select: byOccasion('Festive Party', 6) },
  },
  {
    id: 'a8', slug: 'indowestern-without-the-costume', title: 'Indo-Western without the costume department',
    excerpt: 'The gap between "fusion" and "fancy dress" is one garment. A sober framework for borrowed-tailoring dressing that passes the airport test.',
    category: 'Styling', readTime: 5, date: '2026-05-30', image: '/images/journal-indo-western.jpg', tags: ['Fusion', 'Everyday', 'Styling'],
    intro: 'Indo-western dressing fails the moment both halves argue. A jacket over a kurta works because the jacket is doing one job: structure. A cape over an anarkali fails because the cape is doing the same job the anarkali is already doing: volume. Fusion is one borrowed garment, not two.',
    sections: [
      { heading: 'The one-borrow rule', paras: [
        'Choose which half of the outfit is borrowed from western tailoring — the jacket, the trouser, the shirt cut — and make the ethnic half unambiguously ethnic: real drape, real weave, regional craft. Two halves at 50/50 read as a rental. Ninety-ten reads as a point of view.',
      ] },
      { heading: 'Fabrics that pass', paras: [
        'Raw mango, linen, and structured cotton-silk hold western cuts without polyester shine. Satin under a jacket reads evening; the same satin as a kurta reads day-event. For daytime Indo-western, choose grain: khadi-blend jackets over chanderi kurtas.',
      ] },
      { heading: 'The airport test', paras: [
        'If you cannot wear the two pieces separately through a full travel day without changing anything, the "fusion" is decorative. Our favourite verified pairings: Nehru-jacket over plain silk kurta (trousers day one, pajama night two), dhoti-skirt over oversized shirt, waistcoat over linen co-ord.',
      ] },
    ],
    rail: { title: 'Fusion pieces that pass the test', note: 'Jackets, draped sets and waistcoats from the edit.', select: (all) => all.filter((p) => p.styleTags.includes('Indo-Western') && p.category !== 'couple-edit').slice(0, 6) },
  },
  {
    id: 'a9', slug: 'silk-vs-silk-grade', title: 'Mulberry, art, cuscen: silk grade decoded before the wedding',
    excerpt: '"Pure silk" is a spectrum with a grading system. What the certification actually guarantees — and when art silk is the smarter buy.',
    category: 'Care', readTime: 7, date: '2026-05-16', image: '/images/journal-saree-drape.jpg', tags: ['Silk', 'Saree', 'Diwali'],
    intro: 'The silk label that matters is not "pure" — it is who tested which metre. Silk Mark guarantees fibre on the fabric body for mulberry silk; zari purity and dyefastness are separate questions, and they are where wedding-season money disappears.',
    sections: [
      { heading: 'Fibre', paras: [
        'Mulberry (the certified one) is smooth, light-reflective, and creases at fold lines. Tussar and wild silks carry texture and read matte; they hide creases but show every stain. Art silk (polyester-silk blends) now weaves so close that you must burn a thread sample to be sure — which is fine, because art silk at ₹2,400 and mulberry at ₹9,000 can be the same outfit decision for different events. The wrong one is paying the mulberry price for the art silk.',
      ] },
      { heading: 'Zari', paras: [
        'Real zari is silver wire plated with gold; test with a loupe at the border edge (plating has a seam under magnification). "Half-fine" is the industry\'s honest middle. Test before buying at wedding prices: the border is where the ₹3,000 difference lives, and where photographs judge you.',
      ] },
      { heading: 'Dye', paras: [
        'Ask for colourfastness. On a wedding saree, wet a hidden inner edge, press white cotton, wait five minutes. A wedding saree is a three-wear lifetime item; a wedding saree you cannot spot-clean because the maroon bleeds is a three-day item.',
      ] },
    ],
    rail: { title: 'Silk-grade pieces in the edit', note: 'Loom-weight picks, mulberry and honest art-silk both flagged in product notes.', select: (all) => all.filter((p) => /silk/i.test(p.fabric) && p.price > 3000).slice(0, 6) },
  },
  {
    id: 'a10', slug: 'monsoon-festive-survival', title: 'Monsoon festive: July pujas, August cousins, September humidity',
    excerpt: 'A practical guide to Indian festive dressing in the worst weather of the year without surrendering the outfit entirely.',
    category: 'Styling', readTime: 4, date: '2026-04-28', image: '/images/occasion-college.jpg', tags: ['Monsoon', 'Everyday', 'Care'],
    intro: 'Half the festive calendar lands in the monsoon, and festive fabrics are allergic to it. The compromise is fibre order: linen and cotton-silk up top, georgette where a saree is mandatory, and nothing below the ankle touching a puddle. Velvet and satin survive the monsoon exactly once — indoors, dry, photographed.',
    sections: [
      { heading: 'Fabric triage', paras: [
        'Monsoon-safe: linen, khadi, cotton-silk, fine chanderi. Risky: georgette (needs the right weight), chiffon, viscose (wrinkles like a promise). Never outdoors: velvet, tissue, raw-mango silk, anything with mirrorwork edges (they snag on wet cotton).',
      ] },
      { heading: 'The emergency kit', paras: [
        'Small umbrella (folding, never plastic — you will meet relatives in a car), anti-chafe balm, two spare pins, a zip bag for shoes, and a roll of toilet paper for wet public washrooms: it doubles as sole-dryer. The kit lives in the potli, which is its other job.',
      ] },
      { heading: 'Arrive-and-repair', paras: [
        'Blow-dry cool on any damp hem before sitting; humidity in a hall sets creases into the fabric for the night. A travel steamer at the hotel beats an iron on a borrowed towel.',
      ] },
    ],
  },
  {
    id: 'a11', slug: 'saree-drapes-regional-map', title: 'A regional map of the six-yard drape — and which one flatters your body, not your feed',
    excerpt: 'Madisar, nauvari, seedha pallu, Gujartha, Bengali: five drapes, five mechanics, one honest fit guide.',
    category: 'Craft', readTime: 8, date: '2026-04-10', image: '/images/journal-saree-drape.jpg', tags: ['Saree', 'Drape', 'Tradition'],
    intro: 'Every regional drape was engineered for a climate, a loom width and a set of tasks. The one that flatters you is usually the one whose mechanics were solving a problem similar to yours.',
    sections: [
      { heading: 'The mechanics', paras: [
        'Madisar (Maharashtra) — nine yards, dhoti-back, structured front: locks for all-day sitting, the only drape that stays locked at a 3pm function. Nauvari — the warrior drape, crotch-height gather; freedom of movement is the point, modesty requires the right petticoat height. Seedha pallu (Gujarat) — front-facing pallu over a tucked choli: designed to be seen from the front, best for people whose drape lives on the camera side. Gujartha/Rajasthani — shorter, heavily pinned, built to move in circles (see also: garba). Bengali — no pleats, two front falls wrapped by hand: reads relaxed, demands a firm blouse to survive wind.',
      ] },
      { heading: 'Choosing by body, not trend', paras: [
        'Short torso: tuck-and-pull the pallu high, the vertical line of the fall is your best asset. Long torso: wider pleat fan at the waist breaks the line without cutting height. Broad shoulders: skip the shoulder-crossed pallu, wear the front-facing Gujartha drape. Straight hips: double pleat for volume, single for a clean fall — both work; the choice is which shoulder you want the photograph to land on.',
      ] },
      { heading: 'The one accessory that fixes everything', paras: [
        'A good petticoat with a tie cord you can re-tighten through the day, and a waistband with a drawstring you can adjust after dinner. Most "my saree kept slipping" problems are a petticoat problem. Buy the petticoat at the saree\'s price tier and the saree itself can be one notch lower.',
      ] },
    ],
    rail: { title: 'Drape-first sarees', note: 'Chosen for fall and hold, with our petticoat notes on each product page.', select: (all) => all.filter((p) => p.category === 'sarees').slice(0, 6) },
  },
  {
    id: 'a12', slug: 'the-jacket-over-kurta-contract', title: 'The jacket-over-kurta contract: what the jacket must do',
    excerpt: 'The single most reliable men\'s festive upgrade, and the four failures that make it look like a rental.',
    category: 'Styling', readTime: 4, date: '2026-03-27', image: '/images/journal-mens-tailoring.jpg', tags: ['Menswear', 'Jacket', 'Fit'],
    intro: 'A Nehru or bandhgala jacket turns any kurta into occasion-wear — provided the jacket does four things the kurta cannot: square the shoulder, close the chest line, hold a lapel pocket\'s worth of intention, and end above the kurta hem by a clean two inches.',
    sections: [
      { heading: 'The four-job test', paras: [
        'Shoulder seam exactly at the bone. No lapel roll (these are collarless by definition; a roll means bad interfacing, return it). The jacket hem must end where the kurta hem is not: mid-thigh kurta needs a hip-length jacket. And the button stance must close the V without pulling: one hand\'s width between sternum and fabric when the top button is fastened, zero gap between buttons.',
      ] },
      { heading: 'Fabric pairings that work', paras: [
        'Brocade or velvet jacket over plain silk kurta — the only combination for a wedding where you are guest-side but photographed. Raw-mango or jacquard jacket over cotton kurta — daytime reception, survives the drive. Never: two textures with equal shine; the jacket disappears into the kurta and both look like fabric.',
      ] },
    ],
    rail: { title: 'Jackets that do the job', note: 'All jacket categories in our men\'s edit, hem-length noted per product.', select: (all) => all.filter((p) => p.category === 'jackets').slice(0, 6) },
  },
  {
    id: 'a13', slug: 'storage-after-the-season', title: 'After the season: store festive fabrics like an archivist, not an optimiser',
    excerpt: 'Festive clothes are worn twelve hours a year and live in a cupboard for eight thousand. The storage rules that decide which ones survive.',
    category: 'Care', readTime: 5, date: '2026-03-12', image: '/images/journal-chikankari.jpg', tags: ['Care', 'Storage', 'Fabrics'],
    intro: 'The enemy is not moths — it is residue. Body oil on a silk border oxidises into a brown ring that appears in the ninth month and cannot be removed. Fold lines under weight emboss permanently into tissue and velvet. Here is the after-season protocol.',
    sections: [
      { heading: 'Clean first, always', paras: [
        'Dry-clean only the pieces with zari and lining (the solvent preserves metallic thread that water ruins); hand-wash chikan and prints. Never store "spot-cleaned" — the spot is where the next stain will anchor.',
      ] },
      { heading: 'Fold, roll and hang decisions', paras: [
        'Hang: anything with more than 400 grams of metal thread (zari sarees, lehengas) — the weight folds into permanent creases; padded hanger, sleeves unsupported. Fold: cottons, linens, chikan (acid-free tissue between folds). Roll: velvet, organza, tissue — rolling destroys no fold lines. Refold every festive season: a crease rotated 90° is a crease that fades.',
      ] },
      { heading: 'The environment', paras: [
        'Cedar, not naphthalene (moth balls react with gold plating). Silica sachets in humid cities. Darkness: sunlight through a cotton bag still bleaches satin over a year. And tassel care — tie a loose cotton thread around the fringe at one-third length before storage; tassels untangle into chaos in the dark.',
      ] },
    ],
  },
  {
    id: 'a14', slug: 'buying-one-bridal-heirloom', title: 'Buying one heirloom: a 45-minute guide to buying your "forever" piece',
    excerpt: 'You do not need five expensive saris. You need one with construction and dye that a daughter will inherit.',
    category: 'Index', readTime: 6, date: '2026-02-26', image: '/images/journal-budget-festive.jpg', tags: ['Heirloom', 'Saree', 'Buying'],
    intro: 'An heirloom is defined by repairability: can a new weaver in 25 years fix it, re-dye it, re-alter the blouse without a fight? That test eliminates ninety percent of the market and tells you exactly where the money goes.',
    sections: [
      { heading: 'The construction checklist', paras: [
        'Handloom borders woven in, not stitched on. A selvedge with a visible 3mm reserve at both edges — that reserve is what a future tailor pays for. Blouse fabric included as a full metre of the body fabric, not a "matching" synthetic. And the pallu border must continue around the fall — borders that stop at the hem are production shortcuts.',
      ] },
      { heading: 'Where to spend first', paras: [
        'Within one budget tier: weave density over dyework, dyefastness over motif count, natural fibre over blend. A plain-body Kanchipuram with a real gold-test border outlives a heavily printed imitation in every dimension that matters at a wedding you did not plan.',
      ] },
      { heading: 'The 45-minute test', paras: [
        'In the shop, spend: 10 minutes on the reverse (floats, knots, thread ends longer than 4mm mean rushed weaving); 10 minutes burn-asking for a sample thread (real silk smells of hair, polyester melts into a bead); 10 minutes wet-cotton colourfast check; 15 minutes in the lighting of the venue where you will actually wear it. If the vendor refuses any one of these, walk.',
      ] },
    ],
    rail: { title: 'Built to be inherited', note: 'Heirloom-grade weaves in our edit with full construction notes.', select: (all) => all.filter((p) => /Banarasi|Kanchipuram|Mulberry|Tissue/.test([p.embroidery, p.pattern, p.weave, p.fabric].join(' '))).slice(0, 6) },
  },
  {
    id: 'a15', slug: 'first-wedding-guest-manual', title: 'The first wedding guest manual: your own wedding, your friends\' season, the family circuit',
    excerpt: 'A decision tree for the twenties — what one wedding, one reception and one sangeet budget should actually buy.',
    category: 'Index', readTime: 5, date: '2026-02-09', image: '/images/occasion-college.jpg', tags: ['College', 'Budget', 'Festive Party'],
    intro: 'In your twenties a wedding season is six events, three cities and one salary instalment. The strategy is a capsule with one luxury: three outfits that mix across day and night, and one investment piece everyone will remember.',
    sections: [
      { heading: 'The capsule', paras: [
        'One deep-tone base (wine or emerald) in a breathable weave that works at a 2pm reception and an 8pm dinner. One light tone (ivory, sage, peach) that photographs in daylight. One pre-draped or co-ord "fast morning" number for the third event. Two pairs of shoes maximum, both worn in before the season, both in the same colour family so a scuffed pair can be swapped invisibly in photographs.',
      ] },
      { heading: 'The one luxury', paras: [
        'Put the extra in earrings and one bag. Metal near the face and leather in the hand are the two places relatives and the camera both look. The ₹800 upgrade to a kurta is invisible at scale; the ₹2,000 potli and jhumka set changes every photograph.',
      ] },
      { heading: 'The sharing layer', paras: [
        'Stoles, belts, maang tikkas and watch straps: borrow from family, swap with friends, return with a thank-you and a dry-clean receipt. The community owns more wardrobe than any individual does, and it costs your friendships nothing.',
      ] },
    ],
    rail: { title: 'Under-₹2,999 capsule picks', note: 'The entire first-wedding-season outfit at once.', select: (all) => all.filter((p) => p.price <= 2999 && p.gender === 'women' && p.category !== 'couple-edit').slice(0, 6) },
  },
  {
    id: 'a16', slug: 'saree-peticoat-science', title: 'Petticoat science: the garment that decides whether your saree falls or flatters',
    excerpt: 'Pleat hold, hem depth, cord width and the two measurements that make or break a drape — the unglamorous layer explained.',
    category: 'Styling', readTime: 5, date: '2026-01-22', image: '/images/journal-accessory-styling.jpg', tags: ['Saree', 'Basics', 'Fit'],
    intro: 'Nobody photographs a petticoat and nobody thanks one, but in the drape chain it is the load-bearing wall. The saree borrows its vertical line entirely from what happens six centimetres below your navel.',
    sections: [
      { heading: 'Hem architecture', paras: [
        'The petticoat should end 1cm above the saree hem at the back and 3cm below at the front only if you are on heels — never equal all round, that reads like a skirt. The cord at the waist needs 2.5cm width minimum; thin cords cut and roll and force you to re-pleat hourly. Inside the cord, if it is bare twine, thread a 6-inch elastic loop through it as a tensioner.',
      ] },
      { heading: 'Fabric and structure', paras: [
        'Matte cotton for georgette/chiffon; satin for silk and velvet; organza-line for sheer sarees so light does not read through. For any pre-draped piece: check whether it has its own inner band — a stitched inner waistband means you are not wearing a petticoat, you are wearing a costume, and it will move like one under a saree.',
      ] },
      { heading: 'Colour politics', paras: [
        'Contrast, never match: an ivory-toned petticoat under a deep saree creates the visible hem-lighten effect that makes the border read as intentional. A matching one turns the saree into a floor-length top. With sheer organza or net, the colour is a design decision — tone it against your skin or the saree, never the background.',
      ] },
    ],
  },
]

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug)
export const articleRail = (a: Article): Product[] =>
  a.rail ? a.rail.select(products).filter((p) => p.category !== 'couple-edit') : []
