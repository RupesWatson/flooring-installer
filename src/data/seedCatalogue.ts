/**
 * Seed catalogue — ~500 representative UK flooring products.
 * Prices are typical UK trade/retail market rates (pence).
 * Based on publicly known brand ranges; update prices as needed.
 */
import type { Material, MaterialType } from '../domain/materials'

type SeedMaterial = Omit<Material, 'id'>

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Roll good priced per linear metre (carpet, vinyl roll, roll underlay) */
function roll(
  make: string, range: string, sku: string,
  rollWidthMm: number, pricePerLinM: number,
  supplier: string, notes: string,
  type: MaterialType = 'carpet',
): SeedMaterial {
  return {
    make, range, sku, type,
    sellingFormat: 'roll',
    rollWidthMm,
    unitPricePence: Math.round(pricePerLinM * 100),
    priceUnit: 'per_linear_m',
    supplier, notes,
  }
}

/** Pack good (laminate, LVT, engineered wood) */
function pack(
  make: string, range: string, sku: string,
  coveragePerPackM2: number, pricePerPack: number,
  supplier: string, notes: string,
  type: MaterialType = 'laminate',
): SeedMaterial {
  return {
    make, range, sku, type,
    sellingFormat: 'pack',
    coveragePerPackM2,
    unitPricePence: Math.round(pricePerPack * 100),
    priceUnit: 'per_pack',
    supplier, notes,
  }
}

/** Area good priced per m² (some tiles, prep products) */
function area(
  make: string, range: string, sku: string,
  pricePerM2: number, supplier: string, notes: string,
  type: MaterialType = 'underlay',
): SeedMaterial {
  return {
    make, range, sku, type,
    sellingFormat: 'area',
    unitPricePence: Math.round(pricePerM2 * 100),
    priceUnit: 'per_m2',
    supplier, notes,
  }
}

/** Linear good priced per metre (gripper rod, beading) */
function linear(
  make: string, range: string, sku: string,
  pricePerM: number, supplier: string, notes: string,
): SeedMaterial {
  return {
    make, range, sku, type: 'accessory',
    sellingFormat: 'linear',
    unitPricePence: Math.round(pricePerM * 100),
    priceUnit: 'per_linear_m',
    supplier, notes,
  }
}

/** Per-unit accessory */
function unit(
  make: string, range: string, sku: string,
  priceEach: number, supplier: string, notes: string,
): SeedMaterial {
  return {
    make, range, sku, type: 'accessory',
    sellingFormat: 'unit',
    unitPricePence: Math.round(priceEach * 100),
    priceUnit: 'per_unit',
    supplier, notes,
  }
}

// ─── CARPET (roll goods, priced per linear metre) ─────────────────────────────
// Price per lin m = price per m² × roll width in metres

