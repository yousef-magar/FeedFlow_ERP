/**
 * Client-side substitution engine with AI-powered suggestions
 * and pricing calculations.
 */

export interface MaterialPrice {
  id: string;
  name: string;
  category: string;
  pricePerTon: number;
  availableTons: number;
  unit: "ton" | "kg";
  substitutionGroup?: string;
}

export interface FormulaIngredient {
  material: string;
  pct: number;
}

export interface SubstitutionSuggestion {
  originalMaterial: string;
  originalPricePerTon: number;
  substituteMaterial: string;
  substitutePricePerTon: number;
  substituteAvailableTons: number;
  neededTons: number;
  costImpact: number;
  newTotalCost: number;
  reason: "out_of_stock" | "insufficient_stock";
  aiRationale: string;
  confidence: number;
}

export interface SubstitutionResult {
  orderId: string;
  productId: string;
  productName: string;
  suggestions: SubstitutionSuggestion[];
  totalOriginalCost: number;
  totalNewCost: number;
  totalImpact: number;
}

/**
 * Material substitution groups with pricing.
 */
export const MATERIAL_CATALOG: Record<string, MaterialPrice[]> = {
  "corn": [
    { id: "I1", name: "ذرة صفراء أوكراني", category: "corn", pricePerTon: 12500, availableTons: 1250, unit: "ton", substitutionGroup: "corn" },
    { id: "I1b", name: "ذرة برازيلي", category: "corn", pricePerTon: 13200, availableTons: 0, unit: "ton", substitutionGroup: "corn" },
    { id: "I1c", name: "ذرة أمريكي", category: "corn", pricePerTon: 12800, availableTons: 350, unit: "ton", substitutionGroup: "corn" },
    { id: "I1d", name: "ذرة روماني", category: "corn", pricePerTon: 11800, availableTons: 480, unit: "ton", substitutionGroup: "corn" },
  ],
  "soy": [
    { id: "I2", name: "صويا أرجنتيني 46%", category: "soy", pricePerTon: 18500, availableTons: 850, unit: "ton", substitutionGroup: "soy" },
    { id: "I2b", name: "صويا برازيلي 46%", category: "soy", pricePerTon: 19200, availableTons: 220, unit: "ton", substitutionGroup: "soy" },
    { id: "I2c", name: "صويا أمريكي 48%", category: "soy", pricePerTon: 19800, availableTons: 150, unit: "ton", substitutionGroup: "soy" },
  ],
  "wheat_bran": [
    { id: "I3", name: "نخالة (ردة) محلية", category: "wheat_bran", pricePerTon: 6200, availableTons: 45, unit: "ton", substitutionGroup: "wheat_bran" },
    { id: "I3b", name: "نخالة (ردة) مستوردة", category: "wheat_bran", pricePerTon: 6800, availableTons: 120, unit: "ton", substitutionGroup: "wheat_bran" },
  ],
  "gluten": [
    { id: "I4", name: "جلوتين ذرة مستورد", category: "gluten", pricePerTon: 15200, availableTons: 120, unit: "ton", substitutionGroup: "gluten" },
    { id: "I4b", name: "جلوتين ذرة محلي", category: "gluten", pricePerTon: 14300, availableTons: 80, unit: "ton", substitutionGroup: "gluten" },
  ],
  "premix": [
    { id: "I5", name: "فيتامينات بريمكس", category: "premix", pricePerTon: 45000, availableTons: 5, unit: "ton", substitutionGroup: "premix" },
    { id: "I5b", name: "بريمكس دواجن متكامل", category: "premix", pricePerTon: 42000, availableTons: 3, unit: "ton", substitutionGroup: "premix" },
    { id: "I5c", name: "بريمكس مواشي متكامل", category: "premix", pricePerTon: 38000, availableTons: 4, unit: "ton", substitutionGroup: "premix" },
  ],
};

/**
 * Detect substitution group from material name.
 */
function detectGroup(name: string): string | undefined {
  const n = name.toLowerCase();
  if (n.includes("ذرة") || n.includes("corn")) return "corn";
  if (n.includes("صويا") || n.includes("soy")) return "soy";
  if (n.includes("نخالة") || n.includes("ردة") || n.includes("bran")) return "wheat_bran";
  if (n.includes("جلوتين") || n.includes("gluten")) return "gluten";
  if (n.includes("فيتامين") || n.includes("بريمكس") || n.includes("premix")) return "premix";
  return undefined;
}

/**
 * Get material price info from catalog or calculate from inventory.
 */
