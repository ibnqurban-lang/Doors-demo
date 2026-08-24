import type {
  Project,
  Profile,
  ProfileType,
  GlassType,
  HardwareItem,
  PaintOption,
  ServiceOption,
  FormulaSettings,
  MarkupSettings,
  Section,
  SpecRow,
  CuttingResult,
  CalcResult,
  CalcTotals,
} from '../types';
import { GLASS_KIND_LABELS } from '../types';
import { packBars } from './cutting';

export interface CalcDb {
  profiles: Profile[];
  glassTypes: GlassType[];
  hardwareItems: HardwareItem[];
  paintOptions: PaintOption[];
  serviceOptions: ServiceOption[];
  formulas: FormulaSettings;
  markup: MarkupSettings;
}

function isDoorOpening(opening: Section['opening']) {
  return opening !== 'fixed';
}

function isSlideOpening(opening: Section['opening']) {
  return opening === 'slideLeft' || opening === 'slideRight';
}

/** Находит профиль нужного типа в выбранной системе, иначе — в любой другой (с предупреждением). */
function findProfile(
  profiles: Profile[],
  systemId: string,
  type: ProfileType,
  warnings: string[],
): Profile | null {
  const inSystem = profiles.find((p) => p.systemId === systemId && p.type === type);
  if (inSystem) return inSystem;
  const anySystem = profiles.find((p) => p.type === type);
  if (anySystem) {
    warnings.push(
      `Профиль типа "${type}" отсутствует в выбранной системе — использован профиль "${anySystem.name}" из другой системы.`,
    );
    return anySystem;
  }
  warnings.push(`Профиль типа "${type}" не найден в справочнике — позиция пропущена.`);
  return null;
}

interface ProfileLine {
  profile: Profile;
  lengthMm: number;
  note: string;
}