const CARPETS: SeedMaterial[] = [
  // Cormar Carpets — very popular mid-market UK brand
  roll('Cormar', 'Sensation Natural', 'COR-SEN-NAT-4', 4000, 28.00, 'Cormar Carpets', 'Natural beige, 40oz twist pile, 100% polypropylene, stain resistant'),
  roll('Cormar', 'Sensation Silver', 'COR-SEN-SIL-4', 4000, 28.00, 'Cormar Carpets', 'Silver grey, 40oz twist pile, 100% polypropylene'),
  roll('Cormar', 'Sensation Slate', 'COR-SEN-SLA-4', 4000, 28.00, 'Cormar Carpets', 'Dark slate grey, 40oz twist pile, 100% polypropylene'),
  roll('Cormar', 'Sensation Linen', 'COR-SEN-LIN-4', 4000, 28.00, 'Cormar Carpets', 'Warm linen tone, 40oz twist pile, 100% polypropylene'),
  roll('Cormar', 'Sensation Ivory', 'COR-SEN-IVO-4', 4000, 28.00, 'Cormar Carpets', 'Ivory white, 40oz twist pile, 100% polypropylene'),
  roll('Cormar', 'Primo Comfort Natural', 'COR-PRC-NAT-4', 4000, 36.00, 'Cormar Carpets', 'Natural, 50oz compact twist, 100% polypropylene, extra dense'),
  roll('Cormar', 'Primo Comfort Silver', 'COR-PRC-SIL-4', 4000, 36.00, 'Cormar Carpets', 'Silver, 50oz compact twist, easy clean'),
  roll('Cormar', 'Primo Comfort Cream', 'COR-PRC-CRE-4', 4000, 36.00, 'Cormar Carpets', 'Cream, 50oz compact twist, 100% polypropylene'),
  roll('Cormar', 'Triumph Heather', 'COR-TRI-HEA-4', 4000, 56.00, 'Cormar Carpets', '80% wool 20% nylon, heather, mid-weight twist'),
  roll('Cormar', 'Triumph Natural', 'COR-TRI-NAT-4', 4000, 56.00, 'Cormar Carpets', '80% wool 20% nylon, natural, mid-weight twist'),
  roll('Cormar', 'Triumph Oatmeal', 'COR-TRI-OAT-4', 4000, 56.00, 'Cormar Carpets', '80% wool 20% nylon, oatmeal, mid-weight twist'),
  roll('Cormar', 'Triumph Parchment', 'COR-TRI-PAR-4', 4000, 56.00, 'Cormar Carpets', '80% wool 20% nylon, warm parchment'),
  roll('Cormar', 'Moorland Heathers Autumn', 'COR-MOO-AUT-4', 4000, 48.00, 'Cormar Carpets', 'Autumn tones, berber loop pile, 100% polypropylene'),
  roll('Cormar', 'Moorland Heathers Sage', 'COR-MOO-SAG-4', 4000, 48.00, 'Cormar Carpets', 'Sage green, berber loop, stain resistant'),
  roll('Cormar', 'Moorland Heathers Winter', 'COR-MOO-WIN-4', 4000, 48.00, 'Cormar Carpets', 'Winter white/grey mix, berber loop pile'),
  roll('Cormar', 'New Woodland Beech', 'COR-NWO-BEE-4', 4000, 44.00, 'Cormar Carpets', 'Beech tones, cut & loop, 80/20 wool blend'),
  roll('Cormar', 'New Woodland Birch', 'COR-NWO-BIR-4', 4000, 44.00, 'Cormar Carpets', 'Birch, cut & loop, natural tones'),
  roll('Cormar', 'Inglewood Natural', 'COR-ING-NAT-4', 4000, 52.00, 'Cormar Carpets', 'Natural jute back, sisal-look, loop pile'),
  roll('Cormar', 'Select Heathers Lavender', 'COR-SEL-LAV-4', 4000, 40.00, 'Cormar Carpets', 'Lavender heather, mid-weight twist, PP'),

  // Westex Carpets
  roll('Westex', 'Urban Retreat 50 Pebble', 'WES-UR50-PEB-4', 4000, 72.00, 'Westex Carpets', '80/20 wool, pebble, 50oz luxury twist'),
  roll('Westex', 'Urban Retreat 50 Stone', 'WES-UR50-STO-4', 4000, 72.00, 'Westex Carpets', '80/20 wool, stone, 50oz luxury twist'),
  roll('Westex', 'Urban Retreat 50 Slate', 'WES-UR50-SLA-4', 4000, 72.00, 'Westex Carpets', '80/20 wool, slate, 50oz luxury twist'),
  roll('Westex', 'Urban Retreat 50 Chalk', 'WES-UR50-CHA-4', 4000, 72.00, 'Westex Carpets', '80/20 wool, chalk white, 50oz luxury twist'),
  roll('Westex', 'Urban Retreat 50 Driftwood', 'WES-UR50-DRI-4', 4000, 72.00, 'Westex Carpets', '80/20 wool, driftwood, 50oz luxury twist'),
  roll('Westex', 'Luxury Velvet Champagne', 'WES-LUV-CHA-4', 4000, 96.00, 'Westex Carpets', '100% wool velvet, champagne, smooth cut pile'),
  roll('Westex', 'Luxury Velvet Dove', 'WES-LUV-DOV-4', 4000, 96.00, 'Westex Carpets', '100% wool velvet, dove grey, smooth cut pile'),
  roll('Westex', 'Ultimate Velvet Silver', 'WES-ULV-SIL-4', 4000, 108.00, 'Westex Carpets', '100% extra-fine wool, silver, ultimate velvet'),
  roll('Westex', 'Ultimate Velvet Ivory', 'WES-ULV-IVO-4', 4000, 108.00, 'Westex Carpets', '100% extra-fine wool, ivory, deep pile velvet'),

  // Victoria Carpets
  roll('Victoria', 'Timeless Twist Barley', 'VIC-TT-BAR-4', 4000, 48.00, 'Victoria Carpets', 'Barley, 80/20 wool twist, mid-weight 40oz'),
  roll('Victoria', 'Timeless Twist Biscuit', 'VIC-TT-BIS-4', 4000, 48.00, 'Victoria Carpets', 'Biscuit, 80/20 wool twist'),
  roll('Victoria', 'Timeless Twist Stone', 'VIC-TT-STO-4', 4000, 48.00, 'Victoria Carpets', 'Stone, 80/20 wool twist, 40oz'),
  roll('Victoria', 'Endurance Plus Latte', 'VIC-EP-LAT-4', 4000, 32.00, 'Victoria Carpets', 'Latte, polypropylene, stain-defend technology'),
  roll('Victoria', 'Endurance Plus Fog', 'VIC-EP-FOG-4', 4000, 32.00, 'Victoria Carpets', 'Fog grey, PP, stain-defend technology'),
  roll('Victoria', 'Endurance Plus Cream', 'VIC-EP-CRE-4', 4000, 32.00, 'Victoria Carpets', 'Cream, PP, heavily stain resistant'),

  // Adam Carpets
  roll('Adam', 'Connoisseur Twist Ivory', 'ADA-CNT-IVO-4', 4000, 64.00, 'Adam Carpets', 'Ivory, 80/20 wool twist, 40oz premium twist pile'),
  roll('Adam', 'Connoisseur Twist Champagne', 'ADA-CNT-CHA-4', 4000, 64.00, 'Adam Carpets', 'Champagne, 80/20 wool twist, 40oz'),
  roll('Adam', 'Connoisseur Twist Barley', 'ADA-CNT-BAR-4', 4000, 64.00, 'Adam Carpets', 'Barley, 80/20 wool twist, 40oz'),
  roll('Adam', 'Royal Berber Natural', 'ADA-RBE-NAT-5', 5000, 75.00, 'Adam Carpets', 'Natural, chunky berber loop, 5m wide roll, 100% wool'),
  roll('Adam', 'Royal Berber Linen', 'ADA-RBE-LIN-5', 5000, 75.00, 'Adam Carpets', 'Linen, chunky berber loop, 5m wide, 100% wool'),

  // Penthouse Carpets
  roll('Penthouse', 'Suite Success Platinum', 'PEN-SS-PLA-4', 4000, 88.00, 'Penthouse Carpets', 'Platinum, 100% nylon plush velvet, stain master'),
  roll('Penthouse', 'Suite Success Bisque', 'PEN-SS-BIS-4', 4000, 88.00, 'Penthouse Carpets', 'Bisque, plush velvet, stain master technology'),
  roll('Penthouse', 'Suite Success Pewter', 'PEN-SS-PEW-4', 4000, 88.00, 'Penthouse Carpets', 'Pewter grey, plush velvet, nylon'),
  roll('Penthouse', 'Glamour Champagne', 'PEN-GLA-CHA-4', 4000, 100.00, 'Penthouse Carpets', 'Champagne, extra deep pile velvet, 100% nylon'),
  roll('Penthouse', 'Glamour Silver', 'PEN-GLA-SIL-4', 4000, 100.00, 'Penthouse Carpets', 'Silver, extra deep pile velvet, 100% nylon'),

  // Brockway Carpets
  roll('Brockway', 'Lakeland Tweeds Autumn', 'BRO-LT-AUT-4', 4000, 52.00, 'Brockway Carpets', 'Autumn tones, loop pile, 100% wool'),
  roll('Brockway', 'Lakeland Tweeds Slate', 'BRO-LT-SLA-4', 4000, 52.00, 'Brockway Carpets', 'Slate grey, loop pile, 100% wool'),
  roll('Brockway', 'Lakeland Tweeds Natural', 'BRO-LT-NAT-4', 4000, 52.00, 'Brockway Carpets', 'Natural, loop pile, 100% wool blend'),
  roll('Brockway', 'Corrieshalloch Heather', 'BRO-COR-HEA-4', 4000, 60.00, 'Brockway Carpets', 'Heather, 80/20 wool loop, Scottish inspired'),
  roll('Brockway', 'Corrieshalloch Moorland', 'BRO-COR-MOO-4', 4000, 60.00, 'Brockway Carpets', 'Moorland green/brown mix, 80/20 wool loop'),

  // Ulster Carpets
  roll('Ulster', 'Grange Natural', 'ULS-GRA-NAT-4', 4000, 80.00, 'Ulster Carpets', 'Natural, hand-tufted Axminster woven, 80% wool'),
  roll('Ulster', 'Grange Oatmeal', 'ULS-GRA-OAT-4', 4000, 80.00, 'Ulster Carpets', 'Oatmeal, Axminster woven, 80% wool'),
  roll('Ulster', 'Dreams Silver', 'ULS-DRE-SIL-4', 4000, 56.00, 'Ulster Carpets', 'Silver, tufted twist, 80/20 wool/nylon'),
  roll('Ulster', 'Dreams Barley', 'ULS-DRE-BAR-4', 4000, 56.00, 'Ulster Carpets', 'Barley, tufted twist, 80/20 wool/nylon'),

  // Brintons (premium woven carpets)
  roll('Brintons', 'Bell Twist Platinum', 'BRI-BT-PLA-4', 4000, 92.00, 'Brintons', '80% wool, platinum, woven twist pile'),
  roll('Brintons', 'Bell Twist Ivory', 'BRI-BT-IVO-4', 4000, 92.00, 'Brintons', '80% wool, ivory, woven twist pile'),
  roll('Brintons', 'Bell Twist Alabaster', 'BRI-BT-ALA-4', 4000, 92.00, 'Brintons', '80% wool, alabaster, woven twist pile'),
  roll('Brintons', 'Fresco Textures Stone', 'BRI-FT-STO-4', 4000, 88.00, 'Brintons', 'Stone, textured loop, 80% wool'),
  roll('Brintons', 'Fresco Textures Parchment', 'BRI-FT-PAR-4', 4000, 88.00, 'Brintons', 'Parchment, textured loop, 80% wool'),
  roll('Brintons', 'Pure Living Natural', 'BRI-PL-NAT-4', 4000, 76.00, 'Brintons', '100% wool, natural, Berber loop, undyed'),

  // Kersaint Cobb
  roll('Kersaint Cobb', 'Espace Beige', 'KER-ESP-BEI-4', 4000, 36.00, 'Kersaint Cobb', 'Beige, 100% polypropylene twist, easy clean'),
  roll('Kersaint Cobb', 'Espace Pearl', 'KER-ESP-PEA-4', 4000, 36.00, 'Kersaint Cobb', 'Pearl grey, polypropylene twist'),
  roll('Kersaint Cobb', 'Palazzo Silver', 'KER-PAL-SIL-4', 4000, 44.00, 'Kersaint Cobb', 'Silver, luxury polypropylene velvet'),
  roll('Kersaint Cobb', 'Palazzo Mink', 'KER-PAL-MIN-4', 4000, 44.00, 'Kersaint Cobb', 'Mink brown, luxury polypropylene velvet'),

  // Lifestyle Floors
  roll('Lifestyle', 'Dreamfields Beige', 'LIF-DF-BEI-4', 4000, 28.00, 'Lifestyle Floors', 'Beige, action back, polypropylene, budget range'),
  roll('Lifestyle', 'Dreamfields Grey', 'LIF-DF-GRE-4', 4000, 28.00, 'Lifestyle Floors', 'Grey, action back, polypropylene'),
  roll('Lifestyle', 'Heritage Twist Natural', 'LIF-HT-NAT-4', 4000, 48.00, 'Lifestyle Floors', 'Natural, 80/20 wool, heritage twist'),
  roll('Lifestyle', 'Heritage Twist Stone', 'LIF-HT-STO-4', 4000, 48.00, 'Lifestyle Floors', 'Stone, 80/20 wool, heritage twist pile'),

  // Generic / own-brand budget carpet
  roll('Flooring Direct', 'Budget Twist Natural', 'FD-BT-NAT-4', 4000, 16.00, 'Flooring Direct', 'Natural, budget polypropylene twist, foam back'),
  roll('Flooring Direct', 'Budget Twist Beige', 'FD-BT-BEI-4', 4000, 16.00, 'Flooring Direct', 'Beige, budget polypropylene, foam back'),
  roll('Flooring Direct', 'Budget Twist Grey', 'FD-BT-GRE-4', 4000, 16.00, 'Flooring Direct', 'Grey, budget polypropylene, foam back'),
  roll('Flooring Direct', 'Value Loop Natural', 'FD-VL-NAT-4', 4000, 12.00, 'Flooring Direct', 'Natural, value loop pile, foam back, polypropylene'),
  roll('Flooring Direct', 'Value Loop Berber', 'FD-VL-BER-4', 4000, 14.00, 'Flooring Direct', 'Berber fleck, value loop pile, foam back'),

  // Stairs / specialist
  roll('Cormar', 'Sensation Natural (Stair Runner)', 'COR-SEN-NAT-S4', 4000, 28.00, 'Cormar Carpets', 'Natural, 40oz twist, suitable for stairs, polypropylene'),
  roll('Westex', 'Urban Retreat 50 Pebble (Stair)', 'WES-UR50-PEB-S4', 4000, 72.00, 'Westex Carpets', 'Pebble, 80/20 wool twist, stair runner width available'),
  roll('Adam', 'Connoisseur Twist Champagne (5m)', 'ADA-CNT-CHA-5', 5000, 80.00, 'Adam Carpets', 'Champagne, 80/20 wool twist, 5m wide roll for large rooms'),
  roll('Cormar', 'Triumph Heather (5m)', 'COR-TRI-HEA-5', 5000, 70.00, 'Cormar Carpets', 'Heather, 80/20 wool twist, 5m wide roll'),
]