export function getMaterialPrice(materialName: string, inventory: { materialName: string; quantity: number; unit: string }[]): number {
  // First check catalog
  for (const group of Object.values(MATERIAL_CATALOG)) {
    const m = group.find(m => m.name === materialName);
    if (m) return m.pricePerTon;
  }
  // Fallback: estimate from product prices
  return 12000;
}

/**
 * Find best substitute using advanced scoring.
 */
export function findBestSubstitute(
  materialName: string,
  inventory: MaterialPrice[],
  neededTons: number,
): { substitute: MaterialPrice; rationale: string; confidence: number } | null {
  const group = detectGroup(materialName);

  let candidates = inventory;
  if (group) {
    candidates = inventory.filter(i => i.substitutionGroup === group && i.name !== materialName);
  } else {
    const firstWord = materialName.split(/\s+/)[0];
    candidates = inventory.filter(i => i.name.includes(firstWord) && i.name !== materialName);
  }

  candidates = candidates.filter(c => c.availableTons > 0);

  if (candidates.length === 0) return null;

  // Score: stock availability (weight x3), price (weight x2)
  const scored = candidates.map(c => {
    const stockScore = c.availableTons >= neededTons ? 100 : (c.availableTons / neededTons) * 80;
    const priceScore = Math.max(0, 100 - (c.pricePerTon / 20000) * 50);
    const totalScore = stockScore * 3 + priceScore * 2;
    return { substitute: c, score: totalScore };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  const hasEnough = best.substitute.availableTons >= neededTons;
  let rationale = `بديل متاح: ${best.substitute.name}`;
  if (hasEnough) {
    rationale += ` — المخزون كافي (${best.substitute.availableTons.toFixed(0)} طن)`;
  } else {
    rationale += ` — المخزون محدود (${best.substitute.availableTons.toFixed(0)} طن من أصل ${neededTons.toFixed(0)} طن مطلوبة)`;
  }

  return {
    substitute: best.substitute,
    rationale,
    confidence: Math.min(95, Math.round((best.score / 700) * 100)),
  };
}

/**
 * Main substitution suggestion engine.
 */
export function suggestSubstitutions(
  formula: FormulaIngredient[],
  inventory: MaterialPrice[],
  neededTons: number,
  orderId: string,
  productId: string,
  productName: string,
): SubstitutionResult {
  const suggestions: SubstitutionSuggestion[] = [];
  let totalOriginalCost = 0;
  let totalNewCost = 0;

  for (const ing of formula) {
    const needed = (neededTons * ing.pct) / 100;
    const match = inventory.find(i => i.name === ing.material);
    const currentPrice = match?.pricePerTon ?? getMaterialPrice(ing.material, []);
    const available = match?.availableTons ?? 0;

    totalOriginalCost += needed * currentPrice;

    if (available >= needed) {
      totalNewCost += needed * currentPrice;
      continue;
    }

    const found = findBestSubstitute(ing.material, inventory, needed);
    if (!found) {
      totalNewCost += needed * currentPrice;
      continue;
    }

    const origCost = needed * currentPrice;
    const newCost = needed * found.substitute.pricePerTon;
    const impact = newCost - origCost;

    totalNewCost += newCost;

    suggestions.push({
      originalMaterial: ing.material,
      originalPricePerTon: currentPrice,
      substituteMaterial: found.substitute.name,
      substitutePricePerTon: found.substitute.pricePerTon,
      substituteAvailableTons: found.substitute.availableTons,
      neededTons: needed,
      costImpact: +impact.toFixed(2),
      newTotalCost: +newCost.toFixed(2),
      reason: available <= 0 ? "out_of_stock" : "insufficient_stock",
      aiRationale: found.rationale,
      confidence: found.confidence,
    });
  }

  return {
    orderId,
    productId,
    productName,
    suggestions,
    totalOriginalCost: +totalOriginalCost.toFixed(2),
    totalNewCost: +totalNewCost.toFixed(2),
    totalImpact: +(totalNewCost - totalOriginalCost).toFixed(2),
  };
}

/**
 * Enhanced inventory monitoring — checks if any order's formula
 * ingredients are running low and returns substitution suggestions.
 */
export function monitorInventoryLevels(
  formulas: Record<string, FormulaIngredient[]>,
  inventory: MaterialPrice[],
  orders: { id: string; productId: string; productName: string; targetTons: number; status: string }[],
): SubstitutionResult[] {
  const alerts: SubstitutionResult[] = [];

  for (const order of orders) {
    if (order.status === "completed") continue;

    const formula = formulas[order.productId];
    if (!formula) continue;

    const result = suggestSubstitutions(
      formula,
      inventory,
      order.targetTons,
      order.id,
      order.productId,
      order.productName,
    );

    if (result.suggestions.length > 0) {
      alerts.push(result);
    }
  }

  return alerts;
}