export function calculateProject(project: Project, db: CalcDb): CalcResult {
  const warnings: string[] = [];
  const { product } = project;
  const f = db.formulas;
  const W = product.widthMm;
  const H = product.heightMm;

  // Нормализуем ширины секций так, чтобы их сумма точно равнялась общей ширине.
  const rawSum = product.sections.reduce((s, sec) => s + sec.widthMm, 0) || 1;
  const sections = product.sections.map((sec) => ({
    ...sec,
    widthMm: (sec.widthMm / rawSum) * W,
  }));

  const lines: ProfileLine[] = [];
  const glassPieces: { section: Section; widthMm: number; heightMm: number; glass: GlassType }[] = [];
  const hardwareQty = new Map<string, number>();

  const addHw = (id: string, qty: number) => hardwareQty.set(id, (hardwareQty.get(id) ?? 0) + qty);

  // --- Коробка по периметру -------------------------------------------------
  const box = findProfile(db.profiles, product.profileSystemId, 'box', warnings);
  if (box) {
    lines.push({ profile: box, lengthMm: H, note: 'Коробка, боковая стойка' });
    lines.push({ profile: box, lengthMm: H, note: 'Коробка, боковая стойка' });
    lines.push({ profile: box, lengthMm: W, note: 'Коробка, верх' });
    lines.push({ profile: box, lengthMm: W, note: 'Коробка, низ' });
  }

  // --- Угловые/П-образные конструкции: доп. угловые соединители -------------
  if (product.productTypeId === 'cornerPartition') {
    const corner = findProfile(db.profiles, product.profileSystemId, 'corner', warnings);
    if (corner) lines.push({ profile: corner, lengthMm: H, note: 'Угловое соединение' });
  }
  if (product.productTypeId === 'uShapePartition') {
    const connecting = findProfile(db.profiles, product.profileSystemId, 'connecting', warnings);
    if (connecting) {
      lines.push({ profile: connecting, lengthMm: H, note: 'Соединитель П-образной конструкции' });
      lines.push({ profile: connecting, lengthMm: H, note: 'Соединитель П-образной конструкции' });
    }
  }

  // --- Вертикальные импосты между секциями -----------------------------------
  const reinforcedW = W > f.reinforcedWidthThresholdMm;
  const reinforcedH = H > f.reinforcedHeightThresholdMm;
  const vertImpostType: ProfileType = reinforcedW || reinforcedH ? 'reinforced' : 'impost';
  if (sections.length > 1) {
    const impost = findProfile(db.profiles, product.profileSystemId, vertImpostType, warnings);
    if (impost) {
      for (let i = 0; i < sections.length - 1; i++) {
        lines.push({ profile: impost, lengthMm: H, note: 'Вертикальный импост между секциями' });
      }
    }
  }

  let hasSwing = false;
  let leafCount = 0;

  sections.forEach((section, idx) => {
    const door = isDoorOpening(section.opening);
    const glass = db.glassTypes.find((g) => g.id === section.glassTypeId) ?? db.glassTypes[0];

    if (door) {
      leafCount += 1;
      const leafW = section.widthMm - 2 * f.leafGapMm;
      const leafH = H - 2 * f.leafGapMm;
      const stoevoy = findProfile(db.profiles, product.profileSystemId, 'stoevoy', warnings);
      const poperechny = findProfile(db.profiles, product.profileSystemId, 'poperechny', warnings);
      if (stoevoy) {
        lines.push({ profile: stoevoy, lengthMm: leafH, note: `Секция ${idx + 1}: стойка полотна` });
        lines.push({ profile: stoevoy, lengthMm: leafH, note: `Секция ${idx + 1}: стойка полотна` });
      }
      if (poperechny) {
        lines.push({ profile: poperechny, lengthMm: leafW, note: `Секция ${idx + 1}: обвязка полотна` });
        lines.push({ profile: poperechny, lengthMm: leafW, note: `Секция ${idx + 1}: обвязка полотна` });
      }
      if (section.horizontalImposts > 0) {
        warnings.push(`Секция ${idx + 1}: горизонтальные импосты внутри полотна двери не учитываются в демо-расчёте.`);
      }

      const glassW = Math.max(leafW - 2 * f.leafFrameFaceMm, 50);
      const glassH = Math.max(leafH - 2 * f.leafFrameFaceMm, 50);
      glassPieces.push({ section, widthMm: glassW, heightMm: glassH, glass });

      const shtapik = findProfile(db.profiles, product.profileSystemId, 'shtapik', warnings);
      if (shtapik) {
        const perimeterM = (2 * (glassW + glassH)) / 1000;
        lines.push({ profile: shtapik, lengthMm: perimeterM * 1000, note: `Секция ${idx + 1}: штапик полотна` });
      }

      const handle = findProfile(db.profiles, product.profileSystemId, 'handle', warnings);
      if (handle) lines.push({ profile: handle, lengthMm: f.handleProfileLengthMm, note: `Секция ${idx + 1}: профиль ручки` });

      const isPrimaryLeaf = section.opening === 'swingRight' || section.opening === 'slideRight' || sections.filter((s) => isDoorOpening(s.opening)).length === 1;

      if (isSlideOpening(section.opening)) {
        const topGuide = findProfile(db.profiles, product.profileSystemId, 'topGuide', warnings);
        const botGuide = findProfile(db.profiles, product.profileSystemId, 'bottomGuide', warnings);
        if (topGuide) lines.push({ profile: topGuide, lengthMm: section.widthMm, note: `Секция ${idx + 1}: верхняя направляющая` });
        if (botGuide) lines.push({ profile: botGuide, lengthMm: section.widthMm, note: `Секция ${idx + 1}: нижняя направляющая` });

        addHw('hw-roller-set', 1);
        addHw('hw-guide-floor', 1);
        addHw('hw-stopper-floor', 1);
        addHw('hw-brush-slide', Math.round((leafH / 1000) * 2 * 10) / 10);
        if (product.closerEnabled) addHw('hw-carriage-soft', 1);
      } else {
        hasSwing = true;
        const threshold = findProfile(db.profiles, product.profileSystemId, 'threshold', warnings);
        if (threshold) lines.push({ profile: threshold, lengthMm: section.widthMm, note: `Секция ${idx + 1}: порог` });

        const hingeQty = Math.max(2, Math.ceil(leafH / f.hingeStepMm) + 1);
        addHw('hw-hinge-std', hingeQty);
        if (product.closerEnabled) addHw('hw-closer', 1);
      }

      addHw('hw-handle-tube', 1);
      if (product.lockEnabled && isPrimaryLeaf) {
        addHw('hw-lock-mortise', 1);
        addHw('hw-strike-plate', 1);
      } else if (!isPrimaryLeaf) {
        addHw('hw-bolt-latch', 1);
      }
      addHw('hw-seal-perimeter', Math.round(((2 * (leafW + leafH)) / 1000) * 10) / 10);
    } else {
      // Глухая (стационарная) секция — может делиться горизонтальными импостами на ряды.
      const rows = section.horizontalImposts + 1;
      const cellH = H / rows;

      if (section.horizontalImposts > 0) {
        const impost = findProfile(db.profiles, product.profileSystemId, 'impost', warnings);
        if (impost) {
          for (let r = 0; r < section.horizontalImposts; r++) {
            lines.push({ profile: impost, lengthMm: section.widthMm, note: `Секция ${idx + 1}: горизонтальный импост` });
          }
        }
      }

      const shtapik = findProfile(db.profiles, product.profileSystemId, 'shtapik', warnings);
      for (let r = 0; r < rows; r++) {
        const glassW = Math.max(section.widthMm - f.glassEdgeGapMm, 50);
        const glassH = Math.max(cellH - f.glassEdgeGapMm, 50);
        glassPieces.push({ section, widthMm: glassW, heightMm: glassH, glass });
        if (shtapik) {
          const perimeterMm = 2 * (glassW + glassH);
          lines.push({ profile: shtapik, lengthMm: perimeterMm, note: `Секция ${idx + 1}: штапик, ряд ${r + 1}` });
        }
      }

      addHw('hw-seal-perimeter', Math.round(((2 * (section.widthMm + H)) / 1000) * 0.3 * 10) / 10);
    }
  });

  // --- Декоративные раскладки (молдинги) -------------------------------------
  const moldingProfile = findProfile(db.profiles, product.profileSystemId, 'impost', warnings);
  if (product.verticalMoldings.enabled && moldingProfile) {
    const count = Math.max(0, Math.floor(W / product.verticalMoldings.stepMm) - 1);
    for (let i = 0; i < count; i++) {
      lines.push({ profile: moldingProfile, lengthMm: H, note: 'Вертикальная декоративная раскладка' });
    }
  }
  if (product.horizontalMoldings.enabled && moldingProfile) {
    const count = Math.max(0, Math.floor(H / product.horizontalMoldings.stepMm) - 1);
    for (let i = 0; i < count; i++) {
      lines.push({ profile: moldingProfile, lengthMm: W, note: 'Горизонтальная декоративная раскладка' });
    }
  }

  // --- Общий крепёж -----------------------------------------------------------
  const totalProfileLenM = lines.reduce((s, l) => s + l.lengthMm, 0) / 1000;
  addHw('hw-screw', Math.ceil(totalProfileLenM * 8));
  addHw('hw-anchor', Math.max(4, Math.ceil(((2 * (W + H)) / 1000) / 0.5)));
  addHw('hw-fastener-kit', sections.length);
  if (hasSwing) addHw('hw-magnet', 1);

  // --- Группировка профилей по позиции и раскрой хлыстов ----------------------
  const profileGroups = new Map<string, { profile: Profile; lengths: number[] }>();
  lines.forEach((l) => {
    const g = profileGroups.get(l.profile.id) ?? { profile: l.profile, lengths: [] };
    g.lengths.push(l.lengthMm);
    profileGroups.set(l.profile.id, g);
  });

  const cutting: CuttingResult[] = [];
  const spec: SpecRow[] = [];
  let profileCost = 0;
  let totalProfileWeightKg = 0;

  profileGroups.forEach((g) => {
    const plan = packBars(g.lengths, f.barLengthMm, f.kerfMm);
    const rawLenM = g.lengths.reduce((s, x) => s + x, 0) / 1000;
    const withReserveM = rawLenM * (1 + f.reservePercent / 100);
    const cost = withReserveM * g.profile.pricePerM;
    const weight = withReserveM * g.profile.weightKgPerM;
    profileCost += cost;
    totalProfileWeightKg += weight;

    cutting.push({
      profileId: g.profile.id,
      profileName: g.profile.name,
      pieceLengthsMm: g.lengths,
      barsUsed: plan.barsUsed,
      barLengthMm: f.barLengthMm,
      totalUsedMm: plan.totalUsedMm,
      totalBarMm: plan.totalBarMm,
      wastePercent: plan.wastePercent,
    });

    spec.push({
      id: `spec-profile-${g.profile.id}`,
      group: 'Профиль',
      name: g.profile.name,
      article: g.profile.article,
      qty: g.lengths.length,
      unit: 'шт',
      price: g.profile.pricePerM,
      cost,
      lengthM: Number(withReserveM.toFixed(2)),
      weightKg: Number(weight.toFixed(2)),
      comment: `Хлыстов ${f.barLengthMm / 1000}м: ${plan.barsUsed}, отходы ${plan.wastePercent}%`,
    });
  });

  // --- Стекло -------------------------------------------------------------
  const glassGroups = new Map<string, { glass: GlassType; pieces: { w: number; h: number }[] }>();
  glassPieces.forEach((gp) => {
    const g = glassGroups.get(gp.glass.id) ?? { glass: gp.glass, pieces: [] };
    g.pieces.push({ w: gp.widthMm, h: gp.heightMm });
    glassGroups.set(gp.glass.id, g);
  });

  let glassCost = 0;
  let glassAreaSqm = 0;
  glassGroups.forEach((g) => {
    const areaSqm = g.pieces.reduce((s, p) => s + (p.w / 1000) * (p.h / 1000), 0);
    const cost = areaSqm * g.glass.pricePerSqm;
    const weight = areaSqm * g.glass.weightKgPerSqm;
    glassCost += cost;
    glassAreaSqm += areaSqm;

    spec.push({
      id: `spec-glass-${g.glass.id}`,
      group: 'Стекло',
      name: `Стекло ${GLASS_KIND_LABELS[g.glass.kind]}, ${g.glass.thicknessMm}мм`,
      article: g.glass.id,
      qty: g.pieces.length,
      unit: 'шт',
      price: g.glass.pricePerSqm,
      cost,
      areaSqm: Number(areaSqm.toFixed(2)),
      weightKg: Number(weight.toFixed(2)),
      comment: g.pieces.map((p) => `${Math.round(p.w)}×${Math.round(p.h)}`).join(', '),
    });
  });

  // --- Фурнитура -----------------------------------------------------------
  let hardwareCost = 0;
  hardwareQty.forEach((qty, hwId) => {
    if (qty <= 0) return;
    const hw = db.hardwareItems.find((h) => h.id === hwId);
    if (!hw) return;
    const cost = qty * hw.price;
    hardwareCost += cost;
    spec.push({
      id: `spec-hw-${hwId}`,
      group: 'Фурнитура',
      name: hw.name,
      article: hw.article,
      qty,
      unit: hw.unit,
      price: hw.price,
      cost,
      comment: hw.manufacturer,
    });
  });

  // --- Покраска -------------------------------------------------------------
  const paintOption = db.paintOptions.find((p) => p.id === product.paintOptionId);
  let paintCost = 0;
  if (paintOption && paintOption.coating !== 'none') {
    if (paintOption.pricingMode === 'perKg') paintCost = totalProfileWeightKg * paintOption.price;
    else if (paintOption.pricingMode === 'perMeter') paintCost = totalProfileLenM * paintOption.price;
    else paintCost = glassAreaSqm * paintOption.price;

    spec.push({
      id: 'spec-paint',
      group: 'Покраска',
      name: paintOption.label,
      article: paintOption.id,
      qty: paintOption.pricingMode === 'perKg' ? Number(totalProfileWeightKg.toFixed(2)) : paintOption.pricingMode === 'perMeter' ? Number(totalProfileLenM.toFixed(2)) : Number(glassAreaSqm.toFixed(2)),
      unit: paintOption.pricingMode === 'perKg' ? 'кг' : paintOption.pricingMode === 'perMeter' ? 'м' : 'м2',
      price: paintOption.price,
      cost: paintCost,
    });
  }

  // --- Услуги ----------------------------------------------------------------
  let servicesCost = 0;
  product.selectedServiceIds.forEach((svcId) => {
    const svc = db.serviceOptions.find((s) => s.id === svcId);
    if (!svc) return;
    let qty = 1;
    if (svc.pricingMode === 'perSqm') qty = Number(((W / 1000) * (H / 1000)).toFixed(2));
    else if (svc.pricingMode === 'perM') qty = Number(((2 * (W + H)) / 1000).toFixed(2));
    const cost = qty * svc.price;
    servicesCost += cost;
    spec.push({
      id: `spec-service-${svc.id}`,
      group: 'Услуги',
      name: svc.label,
      article: svc.id,
      qty,
      unit: svc.pricingMode === 'perSqm' ? 'м2' : svc.pricingMode === 'perM' ? 'м' : 'шт',
      price: svc.price,
      cost,
    });
  });

  // --- Итоги -------------------------------------------------------------
  const costPrice = profileCost + glassCost + hardwareCost + paintCost + servicesCost;

  let markupAmount = 0;
  const m = { ...db.markup, ...project.markupOverride };
  if (m.mode === 'percent') {
    markupAmount =
      profileCost * (m.profilePercent / 100) +
      glassCost * (m.glassPercent / 100) +
      hardwareCost * (m.hardwarePercent / 100) +
      paintCost * (m.paintPercent / 100) +
      servicesCost * (m.installPercent / 100);
  } else {
    markupAmount = m.fixedAmount;
  }

  const sellPrice = costPrice + markupAmount;
  const profit = sellPrice - costPrice;
  const marginPercent = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;

  const totals: CalcTotals = {
    profileCost: round2(profileCost),
    glassCost: round2(glassCost),
    hardwareCost: round2(hardwareCost),
    paintCost: round2(paintCost),
    servicesCost: round2(servicesCost),
    costPrice: round2(costPrice),
    markupAmount: round2(markupAmount),
    sellPrice: round2(sellPrice),
    profit: round2(profit),
    marginPercent: round2(marginPercent),
  };

  if (reinforcedW || reinforcedH) {
    warnings.push('Габариты превышают порог — импосты автоматически заменены на усиленный профиль.');
  }

  return { spec, cutting, totals, glassAreaSqm: round2(glassAreaSqm), totalProfileWeightKg: round2(totalProfileWeightKg), warnings };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