// ─── VINYL ROLL ────────────────────────────────────────────────────────────────

const VINYL_ROLL: SeedMaterial[] = [
  // Beauflor — popular budget-mid vinyl
  roll('Beauflor', 'Maverick Tile Honey Oak', 'BEA-MAV-HOA-4', 4000, 18.00, 'Beauflor', 'Honey oak tile pattern, 2mm total, domestic warranty, 4m wide', 'vinyl'),
  roll('Beauflor', 'Maverick Tile White Oak', 'BEA-MAV-WOA-4', 4000, 18.00, 'Beauflor', 'White oak tile, 2mm, easy clean surface, 4m wide', 'vinyl'),
  roll('Beauflor', 'Maverick Stone Grey', 'BEA-MAV-SGR-4', 4000, 18.00, 'Beauflor', 'Grey stone effect, 2mm, waterproof, 4m wide', 'vinyl'),
  roll('Beauflor', 'Maverick Concrete Light', 'BEA-MAV-COL-4', 4000, 18.00, 'Beauflor', 'Light concrete effect, 2mm, modern look', 'vinyl'),
  roll('Beauflor', 'Maverick Light Oak', 'BEA-MAV-LOA-3', 3000, 13.50, 'Beauflor', 'Light oak plank effect, 2mm, 3m wide roll', 'vinyl'),
  roll('Beauflor', 'Vinyl One Nordic Oak', 'BEA-V1-NOA-4', 4000, 24.00, 'Beauflor', 'Nordic oak plank, 2.5mm, R9 slip resistant, 4m wide', 'vinyl'),
  roll('Beauflor', 'Vinyl One Smoked Oak', 'BEA-V1-SOA-4', 4000, 24.00, 'Beauflor', 'Smoked oak plank, 2.5mm, R9 slip resistant', 'vinyl'),
  roll('Beauflor', 'Vinyl One Warm Grey Stone', 'BEA-V1-WGS-4', 4000, 24.00, 'Beauflor', 'Warm grey stone, 2.5mm, textured surface, 4m wide', 'vinyl'),
  roll('Beauflor', 'Pure Rigid Vinyl Chalk Oak', 'BEA-PRV-COA-4', 4000, 28.00, 'Beauflor', 'Chalk oak, 2.8mm, pure vinyl, textured emboss', 'vinyl'),

  // Gerflor
  roll('Gerflor', 'Taralay Initial Natural Oak', 'GER-TI-NOA-4', 4000, 22.00, 'Gerflor', 'Natural oak, 2mm, semi-commercial grade, 4m wide', 'vinyl'),
  roll('Gerflor', 'Taralay Initial Light Stone', 'GER-TI-LST-4', 4000, 22.00, 'Gerflor', 'Light stone, 2mm, Protecsol surface treatment', 'vinyl'),
  roll('Gerflor', 'Taralay Initial Dark Oak', 'GER-TI-DOA-4', 4000, 22.00, 'Gerflor', 'Dark oak, 2mm, commercial/domestic', 'vinyl'),
  roll('Gerflor', 'Taralay Impression Light Maple', 'GER-TIM-LMA-4', 4000, 32.00, 'Gerflor', 'Light maple, 3.7mm, heavy domestic/light commercial', 'vinyl'),
  roll('Gerflor', 'Taralay Impression Cool Grey', 'GER-TIM-CGR-4', 4000, 32.00, 'Gerflor', 'Cool grey stone, 3.7mm, heavy domestic', 'vinyl'),

  // Polyflor
  roll('Polyflor', 'Camaro Loc Burnished Oak', 'POL-CAM-BOA-4', 4000, 26.00, 'Polyflor', 'Burnished oak, 2mm, Camaro range, 4m wide', 'vinyl'),
  roll('Polyflor', 'Camaro Loc White Limed Oak', 'POL-CAM-WLO-4', 4000, 26.00, 'Polyflor', 'White limed oak, 2mm, easy clean, 4m wide', 'vinyl'),
  roll('Polyflor', 'Camaro Loc Portland Stone', 'POL-CAM-PST-4', 4000, 26.00, 'Polyflor', 'Portland stone, 2mm, stone effect, 4m wide', 'vinyl'),
  roll('Polyflor', 'Expona Domestic Light Limed Oak', 'POL-EXP-LLO-3', 3000, 19.50, 'Polyflor', 'Light limed oak, 2mm, 3m wide roll, domestic', 'vinyl'),

  // Lifestyle Floors
  roll('Lifestyle', 'Stanford Light Oak', 'LIF-STA-LOA-4', 4000, 20.00, 'Lifestyle Floors', 'Light oak plank, 2mm, cushion back, 4m wide', 'vinyl'),
  roll('Lifestyle', 'Stanford Grey Stone', 'LIF-STA-GST-4', 4000, 20.00, 'Lifestyle Floors', 'Grey stone tile, 2mm, cushion back, 4m wide', 'vinyl'),
  roll('Lifestyle', 'Stanford White Oak', 'LIF-STA-WOA-4', 4000, 20.00, 'Lifestyle Floors', 'White oak plank, 2mm, practical and durable', 'vinyl'),
  roll('Lifestyle', 'Stanford Natural Stone', 'LIF-STA-NST-2', 2000, 10.00, 'Lifestyle Floors', 'Natural stone, 2mm, 2m wide for bathrooms/kitchens', 'vinyl'),

  // Budget vinyl
  roll('Flooring Direct', 'Essential Light Oak', 'FD-ESS-LOA-4', 4000, 12.00, 'Flooring Direct', 'Light oak, 1.5mm, cushion back, budget range, 4m wide', 'vinyl'),
  roll('Flooring Direct', 'Essential Grey Stone', 'FD-ESS-GST-4', 4000, 12.00, 'Flooring Direct', 'Grey stone, 1.5mm, cushion back, budget', 'vinyl'),
  roll('Flooring Direct', 'Essential Natural Oak', 'FD-ESS-NOA-3', 3000, 9.00, 'Flooring Direct', 'Natural oak, 1.5mm, cushion back, 3m wide', 'vinyl'),
]

// ─── LVT / LUXURY VINYL TILE (click or gluedown packs) ───────────────────────

const LVT: SeedMaterial[] = [
  // Karndean — market leader premium LVT
  pack('Karndean', 'Van Gogh Mid Limed Oak', 'KAR-VG-MLO', 3.34, 79.00, 'Karndean', 'Mid limed oak, 2.5mm wear layer, K-Guard+ finish, 3.34m²/box'),
  pack('Karndean', 'Van Gogh White Painted Oak', 'KAR-VG-WPO', 3.34, 85.00, 'Karndean', 'White painted oak, 2.5mm wear layer, K-Guard+ surface finish'),
  pack('Karndean', 'Van Gogh Blond Oak', 'KAR-VG-BOA', 3.34, 79.00, 'Karndean', 'Blond oak, warm blonde tones, 2.5mm wear layer'),
  pack('Karndean', 'Van Gogh Reclaimed Oak', 'KAR-VG-ROA', 3.34, 82.00, 'Karndean', 'Reclaimed oak, rustic character, 2.5mm wear layer'),
  pack('Karndean', 'Van Gogh Aged Oak', 'KAR-VG-AOA', 3.34, 82.00, 'Karndean', 'Aged/distressed oak look, 2.5mm wear layer, realistic emboss'),
  pack('Karndean', 'Van Gogh Fumed Oak', 'KAR-VG-FOA', 3.34, 85.00, 'Karndean', 'Fumed dark oak, contemporary, 2.5mm wear layer'),
  pack('Karndean', 'Korlok Reserve Limed Grey Oak', 'KAR-KOR-LGO', 2.21, 92.00, 'Karndean', 'Limed grey oak, rigid core, 6mm, 2.21m²/box'),
  pack('Karndean', 'Korlok Reserve Warm Limed Oak', 'KAR-KOR-WLO', 2.21, 92.00, 'Karndean', 'Warm limed oak, rigid core, 6mm total thickness'),
  pack('Karndean', 'Korlok Reserve Pale Limed Oak', 'KAR-KOR-PLO', 2.21, 92.00, 'Karndean', 'Pale limed oak, Korlok rigid core, 6mm'),
  pack('Karndean', 'Knight Tile Pale Limed Oak', 'KAR-KT-PLO', 1.86, 56.00, 'Karndean', 'Pale limed oak, gluedown, 2mm wear layer, 1.86m²/box'),
  pack('Karndean', 'Knight Tile Mid Grey Oak', 'KAR-KT-MGO', 1.86, 56.00, 'Karndean', 'Mid grey oak, gluedown, 2mm wear layer'),
  pack('Karndean', 'Knight Tile Portland Stone', 'KAR-KT-PST', 1.86, 58.00, 'Karndean', 'Portland stone tile, gluedown, 2mm wear layer'),
  pack('Karndean', 'Knight Tile Bone', 'KAR-KT-BON', 1.86, 58.00, 'Karndean', 'Bone white stone, gluedown LVT, 2mm wear layer'),
  pack('Karndean', 'Palio Clic Vecchio', 'KAR-PAL-VEC', 2.09, 44.00, 'Karndean', 'Vecchio mid oak, Palio click, 4.5mm rigid, 2.09m²/box'),
  pack('Karndean', 'Palio Clic Arezzo', 'KAR-PAL-ARE', 2.09, 44.00, 'Karndean', 'Arezzo stone tile, Palio click, 4.5mm rigid'),
  pack('Karndean', 'Palio Clic Valmora', 'KAR-PAL-VAL', 2.09, 44.00, 'Karndean', 'Valmora pale wood, Palio click, 4.5mm rigid'),

  // Amtico — premium LVT
  pack('Amtico', 'Signature Abstract White Ash', 'AMT-SIG-WAH', 3.26, 104.00, 'Amtico', 'White ash, gluedown, 0.55mm wear layer, 3.26m²/box'),
  pack('Amtico', 'Signature Natural Oak', 'AMT-SIG-NOA', 3.26, 104.00, 'Amtico', 'Natural oak, 0.55mm wear layer, gluedown LVT'),
  pack('Amtico', 'Signature Worn Oak', 'AMT-SIG-WOA', 3.26, 104.00, 'Amtico', 'Worn oak character plank, 0.55mm wear layer'),
  pack('Amtico', 'Signature Pale Ash', 'AMT-SIG-PAH', 3.26, 104.00, 'Amtico', 'Pale ash, light contemporary, 0.55mm wear layer'),
  pack('Amtico', 'Spacia Natural Oak', 'AMT-SPC-NOA', 3.26, 72.00, 'Amtico', 'Natural oak, Spacia range, 0.55mm wear layer, 3.26m²/box'),
  pack('Amtico', 'Spacia Rigid Blonde Oak', 'AMT-SPCR-BOA', 2.23, 82.00, 'Amtico', 'Blonde oak, Spacia Rigid Core, 6mm, 2.23m²/box'),
  pack('Amtico', 'Spacia Stone Portland', 'AMT-SPC-SPO', 3.26, 76.00, 'Amtico', 'Portland stone, Spacia gluedown, cool grey tones'),
  pack('Amtico', 'Form Washed Oak', 'AMT-FRM-WAO', 2.00, 88.00, 'Amtico', 'Washed oak, Form range gluedown, 0.7mm wear layer'),

  // Moduleo
  pack('Moduleo', 'Select Brio Dryback Classic Oak', 'MOD-SBD-COA', 3.62, 49.00, 'Moduleo', 'Classic oak, Select dry back glue down, 0.55mm wear, 3.62m²/box'),
  pack('Moduleo', 'Select Brio Dryback Country Oak', 'MOD-SBD-CRO', 3.62, 49.00, 'Moduleo', 'Country oak, dry back, 0.55mm wear layer'),
  pack('Moduleo', 'Select Brio Dryback Antique Oak', 'MOD-SBD-ANO', 3.62, 52.00, 'Moduleo', 'Antique oak, dry back LVT, 0.55mm wear layer'),
  pack('Moduleo', 'LayRed 55 Classic Oak', 'MOD-LR55-COA', 2.05, 58.00, 'Moduleo', 'Classic oak, click LVT, 2.5mm wear layer, 2.05m²/box'),
  pack('Moduleo', 'LayRed 55 Country Oak', 'MOD-LR55-CRO', 2.05, 58.00, 'Moduleo', 'Country oak, click, 2.5mm wear layer'),
  pack('Moduleo', 'LayRed 55 Midland Oak', 'MOD-LR55-MID', 2.05, 62.00, 'Moduleo', 'Midland oak grey, click LVT, 2.5mm wear layer'),
  pack('Moduleo', 'Transform Dryback Classic Oak 24842', 'MOD-TRD-COA', 3.62, 55.00, 'Moduleo', 'Classic oak, Transform dry back, 0.55mm wear layer'),
  pack('Moduleo', 'Transform Click Baltic Maple', 'MOD-TRC-BMA', 2.32, 64.00, 'Moduleo', 'Baltic maple, click, 2.5mm wear, 2.32m²/box'),

  // Polyflor Camaro
  pack('Polyflor', 'Camaro Loc Portland Stone', 'POL-CLO-PST', 3.34, 42.00, 'Polyflor', 'Portland stone, click, 4mm total, 0.3mm wear, 3.34m²/box', 'lvt'),
  pack('Polyflor', 'Camaro Loc White Limed Oak', 'POL-CLO-WLO', 3.34, 42.00, 'Polyflor', 'White limed oak, Camaro Loc click, 4mm', 'lvt'),
  pack('Polyflor', 'Camaro Loc Burnished Oak', 'POL-CLO-BOA', 3.34, 42.00, 'Polyflor', 'Burnished oak, click LVT, 4mm', 'lvt'),
  pack('Polyflor', 'Expona Domestic Light Maple', 'POL-EXD-LMA', 3.34, 38.00, 'Polyflor', 'Light maple, Expona domestic, glue down LVT', 'lvt'),

  // Beauflor LVT
  pack('Beauflor', 'Pure Stone Concrete Medium Grey', 'BEA-PST-CMG', 1.85, 36.00, 'Beauflor', 'Concrete medium grey, rigid LVT, 5mm, 1.85m²/box', 'lvt'),
  pack('Beauflor', 'Pure Wood Honey Oak', 'BEA-PWO-HOA', 1.85, 38.00, 'Beauflor', 'Honey oak, rigid core LVT click, 5mm, 1.85m²/box', 'lvt'),
  pack('Beauflor', 'Pure Wood White Oak', 'BEA-PWO-WOA', 1.85, 38.00, 'Beauflor', 'White oak, rigid core click, 5mm', 'lvt'),
  pack('Beauflor', 'Pure Wood Smoked Oak', 'BEA-PWO-SOA', 1.85, 38.00, 'Beauflor', 'Smoked oak dark, rigid core click, 5mm', 'lvt'),

  // LooseLay
  pack('Karndean', 'LooseLay Longboard Prairie Oak', 'KAR-LL-PRO', 2.50, 72.00, 'Karndean', 'Prairie oak, looselay, 4.5mm, 0.55mm wear, 2.5m²/box', 'lvt'),
  pack('Karndean', 'LooseLay Longboard Washed Ash', 'KAR-LL-WAH', 2.50, 72.00, 'Karndean', 'Washed ash, looselay no-glue LVT, 4.5mm'),

  // Harvey Maria
  pack('Harvey Maria', 'Luxury Vinyl Tile Linen Stone', 'HM-LVT-LST', 2.00, 64.00, 'Harvey Maria', 'Linen stone, click LVT, 5mm total, 0.5mm wear layer', 'lvt'),
  pack('Harvey Maria', 'Luxury Vinyl Tile Ivory Marble', 'HM-LVT-IMA', 2.00, 64.00, 'Harvey Maria', 'Ivory marble effect, click LVT, 5mm, 0.5mm wear', 'lvt'),

  // Budget LVT
  pack('Flooring Direct', 'Rigid Comfort Oak Natural', 'FD-RCO-NAT', 2.09, 28.00, 'Flooring Direct', 'Natural oak, rigid click LVT, 4.5mm, budget range, 2.09m²/box', 'lvt'),
  pack('Flooring Direct', 'Rigid Comfort Oak Grey', 'FD-RCO-GRE', 2.09, 28.00, 'Flooring Direct', 'Grey oak, rigid click LVT, 4.5mm', 'lvt'),
  pack('Flooring Direct', 'Rigid Comfort Stone Grey', 'FD-RCS-GRE', 2.09, 30.00, 'Flooring Direct', 'Grey stone tile, rigid click LVT, 4.5mm', 'lvt'),
  pack('Flooring Direct', 'Rigid Comfort Stone Cream', 'FD-RCS-CRE', 2.09, 30.00, 'Flooring Direct', 'Cream stone, rigid click LVT, 4.5mm', 'lvt'),
]

// ─── LAMINATE ──────────────────────────────────────────────────────────────────

const LAMINATE: SeedMaterial[] = [
  // Quick-Step — market leader premium laminate
  pack('Quick-Step', 'Impressive Natural Heritage Oak', 'QS-IMP-NHO', 1.845, 45.00, 'Quick-Step', 'Natural heritage oak, AC4, 8mm, 1.845m²/box, uniclic'),
  pack('Quick-Step', 'Impressive Soft Oak Light', 'QS-IMP-SOL', 1.845, 45.00, 'Quick-Step', 'Soft oak light, AC4, 8mm, uniclic joint'),
  pack('Quick-Step', 'Impressive Soft Oak Grey', 'QS-IMP-SOG', 1.845, 45.00, 'Quick-Step', 'Soft oak grey, AC4, 8mm, water repellent surface'),
  pack('Quick-Step', 'Impressive Classic Oak Beige', 'QS-IMP-COB', 1.845, 42.00, 'Quick-Step', 'Classic oak beige, AC4, 8mm, 1.845m²/box'),
  pack('Quick-Step', 'Impressive Ultra Natural Pale Oak', 'QS-IMU-NPO', 1.845, 58.00, 'Quick-Step', 'Natural pale oak, AC4+, 12mm, ultra rigid'),
  pack('Quick-Step', 'Impressive Ultra Dark Grey Oak', 'QS-IMU-DGO', 1.845, 58.00, 'Quick-Step', 'Dark grey oak, 12mm, ultra-resistant surface'),
  pack('Quick-Step', 'Eligna Light Grey Varnished Oak', 'QS-ELI-LGO', 2.050, 42.00, 'Quick-Step', 'Light grey varnished oak, AC4, 8mm, 2.05m²/box'),
  pack('Quick-Step', 'Eligna Dark Varnished Oak', 'QS-ELI-DVO', 2.050, 42.00, 'Quick-Step', 'Dark varnished oak, AC4, 8mm'),
  pack('Quick-Step', 'Largo Natural Elegant Oak', 'QS-LAR-NEO', 2.050, 62.00, 'Quick-Step', 'Natural elegant oak, AC4, 9.5mm wide-board laminate'),
  pack('Quick-Step', 'Largo Grey Varnished Oak', 'QS-LAR-GVO', 2.050, 62.00, 'Quick-Step', 'Grey varnished oak, wide board 240mm, AC4, 9.5mm'),
  pack('Quick-Step', 'Creo Charlotte Oak Grey', 'QS-CRE-COG', 1.596, 36.00, 'Quick-Step', 'Charlotte oak grey, AC4, 7mm, 1.596m²/box, budget range'),
  pack('Quick-Step', 'Creo Tennessee Oak Natural', 'QS-CRE-TON', 1.596, 36.00, 'Quick-Step', 'Tennessee oak natural, AC4, 7mm'),
  pack('Quick-Step', 'Classic Mellow Oak Brown', 'QS-CLA-MOB', 2.131, 38.00, 'Quick-Step', 'Mellow oak brown, AC4, 8mm, 2.131m²/box'),
  pack('Quick-Step', 'Classic Sandy Grey Oak', 'QS-CLA-SGO', 2.131, 38.00, 'Quick-Step', 'Sandy grey oak, AC4, 8mm'),

  // Pergo
  pack('Pergo', 'Original Excellence Natural Variation Oak', 'PER-OEX-NVO', 1.844, 52.00, 'Pergo', 'Natural variation oak, AC5, 9.5mm, 1.844m²/box'),
  pack('Pergo', 'Original Excellence Antique Oak', 'PER-OEX-ANO', 1.844, 52.00, 'Pergo', 'Antique grey oak, AC5, 9.5mm, Pergo original excellence'),
  pack('Pergo', 'Original Excellence White Oak', 'PER-OEX-WHO', 1.844, 52.00, 'Pergo', 'White painted oak, AC5, 9.5mm'),
  pack('Pergo', 'Sensation Natural Oak', 'PER-SEN-NOA', 1.844, 48.00, 'Pergo', 'Natural oak, AC5, 9.5mm, Pergo sensation range'),
  pack('Pergo', 'Sensation Old Grey Oak', 'PER-SEN-OGO', 1.844, 48.00, 'Pergo', 'Old grey oak, AC5, 9.5mm'),
  pack('Pergo', 'Extreme Long Plank Nature Oak', 'PER-EXT-NNO', 2.058, 64.00, 'Pergo', 'Nature oak, extra long plank, AC5, 9.5mm, 2.058m²/box'),

  // Berry Alloc
  pack('Berry Alloc', 'Eternity Large Country Oak 24L', 'BER-ETL-CO24', 2.058, 56.00, 'Berry Alloc', 'Country oak, 24L plank, AC5, 12mm, water resistant'),
  pack('Berry Alloc', 'Eternity Small Long Island White', 'BER-ETS-LIW', 1.474, 54.00, 'Berry Alloc', 'Long Island white, AC5, 12mm, 1.474m²/box'),
  pack('Berry Alloc', 'Finesse Cottage Oak', 'BER-FIN-COO', 1.474, 48.00, 'Berry Alloc', 'Cottage oak, AC5, 12mm, elegant textured surface'),
  pack('Berry Alloc', 'Bloom Pure Arctic White', 'BER-BLO-PAW', 1.474, 44.00, 'Berry Alloc', 'Arctic white, AC4, 8mm, Bloom budget range'),
  pack('Berry Alloc', 'Bloom Pure Sand Storm', 'BER-BLO-PSS', 1.474, 44.00, 'Berry Alloc', 'Sand storm, AC4, 8mm'),

  // Egger
  pack('Egger', 'PRO Classic Aqua+ Natural Bardolino Oak', 'EGG-PRO-NBO', 2.153, 48.00, 'Egger', 'Natural Bardolino oak, AC4, 8mm, aqua+ waterproof, 2.153m²/box'),
  pack('Egger', 'PRO Classic Aqua+ Grey Bardolino Oak', 'EGG-PRO-GBO', 2.153, 48.00, 'Egger', 'Grey Bardolino oak, aqua+ protection, AC4, 8mm'),
  pack('Egger', 'PRO Classic Aqua+ White Loft Oak', 'EGG-PRO-WLO', 2.153, 48.00, 'Egger', 'White loft oak, aqua+, AC4, 8mm, modern'),
  pack('Egger', 'PRO Comfort Long Plank Natural Hamilton Oak', 'EGG-PRCL-NHO', 2.153, 54.00, 'Egger', 'Natural Hamilton oak, long plank, AC4, 10mm, comfort underlay'),
  pack('Egger', 'Comfort Kingsize Murom Oak Natural', 'EGG-COM-MNO', 2.419, 44.00, 'Egger', 'Murom oak natural, kingsize plank, AC4, 8mm, 2.419m²/box'),

  // Balterio
  pack('Balterio', 'Magnitude Natural Oak', 'BAL-MAG-NOA', 2.052, 46.00, 'Balterio', 'Natural oak, AC4, 8mm, uniclic, 2.052m²/box'),
  pack('Balterio', 'Magnitude Sundown Oak', 'BAL-MAG-SDO', 2.052, 46.00, 'Balterio', 'Sundown oak warm grey, AC4, 8mm'),
  pack('Balterio', 'Grande Narrow Natural Oak', 'BAL-GRN-NOA', 1.580, 52.00, 'Balterio', 'Natural oak, Grande narrow, AC4, 9mm, 1.58m²/box'),
  pack('Balterio', 'Grande Narrow Smoked Beech', 'BAL-GRN-SMB', 1.580, 52.00, 'Balterio', 'Smoked beech, Grande narrow, 9mm, AC4'),
  pack('Balterio', 'Traditions Antique Oak', 'BAL-TRA-ANO', 2.052, 42.00, 'Balterio', 'Antique oak, Traditions, AC4, 8mm, value range'),

  // Kronotex
  pack('Kronotex', 'Mammut Pettersson Oak Nature', 'KRO-MAM-PON', 2.390, 62.00, 'Kronotex', 'Pettersson oak nature, 12mm, V4, wide board, 2.39m²/box'),
  pack('Kronotex', 'Mammut Pettersson Oak Grey', 'KRO-MAM-POG', 2.390, 62.00, 'Kronotex', 'Pettersson oak grey, 12mm, V4, wide board'),
  pack('Kronotex', 'Dynamic Natural Varnished Oak', 'KRO-DYN-NVO', 2.390, 36.00, 'Kronotex', 'Natural varnished oak, 8mm, AC4, wide plank, 2.39m²/box'),
  pack('Kronotex', 'Dynamic Summer Oak', 'KRO-DYN-SUO', 2.390, 36.00, 'Kronotex', 'Summer oak light, 8mm, AC4, wide plank'),
  pack('Kronotex', 'Robusto Heritage Oak', 'KRO-ROB-HEO', 2.390, 42.00, 'Kronotex', 'Heritage oak, 12mm, AC5, heavy duty, 2.39m²/box'),
  pack('Kronotex', 'Robusto Harbour Oak', 'KRO-ROB-HAO', 2.390, 42.00, 'Kronotex', 'Harbour oak dark, 12mm, AC5, heavy duty'),

  // Tarkett
  pack('Tarkett', 'Woodstock 832 Natural Oak', 'TAR-WS8-NOA', 1.596, 38.00, 'Tarkett', 'Natural oak, 8mm, AC4, 1.596m²/box, Woodstock range'),
  pack('Tarkett', 'Woodstock 832 White Oak', 'TAR-WS8-WHO', 1.596, 38.00, 'Tarkett', 'White oak, 8mm, AC4'),
  pack('Tarkett', 'Trends 832 Sand Oak', 'TAR-TR8-SAO', 1.596, 34.00, 'Tarkett', 'Sand oak warm, 8mm, AC3, budget trends range'),
  pack('Tarkett', 'Trends 832 Limed Oak', 'TAR-TR8-LIO', 1.596, 34.00, 'Tarkett', 'Limed oak, 8mm, AC3, Trends range'),

  // Alsafloor
  pack('Alsafloor', 'Osmoze Grey Oak', 'ALS-OSM-GRO', 2.052, 44.00, 'Alsafloor', 'Grey oak, Osmoze, 8mm, AC4, innovative French brand, 2.052m²/box'),
  pack('Alsafloor', 'Osmoze Natural Oak', 'ALS-OSM-NAO', 2.052, 44.00, 'Alsafloor', 'Natural oak, Osmoze, 8mm, AC4, moisture resistant'),
  pack('Alsafloor', 'Solid Plus White Varnished Oak', 'ALS-SOP-WVO', 2.052, 52.00, 'Alsafloor', 'White varnished oak, Solid Plus, 10mm, AC4'),

  // Classen
  pack('Classen', 'Neo 2.0 Polar Oak', 'CLA-NEO-POA', 2.052, 38.00, 'Classen', 'Polar oak white, Neo 2.0, 8mm, AC4, 2.052m²/box'),
  pack('Classen', 'Neo 2.0 Victoria Oak', 'CLA-NEO-VOA', 2.052, 38.00, 'Classen', 'Victoria oak golden, Neo 2.0, 8mm, AC4'),

  // Budget laminate
  pack('Flooring Direct', 'Classic 8mm Natural Oak', 'FD-CL8-NOA', 2.131, 22.00, 'Flooring Direct', 'Natural oak, 8mm, AC3, budget, 2.131m²/box'),
  pack('Flooring Direct', 'Classic 8mm Grey Oak', 'FD-CL8-GRO', 2.131, 22.00, 'Flooring Direct', 'Grey oak, 8mm, AC3, budget laminate'),
  pack('Flooring Direct', 'Classic 8mm Beech', 'FD-CL8-BEE', 2.131, 20.00, 'Flooring Direct', 'Beech, 8mm, AC3, budget laminate'),
  pack('Flooring Direct', 'Value 7mm Light Oak', 'FD-VA7-LOA', 2.131, 16.00, 'Flooring Direct', 'Light oak, 7mm, AC3, value range'),
  pack('Flooring Direct', 'Value 7mm Natural Oak', 'FD-VA7-NOA', 2.131, 16.00, 'Flooring Direct', 'Natural oak, 7mm, AC3, value range'),
]

// ─── ENGINEERED WOOD ──────────────────────────────────────────────────────────

const ENGINEERED_WOOD: SeedMaterial[] = [
  // Kahrs — Swedish brand, very popular in UK
  pack('Kahrs', 'Oak Nouveau Beige', 'KAH-ONB-BEI', 2.235, 112.00, 'Kahrs', 'Oak, brushed, Nouveau beige, 15/3.5mm, 187mm wide, 2.235m²/box', 'engineered_wood'),
  pack('Kahrs', 'Oak Nouveau White', 'KAH-ONW-WHI', 2.235, 112.00, 'Kahrs', 'Oak white painted, 15/3.5mm, 187mm wide, UV lacquer', 'engineered_wood'),
  pack('Kahrs', 'Oak Nouveau Smoked', 'KAH-ONS-SMO', 2.235, 118.00, 'Kahrs', 'Oak smoked, Nouveau range, 15/3.5mm, 187mm wide', 'engineered_wood'),
  pack('Kahrs', 'Oak Nouveau Natural', 'KAH-ONN-NAT', 2.235, 108.00, 'Kahrs', 'Oak natural, unsmoked, 15/3.5mm, 187mm wide plank', 'engineered_wood'),
  pack('Kahrs', 'Oak Chevron Original', 'KAH-OCH-ORI', 1.272, 145.00, 'Kahrs', 'Oak chevron/parquet, natural, 15mm, 1.272m²/box', 'engineered_wood'),
  pack('Kahrs', 'Oak 1-strip Palazzo Biondo', 'KAH-OP1-BIO', 3.366, 92.00, 'Kahrs', 'Wide plank oak Biondo, 1-strip, 13/3mm, 3.366m²/box', 'engineered_wood'),
  pack('Kahrs', 'Oak 1-strip Palazzo Studio', 'KAH-OP1-STU', 3.366, 92.00, 'Kahrs', 'Studio light, wide plank 1-strip, 13/3mm', 'engineered_wood'),
  pack('Kahrs', 'Walnut Lux Satin', 'KAH-WLS-SAT', 2.235, 158.00, 'Kahrs', 'American walnut, satin lacquer, 15/3.5mm, 187mm wide', 'engineered_wood'),
  pack('Kahrs', 'Ash Palazzo Salte', 'KAH-APS-SAL', 3.366, 98.00, 'Kahrs', 'Ash Salte, wide plank, 15mm, brushed, UV oil finish', 'engineered_wood'),
  pack('Kahrs', 'Maple Nordic', 'KAH-MNO-NOR', 2.235, 102.00, 'Kahrs', 'Hard maple, Nordic natural, 15/3.5mm, 187mm wide', 'engineered_wood'),

  // Ted Todd — premium UK brand
  pack('Ted Todd', 'Fine Art Elgin Natural', 'TT-FAE-NAT', 1.440, 168.00, 'Ted Todd', 'Oak Elgin natural, Fine Art range, 14/3mm, brushed & oiled, 1.44m²/box', 'engineered_wood'),
  pack('Ted Todd', 'Fine Art Elgin Fossil', 'TT-FAE-FOS', 1.440, 168.00, 'Ted Todd', 'Oak Elgin fossil grey, Fine Art, 14/3mm, hardwax oiled', 'engineered_wood'),
  pack('Ted Todd', 'Fine Art Misted Light Oak', 'TT-FAM-LIG', 1.440, 156.00, 'Ted Todd', 'Misted light oak, Fine Art, 14/3mm, brushed UV oiled', 'engineered_wood'),
  pack('Ted Todd', 'Design Classics Elgin White', 'TT-DCE-WHI', 1.440, 148.00, 'Ted Todd', 'Oak Elgin white, Design Classics, 14/3mm, smooth lacquered', 'engineered_wood'),
  pack('Ted Todd', 'Design Classics Sandown Limed', 'TT-DCS-LIM', 1.440, 152.00, 'Ted Todd', 'Sandown limed oak, grey-white, 14/3mm, UV oiled', 'engineered_wood'),
  pack('Ted Todd', 'Industry Wide Plank Smoked', 'TT-IND-SMO', 1.800, 138.00, 'Ted Todd', 'Wide plank smoked oak, 14mm, brushed oiled, 1.8m²/box', 'engineered_wood'),
  pack('Ted Todd', 'Industry Wide Plank Natural', 'TT-IND-NAT', 1.800, 134.00, 'Ted Todd', 'Wide plank natural oak, 14mm, brushed, oil finish', 'engineered_wood'),

  // Woodpecker Flooring — UK brand
  pack('Woodpecker', 'Harlech Oak Natural', 'WPF-HAR-NAT', 1.512, 86.00, 'Woodpecker Flooring', 'Harlech natural oak, 18/3mm, 125mm plank, UV lacquer, 1.512m²/box', 'engineered_wood'),
  pack('Woodpecker', 'Harlech Oak Smoked', 'WPF-HAR-SMO', 1.512, 89.00, 'Woodpecker Flooring', 'Harlech smoked oak, 18/3mm, 125mm plank', 'engineered_wood'),
  pack('Woodpecker', 'Harlech Oak White', 'WPF-HAR-WHI', 1.512, 89.00, 'Woodpecker Flooring', 'Harlech white oak, 18/3mm, 125mm, white lacquer', 'engineered_wood'),
  pack('Woodpecker', 'Brecon Oak Natural', 'WPF-BRE-NAT', 1.620, 78.00, 'Woodpecker Flooring', 'Brecon natural oak, 14/3mm, 150mm plank, 1.62m²/box', 'engineered_wood'),
  pack('Woodpecker', 'Brecon Oak Smoked Grey', 'WPF-BRE-SGR', 1.620, 82.00, 'Woodpecker Flooring', 'Brecon smoked grey oak, 14/3mm, 150mm', 'engineered_wood'),
  pack('Woodpecker', 'Brecon Oak Warm White', 'WPF-BRE-WWH', 1.620, 82.00, 'Woodpecker Flooring', 'Brecon warm white oak, 14/3mm, 150mm plank', 'engineered_wood'),
  pack('Woodpecker', 'Llangollen Oak Natural', 'WPF-LLA-NAT', 2.016, 92.00, 'Woodpecker Flooring', 'Llangollen natural oak, 18/4mm, 185mm plank, UV oil, 2.016m²/box', 'engineered_wood'),
  pack('Woodpecker', 'Llangollen Oak Vintage', 'WPF-LLA-VIN', 2.016, 96.00, 'Woodpecker Flooring', 'Llangollen vintage oak, 18/4mm, brushed & oiled', 'engineered_wood'),

  // Boen — Norwegian brand
  pack('Boen', 'Oak Animoso Brushed', 'BOE-OAB-ANI', 2.394, 118.00, 'Boen', 'Oak Animoso, brushed, 14mm, Live Natural oil, 2.394m²/box', 'engineered_wood'),
  pack('Boen', 'Oak Vivo Brushed', 'BOE-OAB-VIV', 2.394, 112.00, 'Boen', 'Oak Vivo natural, brushed, 14mm, Live Natural oil', 'engineered_wood'),
  pack('Boen', 'Oak Nordic Brushed White', 'BOE-OAB-NWH', 2.394, 122.00, 'Boen', 'Oak Nordic, white stained, brushed, 14mm, white oil', 'engineered_wood'),
  pack('Boen', 'Oak Stonewashed Brushed', 'BOE-OAB-STO', 2.394, 128.00, 'Boen', 'Oak stonewashed grey, 14mm, Live Natural finish', 'engineered_wood'),
  pack('Boen', 'Ash Andante Brushed', 'BOE-ASH-AND', 2.394, 108.00, 'Boen', 'Ash Andante white, brushed & oiled, 14mm, 2.394m²/box', 'engineered_wood'),

  // Quick-Step (Massimo / Variano)
  pack('Quick-Step', 'Massimo Manor Oak Extra Matt', 'QS-MAS-MOM', 1.584, 148.00, 'Quick-Step', 'Manor oak, extra matt finish, 14mm, brushed, 1.584m²/box', 'engineered_wood'),
  pack('Quick-Step', 'Massimo Autumn Oak Natural', 'QS-MAS-AON', 1.584, 148.00, 'Quick-Step', 'Autumn oak natural, 14mm, brushed & oiled', 'engineered_wood'),
  pack('Quick-Step', 'Massimo Old White Oak', 'QS-MAS-OWO', 1.584, 158.00, 'Quick-Step', 'Old white oak, Massimo, 14mm, white finish', 'engineered_wood'),
  pack('Quick-Step', 'Variano Natural Heritage Oak', 'QS-VAR-NHO', 2.394, 112.00, 'Quick-Step', 'Natural heritage oak, Variano, 12mm, UV lacquer, 2.394m²/box', 'engineered_wood'),
  pack('Quick-Step', 'Variano Grey Varnished Oak', 'QS-VAR-GVO', 2.394, 112.00, 'Quick-Step', 'Grey varnished oak, Variano, 12mm', 'engineered_wood'),

  // Havwoods — premium
  pack('Havwoods', 'HW4111 Whittle Oiled', 'HAV-HW4111', 2.025, 175.00, 'Havwoods', 'White oiled oak, 14mm, 180mm wide plank, 2.025m²/box', 'engineered_wood'),
  pack('Havwoods', 'HW4113 Rawdon Lacquered', 'HAV-HW4113', 2.025, 165.00, 'Havwoods', 'Natural lacquered oak, 14mm, 180mm wide plank', 'engineered_wood'),
  pack('Havwoods', 'HW4123 Callow Smoked', 'HAV-HW4123', 2.025, 185.00, 'Havwoods', 'Smoked & brushed oak, 14mm, 180mm, premium', 'engineered_wood'),
  pack('Havwoods', 'HW4115 Stainton Grey', 'HAV-HW4115', 2.025, 178.00, 'Havwoods', 'Grey stained oak, 14mm, 180mm wide', 'engineered_wood'),
  pack('Havwoods', 'HW4070 Parquet Herringbone Natural', 'HAV-HW4070', 1.296, 195.00, 'Havwoods', 'Herringbone parquet, natural oak, 15mm, 1.296m²/box', 'engineered_wood'),

  // Elka Flooring
  pack('Elka', '18mm Solid Plus Light Oak Smooth', 'ELK-18S-LOS', 2.268, 88.00, 'Elka Flooring', 'Light oak smooth, 18/4mm, 150mm wide, 2.268m²/box', 'engineered_wood'),
  pack('Elka', '18mm Solid Plus Smoked Oak', 'ELK-18S-SMO', 2.268, 92.00, 'Elka Flooring', 'Smoked oak, 18/4mm, 150mm, oiled finish', 'engineered_wood'),
  pack('Elka', '18mm Solid Plus Grey Oak', 'ELK-18S-GRO', 2.268, 92.00, 'Elka Flooring', 'Grey stained oak, 18/4mm, 150mm, oiled', 'engineered_wood'),
  pack('Elka', '14mm Engineered Natural Oak', 'ELK-14E-NAT', 1.890, 72.00, 'Elka Flooring', 'Natural oak, 14/3mm, 125mm, UV lacquer, 1.89m²/box', 'engineered_wood'),
  pack('Elka', '14mm Engineered Herringbone Smoked', 'ELK-14H-SMO', 1.037, 98.00, 'Elka Flooring', 'Smoked oak herringbone, 14mm, 1.037m²/box', 'engineered_wood'),

  // Natura World
  pack('Natura', 'Wide Plank Oak Rustic', 'NAT-WPO-RUS', 2.100, 82.00, 'Natura World', 'Rustic grade oak, wide plank, 14mm, brushed oiled, 2.1m²/box', 'engineered_wood'),
  pack('Natura', 'Wide Plank Oak Prime', 'NAT-WPO-PRI', 2.100, 88.00, 'Natura World', 'Prime grade oak, wide plank, 14mm, natural oil', 'engineered_wood'),
  pack('Natura', 'Wide Plank Smoked Fumed', 'NAT-WPS-FUM', 2.100, 96.00, 'Natura World', 'Fumed smoked oak, 14mm, wire brushed, oil finish', 'engineered_wood'),
  pack('Natura', 'Parquet Herringbone Oak Natural', 'NAT-PHO-NAT', 1.200, 108.00, 'Natura World', 'Herringbone oak, natural, 15mm, 70×350mm blocks', 'engineered_wood'),

  // Direct Wood Flooring own-brand
  pack('DWF', 'Engineered Oak Natural 150mm', 'DWF-EON-150', 2.100, 68.00, 'Direct Wood Flooring', 'Natural oak, 150mm plank, 14/3mm, UV lacquer, 2.1m²/box', 'engineered_wood'),
  pack('DWF', 'Engineered Oak Smoked 150mm', 'DWF-EOS-150', 2.100, 72.00, 'Direct Wood Flooring', 'Smoked oak, 150mm, 14/3mm, UV oil', 'engineered_wood'),
  pack('DWF', 'Engineered Oak White 150mm', 'DWF-EOW-150', 2.100, 72.00, 'Direct Wood Flooring', 'White stained oak, 150mm, 14/3mm, lacquer', 'engineered_wood'),
  pack('DWF', 'Engineered Oak Natural 190mm', 'DWF-EON-190', 2.394, 78.00, 'Direct Wood Flooring', 'Natural oak, 190mm wide plank, 14/3mm, UV lacquer', 'engineered_wood'),
  pack('DWF', 'Engineered Walnut Natural 150mm', 'DWF-EWN-150', 1.890, 98.00, 'Direct Wood Flooring', 'American walnut, 150mm plank, 14/3mm, oiled', 'engineered_wood'),
  pack('DWF', 'Engineered Oak Herringbone Natural', 'DWF-EOH-NAT', 1.400, 88.00, 'Direct Wood Flooring', 'Herringbone pattern, natural oak, 15mm, 70×280mm', 'engineered_wood'),

  // Flooring Superstore own-brand
  pack('Flooring Superstore', 'Majestic Oak Natural', 'FS-MAJ-NAT', 2.100, 62.00, 'Flooring Superstore', 'Natural oak, 14mm, 150mm wide, 2.1m²/box, UV lacquer', 'engineered_wood'),
  pack('Flooring Superstore', 'Majestic Oak Smoked Grey', 'FS-MAJ-SGR', 2.100, 66.00, 'Flooring Superstore', 'Smoked grey oak, 14mm, 150mm, lacquer', 'engineered_wood'),
  pack('Flooring Superstore', 'Majestic Oak White', 'FS-MAJ-WHI', 2.100, 66.00, 'Flooring Superstore', 'White brushed oak, 14mm, 150mm, UV oil', 'engineered_wood'),
  pack('Flooring Superstore', 'Manhattan Oak Rustic Grey', 'FS-MAN-RGR', 1.890, 74.00, 'Flooring Superstore', 'Rustic grey oak, Manhattan range, 18/4mm, 125mm', 'engineered_wood'),
]

// ─── UNDERLAY ─────────────────────────────────────────────────────────────────

const UNDERLAY: SeedMaterial[] = [
  // Duralay — major UK underlay brand
  roll('Duralay', 'Heatstore 8mm', 'DUR-HS-8', 4000, 14.00, 'Duralay', 'Thermal carpet underlay, 8mm, 10 tog rating, foil back, 4m wide', 'underlay'),
  roll('Duralay', 'Heatstore 11mm', 'DUR-HS-11', 4000, 18.00, 'Duralay', 'Thermal underlay 11mm, superior heat retention, foil backed', 'underlay'),
  roll('Duralay', 'Tredaire Dreamer 11mm', 'DUR-TDR-11', 4000, 22.00, 'Duralay', 'Premium Tredaire Dreamer, 11mm, luxury feel underlay, 4m wide', 'underlay'),
  roll('Duralay', 'Tredaire Origins 10mm', 'DUR-TOR-10', 4000, 20.00, 'Duralay', 'Tredaire Origins, 10mm, 100% recycled, carpet underlay', 'underlay'),
  roll('Duralay', 'Highlander 8mm', 'DUR-HIG-8', 4000, 12.00, 'Duralay', 'Highlander standard 8mm, economy carpet underlay, 4m wide', 'underlay'),
  roll('Duralay', 'Luxury 11mm', 'DUR-LUX-11', 4000, 26.00, 'Duralay', 'Luxury 11mm, superior density, plush feel', 'underlay'),

  // Ball & Young
  roll('Ball & Young', 'Griptex 8mm', 'BAY-GT8-4', 4000, 10.00, 'Ball & Young', '8mm economy underlay, polyurethane foam, 4m wide', 'underlay'),
  roll('Ball & Young', 'Griptex 10mm', 'BAY-GT10-4', 4000, 14.00, 'Ball & Young', '10mm standard PU foam underlay, 4m wide', 'underlay'),
  roll('Ball & Young', 'Cloudstep 10mm', 'BAY-CS10-4', 4000, 18.00, 'Ball & Young', 'Cloudstep 10mm, higher density PU, cloud-like feel', 'underlay'),
  roll('Ball & Young', 'Cloudstep 12mm', 'BAY-CS12-4', 4000, 22.00, 'Ball & Young', 'Cloudstep 12mm maximum depth, luxurious', 'underlay'),

  // Interfloor
  roll('Interfloor', 'Timbermate 3mm Hardfloor', 'INT-TIM-3', 10000, 3.50, 'Interfloor', 'Timbermate 3mm, laminate/engineered underlay, 10m wide roll', 'underlay'),
  roll('Interfloor', 'Timbermate 2mm Foam', 'INT-TIM-2', 10000, 2.00, 'Interfloor', 'Timbermate 2mm foam, basic laminate underlay, 10m wide', 'underlay'),
  roll('Interfloor', 'Permalay 6mm', 'INT-PER-6', 4000, 8.00, 'Interfloor', 'Permalay 6mm crumb rubber, carpet underlay, 4m wide', 'underlay'),
  roll('Interfloor', 'Combilay 9mm', 'INT-COM-9', 4000, 16.00, 'Interfloor', 'Combilay 9mm, PU foam, all-round carpet underlay', 'underlay'),

  // Cloud9 — premium underlay
  roll('Cloud9', 'Cirrus 10mm', 'CL9-CIR-10', 4000, 24.00, 'Cloud9', 'Cirrus 10mm, luxury rebond PU, 4m wide, premium feel', 'underlay'),
  roll('Cloud9', 'Cumulus 11mm', 'CL9-CUM-11', 4000, 28.00, 'Cloud9', 'Cumulus 11mm, superior rebond PU, extra luxury', 'underlay'),
  roll('Cloud9', 'Stratus 8mm', 'CL9-STR-8', 4000, 16.00, 'Cloud9', 'Stratus 8mm, standard rebond PU underlay', 'underlay'),
  roll('Cloud9', 'Nimbus Acoustic 10mm', 'CL9-NIM-10', 4000, 30.00, 'Cloud9', 'Nimbus acoustic 10mm, impact sound reduction, flats/maisonettes', 'underlay'),

  // LVT / Hard floor underlay (area sold)
  area('Roberts', 'Quiet Walk LVT Underlay 1.5mm', 'ROB-QW-1.5', 3.50, 'Roberts', '1.5mm QuietWalk, for LVT/click vinyl, moisture barrier, per m²', 'underlay'),
  area('Roberts', 'Felt Cushion 3mm', 'ROB-FC-3', 2.00, 'Roberts', '3mm felt underlay for laminate/engineered, basic, per m²', 'underlay'),
  area('Duralay', 'Impact Barrier 1.5mm', 'DUR-IB-1.5', 4.00, 'Duralay', '1.5mm acoustic barrier for LVT, self-adhesive strip, per m²', 'underlay'),
  area('Interfloor', 'Timbermate Excel 3.5mm', 'INT-TEX-3.5', 4.50, 'Interfloor', '3.5mm premium laminate/engineered underlay, acoustic rated, per m²', 'underlay'),

  // Acoustic specialist
  roll('Regupol', 'Acoustic Comfort 4.5mm', 'REG-AC-4.5', 10000, 6.00, 'Regupol', 'Acoustic underlay 4.5mm, recycled rubber, for flats, 10m wide', 'underlay'),
  area('Regupol', 'BSW Acoustic 5mm', 'REG-BSW-5', 8.00, 'Regupol', '5mm BSW acoustic, high impact sound reduction, per m²', 'underlay'),
]

// ─── ACCESSORIES ─────────────────────────────────────────────────────────────

const ACCESSORIES: SeedMaterial[] = [
  // Gripper rod
  linear('Roberts', 'Standard Gripper Rod', 'ROB-GRP-STD', 1.50, 'Roberts', 'Standard toothed gripper rod, 25mm, nailed/glued, per metre'),
  linear('Roberts', 'Tackless Gripper Hardwood', 'ROB-GRP-HWD', 2.20, 'Roberts', 'Hardwood gripper for hard subfloors, tackless, per metre'),
  linear('Interfloor', 'Stairmaster Gripper', 'INT-SGP-STD', 1.80, 'Interfloor', 'Stair gripper rod, angled for treads, per metre'),
  linear('Interfloor', 'Standard Gripper Economy', 'INT-GRP-ECO', 1.20, 'Interfloor', 'Economy gripper rod, concrete/timber, per metre'),

  // Door bars / thresholds
  unit('Dural', 'Cover Profile Brushed Aluminium 90cm', 'DUR-CPB-90', 8.50, 'Dural', 'T-bar door bar, brushed aluminium, 900mm, height adjustable'),
  unit('Dural', 'Cover Profile Chrome 90cm', 'DUR-CPC-90', 8.50, 'Dural', 'T-bar door threshold, chrome, 900mm'),
  unit('Dural', 'Cover Profile Gold 90cm', 'DUR-CPG-90', 9.00, 'Dural', 'T-bar door bar, antique gold, 900mm'),
  unit('Dural', 'Ramp Profile Silver 90cm', 'DUR-RPS-90', 9.50, 'Dural', 'Ramp/reducer threshold, silver, carpet to hard floor'),
  unit('Dural', 'End Profile Brushed Aluminium 90cm', 'DUR-EPB-90', 7.50, 'Dural', 'End cap / edge profile, brushed aluminium, 900mm'),
  unit('Brebo', 'T-Bar Oak 90cm', 'BRE-TBO-90', 12.00, 'Brebo', 'Laminate threshold T-bar, oak veneer, 900mm, colour matched'),
  unit('Brebo', 'T-Bar Walnut 90cm', 'BRE-TBW-90', 12.00, 'Brebo', 'Laminate threshold, walnut, 900mm'),
  unit('Quick-Step', 'Incizo Profile Natural Oak', 'QS-INC-NOA', 18.00, 'Quick-Step', 'Incizo 5-in-1 profile, natural oak, matches Impressive range'),
  unit('Quick-Step', 'Incizo Profile Grey Oak', 'QS-INC-GOA', 18.00, 'Quick-Step', 'Incizo profile grey oak, 5-in-1 use'),

  // Scotia / beading
  linear('Cheshire Mouldings', 'Pine Scotia Beading 18mm', 'CHE-SBP-18', 1.20, 'Cheshire Mouldings', 'Pine Scotia 18×18mm, painted/primed, per metre, skirting trim'),
  linear('Cheshire Mouldings', 'MDF Primed Scotia 15mm', 'CHE-SBM-15', 1.00, 'Cheshire Mouldings', 'MDF primed Scotia 15×15mm, ready to paint, per metre'),
  linear('Cheshire Mouldings', 'Oak Scotia 18mm', 'CHE-SBO-18', 2.50, 'Cheshire Mouldings', 'Solid oak Scotia 18×18mm, natural, per metre'),

  // Stair nosings
  linear('Dural', 'Stair Nosing Aluminium', 'DUR-SNS-ALU', 6.00, 'Dural', 'Stair nosing, brushed aluminium, LVT/laminate stairs, per metre'),
  linear('Dural', 'Stair Nosing Oak', 'DUR-SNS-OAK', 8.00, 'Dural', 'Stair nosing, solid oak, matches wood flooring, per metre'),

  // Adhesives / prep
  unit('Mapei', 'Ultrabond Eco VS90 LVT Adhesive 7kg', 'MAP-VS90-7', 28.00, 'Mapei', 'VS90 pressure sensitive adhesive, for gluedown LVT, 7kg tub'),
  unit('Mapei', 'Ultrabond Eco VS90 15kg', 'MAP-VS90-15', 52.00, 'Mapei', 'VS90 LVT adhesive, 15kg tub, covers ~40m²'),
  unit('Instarmac', 'UltraFloor Level IT 25kg', 'INS-ULF-25', 18.00, 'Instarmac', 'Self-levelling compound, 25kg bag, covers 5m² at 5mm'),
  unit('Instarmac', 'UltraFloor SBR Primer 5L', 'INS-SBR-5', 14.00, 'Instarmac', 'SBR bonding primer, 5L, pre-treatment for levelling/adhesive'),
]

// ─── Combined export ──────────────────────────────────────────────────────────

export const SEED_CATALOGUE: SeedMaterial[] = [
  ...CARPETS,
  ...VINYL_ROLL,
  ...LVT,
  ...LAMINATE,
  ...ENGINEERED_WOOD,
  ...UNDERLAY,
  ...ACCESSORIES,
]

export function getSeedStats() {
  const counts: Record<string, number> = {}
  for (const m of SEED_CATALOGUE) {
    counts[m.type] = (counts[m.type] ?? 0) + 1
  }
  return { total: SEED_CATALOGUE.length, byType: counts }
}
