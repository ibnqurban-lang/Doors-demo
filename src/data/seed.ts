import type {
  Profile,
  ProfileSystem,
  GlassType,
  GlassKind,
  HardwareItem,
  RalColor,
  PaintOption,
  ServiceOption,
  FormulaSettings,
  MarkupSettings,
  MaterialItem,
  Section,
  ProductTypeId,
} from '../types';

// ---------------------------------------------------------------------------
// Профильные системы и профили
// ---------------------------------------------------------------------------

export const profileSystems: ProfileSystem[] = [
  { id: 'sys-standard40', name: 'Loft Standard 40', description: 'Классическая раскладка, ширина видимой части 40 мм' },
  { id: 'sys-slim25', name: 'Loft Slim 25', description: 'Тонкий профиль, ширина видимой части 25 мм' },
];

export const profiles: Profile[] = [
  // --- Loft Standard 40 ---
  { id: 'p-std-main', name: 'Основной профиль Standard 40', article: 'LST-MAIN-40', type: 'main', purpose: 'Формирование каркаса', weightKgPerM: 1.85, pricePerM: 950, supplyLengthMm: 6000, stockQty: 240, systemId: 'sys-standard40' },
  { id: 'p-std-box', name: 'Коробочный профиль 40', article: 'LST-BOX-40', type: 'box', purpose: 'Обвязка проёма по периметру', weightKgPerM: 1.6, pricePerM: 890, supplyLengthMm: 6000, stockQty: 180, systemId: 'sys-standard40' },
  { id: 'p-std-stoevoy', name: 'Стоевой профиль 40', article: 'LST-STO-40', type: 'stoevoy', purpose: 'Вертикальный элемент полотна', weightKgPerM: 1.7, pricePerM: 920, supplyLengthMm: 6000, stockQty: 150, systemId: 'sys-standard40' },
  { id: 'p-std-poper', name: 'Поперечный профиль 40', article: 'LST-POP-40', type: 'poperechny', purpose: 'Горизонтальный элемент полотна', weightKgPerM: 1.7, pricePerM: 920, supplyLengthMm: 6000, stockQty: 150, systemId: 'sys-standard40' },
  { id: 'p-std-impost', name: 'Импост 40', article: 'LST-IMP-40', type: 'impost', purpose: 'Разделение секций/ячеек', weightKgPerM: 1.5, pricePerM: 780, supplyLengthMm: 6000, stockQty: 200, systemId: 'sys-standard40' },
  { id: 'p-std-shtapik', name: 'Штапик 40', article: 'LST-SHT-40', type: 'shtapik', purpose: 'Крепление стекла', weightKgPerM: 0.35, pricePerM: 180, supplyLengthMm: 6000, stockQty: 400, systemId: 'sys-standard40' },
  { id: 'p-std-connect', name: 'Соединительный профиль 40', article: 'LST-CON-40', type: 'connecting', purpose: 'Стыковка секций П-образных конструкций', weightKgPerM: 1.2, pricePerM: 650, supplyLengthMm: 6000, stockQty: 60, systemId: 'sys-standard40' },
  { id: 'p-std-corner', name: 'Угловой профиль 40 (90°)', article: 'LST-COR-40', type: 'corner', purpose: 'Угловое соединение перегородок', weightKgPerM: 1.9, pricePerM: 1100, supplyLengthMm: 6000, stockQty: 40, systemId: 'sys-standard40' },
  { id: 'p-std-threshold', name: 'Порог 40', article: 'LST-THR-40', type: 'threshold', purpose: 'Нижний порог дверного проёма', weightKgPerM: 1.4, pricePerM: 820, supplyLengthMm: 6000, stockQty: 60, systemId: 'sys-standard40' },
  { id: 'p-std-topguide', name: 'Верхняя направляющая (раздвижная)', article: 'LST-TG-40', type: 'topGuide', purpose: 'Направляющая для роликовой каретки', weightKgPerM: 2.1, pricePerM: 1250, supplyLengthMm: 6000, stockQty: 50, systemId: 'sys-standard40' },
  { id: 'p-std-botguide', name: 'Нижняя направляющая (раздвижная)', article: 'LST-BG-40', type: 'bottomGuide', purpose: 'Направляющая для нижнего ролика', weightKgPerM: 1.3, pricePerM: 690, supplyLengthMm: 6000, stockQty: 50, systemId: 'sys-standard40' },
  { id: 'p-std-handle', name: 'Профиль ручки', article: 'LST-HND-40', type: 'handle', purpose: 'Врезка модульной ручки', weightKgPerM: 1.1, pricePerM: 1400, supplyLengthMm: 6000, stockQty: 30, systemId: 'sys-standard40' },
  { id: 'p-std-dobor', name: 'Доборный профиль 40', article: 'LST-DOB-40', type: 'dobor', purpose: 'Добор проёма', weightKgPerM: 0.9, pricePerM: 520, supplyLengthMm: 6000, stockQty: 40, systemId: 'sys-standard40' },
  { id: 'p-std-reinforced', name: 'Усиленный профиль 40', article: 'LST-REI-40', type: 'reinforced', purpose: 'Пролёты повышенной нагрузки', weightKgPerM: 2.6, pricePerM: 1450, supplyLengthMm: 6000, stockQty: 30, systemId: 'sys-standard40' },

  // --- Loft Slim 25 ---
  { id: 'p-slim-main', name: 'Основной профиль Slim 25', article: 'LSL-MAIN-25', type: 'main', purpose: 'Формирование каркаса', weightKgPerM: 1.15, pricePerM: 1050, supplyLengthMm: 6000, stockQty: 120, systemId: 'sys-slim25' },
  { id: 'p-slim-box', name: 'Коробочный профиль 25', article: 'LSL-BOX-25', type: 'box', purpose: 'Обвязка проёма по периметру', weightKgPerM: 1.0, pricePerM: 980, supplyLengthMm: 6000, stockQty: 90, systemId: 'sys-slim25' },
  { id: 'p-slim-stoevoy', name: 'Стоевой профиль 25', article: 'LSL-STO-25', type: 'stoevoy', purpose: 'Вертикальный элемент полотна', weightKgPerM: 1.05, pricePerM: 1010, supplyLengthMm: 6000, stockQty: 90, systemId: 'sys-slim25' },
  { id: 'p-slim-poper', name: 'Поперечный профиль 25', article: 'LSL-POP-25', type: 'poperechny', purpose: 'Горизонтальный элемент полотна', weightKgPerM: 1.05, pricePerM: 1010, supplyLengthMm: 6000, stockQty: 90, systemId: 'sys-slim25' },
  { id: 'p-slim-impost', name: 'Импост 25', article: 'LSL-IMP-25', type: 'impost', purpose: 'Разделение секций/ячеек', weightKgPerM: 0.95, pricePerM: 860, supplyLengthMm: 6000, stockQty: 100, systemId: 'sys-slim25' },
  { id: 'p-slim-shtapik', name: 'Штапик 25', article: 'LSL-SHT-25', type: 'shtapik', purpose: 'Крепление стекла', weightKgPerM: 0.25, pricePerM: 160, supplyLengthMm: 6000, stockQty: 300, systemId: 'sys-slim25' },
  { id: 'p-slim-threshold', name: 'Порог 25', article: 'LSL-THR-25', type: 'threshold', purpose: 'Нижний порог дверного проёма', weightKgPerM: 0.9, pricePerM: 900, supplyLengthMm: 6000, stockQty: 40, systemId: 'sys-slim25' },
  { id: 'p-slim-topguide', name: 'Верхняя направляющая (раздвижная) 25', article: 'LSL-TG-25', type: 'topGuide', purpose: 'Направляющая для роликовой каретки', weightKgPerM: 1.4, pricePerM: 1380, supplyLengthMm: 6000, stockQty: 30, systemId: 'sys-slim25' },
  { id: 'p-slim-botguide', name: 'Нижняя направляющая (раздвижная) 25', article: 'LSL-BG-25', type: 'bottomGuide', purpose: 'Направляющая для нижнего ролика', weightKgPerM: 0.8, pricePerM: 760, supplyLengthMm: 6000, stockQty: 30, systemId: 'sys-slim25' },
  { id: 'p-slim-handle', name: 'Профиль ручки Slim', article: 'LSL-HND-25', type: 'handle', purpose: 'Врезка модульной ручки', weightKgPerM: 0.7, pricePerM: 1500, supplyLengthMm: 6000, stockQty: 20, systemId: 'sys-slim25' },
];

// ---------------------------------------------------------------------------
// Стекло
// ---------------------------------------------------------------------------

const glassBase: Record<GlassKind, { price: number; density: number; colorHex: string; opacity: number; desc: string }> = {
  clear: { price: 2400, density: 2.5, colorHex: '#dfeef2', opacity: 0.18, desc: 'Стандартное прозрачное флоат-стекло' },
  extraClear: { price: 3200, density: 2.5, colorHex: '#eaf5f2', opacity: 0.12, desc: 'Осветлённое стекло с низким содержанием железа' },
  matte: { price: 3100, density: 2.5, colorHex: '#e8e8ea', opacity: 0.55, desc: 'Матированное (сатин) стекло' },
  graphite: { price: 3400, density: 2.5, colorHex: '#4a4d52', opacity: 0.55 , desc: 'Тонированное стекло графитового цвета'},
  bronze: { price: 3400, density: 2.5, colorHex: '#7a5a3a', opacity: 0.5, desc: 'Тонированное стекло бронзового цвета' },
  black: { price: 3600, density: 2.5, colorHex: '#1c1c1e', opacity: 0.75, desc: 'Чёрное тонированное стекло' },
  reeded: { price: 3300, density: 2.5, colorHex: '#d8e2e4', opacity: 0.45, desc: 'Рифлёное декоративное стекло (флютед)' },
  ultraClear: { price: 3800, density: 2.5, colorHex: '#f0f8f6', opacity: 0.08, desc: 'Ультрапрозрачное стекло с минимальным зелёным оттенком' },
  tinted: { price: 2900, density: 2.5, colorHex: '#b8c9d0', opacity: 0.4, desc: 'Тонированное в массе стекло' },
  mirror: { price: 3500, density: 2.5, colorHex: '#c9d3d6', opacity: 0.9, desc: 'Зеркальное стекло' },
};

function glassId(kind: GlassKind, t: number) {
  return `g-${kind}-${t}`;
}

export const glassTypes: GlassType[] = [];
(Object.keys(glassBase) as GlassKind[]).forEach((kind) => {
  const thicknesses = kind === 'clear' ? [4, 6, 8, 10] : kind === 'matte' ? [4, 6, 8] : [6];
  thicknesses.forEach((t) => {
    const base = glassBase[kind];
    glassTypes.push({
      id: glassId(kind, t),
      kind,
      thicknessMm: t as 4 | 6 | 8 | 10,
      pricePerSqm: Math.round(base.price * (1 + (t - 6) * 0.06)),
      // 2.5 кг/м² на каждый мм толщины (плотность стекла ~2.5 г/см³)
      weightKgPerSqm: Number((base.density * t).toFixed(2)),
      description: base.desc,
      colorHex: base.colorHex,
      opacity: base.opacity,
    });
  });
});

// ---------------------------------------------------------------------------
// RAL и покраска
// ---------------------------------------------------------------------------

export const ralColors: RalColor[] = [
  { id: 'ral-9005', code: 'RAL 9005', name: 'Чёрный янтарь', hex: '#0a0a0a' },
  { id: 'ral-9016', code: 'RAL 9016', name: 'Транспортный белый', hex: '#f6f6f6' },
  { id: 'ral-9006', code: 'RAL 9006', name: 'Белый алюминий', hex: '#a5a8a8' },
  { id: 'ral-7016', code: 'RAL 7016', name: 'Антрацитово-серый', hex: '#383e42' },
  { id: 'ral-8019', code: 'RAL 8019', name: 'Серо-коричневый', hex: '#3d3635' },
  { id: 'ral-1015', code: 'RAL 1015', name: 'Слоновая кость', hex: '#e6d2b5' },
  { id: 'ral-6005', code: 'RAL 6005', name: 'Зелёный мох', hex: '#0f4336' },
  { id: 'ral-3004', code: 'RAL 3004', name: 'Пурпурно-красный', hex: '#6b1c23' },
];

export const paintOptions: PaintOption[] = [
  { id: 'paint-none', coating: 'none', pricingMode: 'perKg', price: 0, label: 'Без покраски (анодированный / mill finish)' },
  { id: 'paint-powder-9005-gloss', coating: 'powder', texture: 'gloss', ralId: 'ral-9005', pricingMode: 'perKg', price: 220, label: 'Порошковая, RAL 9005, глянец' },
  { id: 'paint-powder-9005-matte', coating: 'powder', texture: 'matte', ralId: 'ral-9005', pricingMode: 'perKg', price: 230, label: 'Порошковая, RAL 9005, мат' },
  { id: 'paint-powder-9006-moire', coating: 'powder', texture: 'moire', ralId: 'ral-9006', pricingMode: 'perKg', price: 260, label: 'Порошковая, RAL 9006, муар' },
  { id: 'paint-powder-custom-shagreen', coating: 'powder', texture: 'shagreen', pricingMode: 'perKg', price: 280, label: 'Порошковая, любой RAL, шагрень' },
  { id: 'paint-anodizing', coating: 'anodizing', pricingMode: 'perKg', price: 190, label: 'Анодирование' },
  { id: 'paint-decorative-wood', coating: 'decorative', texture: 'matte', pricingMode: 'perMeter', price: 850, label: 'Декоративное покрытие — текстура дерева' },
];

// ---------------------------------------------------------------------------
// Фурнитура
// ---------------------------------------------------------------------------

export const hardwareItems: HardwareItem[] = [
  { id: 'hw-hinge-std', name: 'Петля скрытая усиленная', category: 'hinge', article: 'HRD-HNG-01', price: 1450, manufacturer: 'Sobinco', unit: 'шт' },
  { id: 'hw-lock-mortise', name: 'Замок врезной магнитный', category: 'lock', article: 'HRD-LCK-01', price: 3200, manufacturer: 'Ferrari', unit: 'шт' },
  { id: 'hw-handle-tube', name: 'Ручка-скоба труба Ø25 500мм', category: 'handle', article: 'HRD-HND-01', price: 2800, manufacturer: 'Ferrari', unit: 'шт' },
  { id: 'hw-strike-plate', name: 'Ответная планка', category: 'strikePlate', article: 'HRD-STR-01', price: 350, manufacturer: 'Ferrari', unit: 'шт' },
  { id: 'hw-closer', name: 'Доводчик напольный', category: 'closer', article: 'HRD-CLS-01', price: 6200, manufacturer: 'Dorma', unit: 'шт' },
  { id: 'hw-roller-set', name: 'Роликовая каретка (пара)', category: 'roller', article: 'HRD-RLR-01', price: 3400, manufacturer: 'Sipariz', unit: 'компл' },
  { id: 'hw-carriage-soft', name: 'Каретка с плавным закрыванием', category: 'carriage', article: 'HRD-CRG-01', price: 5100, manufacturer: 'Sipariz', unit: 'шт' },
  { id: 'hw-guide-floor', name: 'Направляющая напольная ролика', category: 'guide', article: 'HRD-GDF-01', price: 480, manufacturer: 'Sipariz', unit: 'шт' },
  { id: 'hw-stopper-floor', name: 'Стопор напольный', category: 'stopper', article: 'HRD-STP-01', price: 390, manufacturer: 'Ferrari', unit: 'шт' },
  { id: 'hw-seal-perimeter', name: 'Уплотнитель EPDM по периметру', category: 'seal', article: 'HRD-SEAL-01', price: 95, manufacturer: 'Deventer', unit: 'м' },
  { id: 'hw-brush-slide', name: 'Щётка уплотнительная для раздвижных', category: 'brush', article: 'HRD-BRS-01', price: 120, manufacturer: 'Deventer', unit: 'м' },
  { id: 'hw-bolt-latch', name: 'Шпингалет верх/низ', category: 'boltLatch', article: 'HRD-BLT-01', price: 1150, manufacturer: 'Ferrari', unit: 'компл' },
  { id: 'hw-magnet', name: 'Магнитный фиксатор', category: 'magnet', article: 'HRD-MAG-01', price: 260, manufacturer: 'Ferrari', unit: 'шт' },
  { id: 'hw-screw', name: 'Саморез по металлу 4.2x32', category: 'screw', article: 'HRD-SCR-01', price: 4, manufacturer: 'Fischer', unit: 'шт' },
  { id: 'hw-anchor', name: 'Анкер монтажный 10x100', category: 'anchor', article: 'HRD-ANC-01', price: 45, manufacturer: 'Fischer', unit: 'шт' },
  { id: 'hw-fastener-kit', name: 'Крепёжный комплект стандартный', category: 'fastener', article: 'HRD-FST-01', price: 650, manufacturer: 'Fischer', unit: 'компл' },
];

// ---------------------------------------------------------------------------
// Услуги
// ---------------------------------------------------------------------------

export const serviceOptions: ServiceOption[] = [
  { id: 'srv-install', kind: 'install', label: 'Монтаж', pricingMode: 'perSqm', price: 1500 },
  { id: 'srv-delivery', kind: 'delivery', label: 'Доставка', pricingMode: 'fixed', price: 3500 },
  { id: 'srv-lift', kind: 'lift', label: 'Подъём на этаж', pricingMode: 'fixed', price: 2000 },
  { id: 'srv-dismantle', kind: 'dismantle', label: 'Демонтаж старой конструкции', pricingMode: 'perSqm', price: 800 },
  { id: 'srv-measure', kind: 'measure', label: 'Замер', pricingMode: 'fixed', price: 0 },
  { id: 'srv-visit', kind: 'visit', label: 'Выезд менеджера', pricingMode: 'fixed', price: 1000 },
];

// ---------------------------------------------------------------------------
// Наценки и формулы (редактируются в Admin)
// ---------------------------------------------------------------------------

export const defaultMarkup: MarkupSettings = {
  mode: 'percent',
  profilePercent: 35,
  glassPercent: 40,
  hardwarePercent: 30,
  installPercent: 20,
  paintPercent: 30,
  fixedAmount: 0,
};

export const defaultFormulas: FormulaSettings = {
  barLengthMm: 6000,
  kerfMm: 5,
  wastePercent: 5,
  reservePercent: 3,
  glassEdgeGapMm: 16, // с каждой стороны стекло заходит в штапик на 8мм -> зазор 16мм на измерение
  leafGapMm: 6, // зазор между полотном и коробкой/импостом, с каждой стороны
  leafFrameFaceMm: 45, // видимая ширина рамки полотна, с каждой стороны
  handleProfileLengthMm: 250,
  reinforcedWidthThresholdMm: 1200,
  reinforcedHeightThresholdMm: 2600,
  hingeStepMm: 700,
  sealPricePerMFallback: 95,
  currencyRate: 1,
  currencyCode: 'RUB',
};

// ---------------------------------------------------------------------------
// Материалы (отдельный справочник)
// ---------------------------------------------------------------------------

export const materials: MaterialItem[] = [
  { id: 'mat-silicone', name: 'Силикон структурный прозрачный', article: 'MAT-SIL-01', purchasePrice: 380, salePrice: 520, supplier: 'ГлавХимСнаб', unit: 'шт', weightKg: 0.3, comment: 'Туба 300мл' },
  { id: 'mat-foam', name: 'Монтажная пена профессиональная', article: 'MAT-FOAM-01', purchasePrice: 420, salePrice: 590, supplier: 'ГлавХимСнаб', unit: 'шт', weightKg: 0.9 },
  { id: 'mat-tape', name: 'Уплотнительная лента ПСУЛ', article: 'MAT-TAPE-01', purchasePrice: 25, salePrice: 40, supplier: 'СтройКрепёж', unit: 'м' },
  { id: 'mat-cushion', name: 'Прокладка под стекло EPDM', article: 'MAT-CUSH-01', purchasePrice: 8, salePrice: 15, supplier: 'Deventer', unit: 'м' },
];

// ---------------------------------------------------------------------------
// Шаблоны секций по умолчанию для каждого типа изделия
// ---------------------------------------------------------------------------

let sectionCounter = 0;
function makeSection(partial: Partial<Section> & Pick<Section, 'widthMm' | 'opening'>): Section {
  sectionCounter += 1;
  return {
    id: `sec-${sectionCounter}`,
    horizontalImposts: 0,
    glassTypeId: glassId('clear', 6),
    glassThicknessMm: 6,
    ...partial,
  };
}

export function buildDefaultSections(productTypeId: ProductTypeId, widthMm: number): Section[] {
  switch (productTypeId) {
    case 'swingDoor':
      return [makeSection({ widthMm, opening: 'swingRight' })];
    case 'slidingDoor':
      return [makeSection({ widthMm, opening: 'slideRight' })];
    case 'doubleSwingDoor':
      return [
        makeSection({ widthMm: widthMm / 2, opening: 'swingLeft' }),
        makeSection({ widthMm: widthMm / 2, opening: 'swingRight' }),
      ];
    case 'doubleSlidingDoor':
      return [
        makeSection({ widthMm: widthMm / 2, opening: 'slideLeft' }),
        makeSection({ widthMm: widthMm / 2, opening: 'slideRight' }),
      ];
    case 'partitionWithDoor':
      return [
        makeSection({ widthMm: widthMm * 0.35, opening: 'fixed' }),
        makeSection({ widthMm: widthMm * 0.3, opening: 'swingRight' }),
        makeSection({ widthMm: widthMm * 0.35, opening: 'fixed' }),
      ];
    case 'transom':
      return [makeSection({ widthMm, opening: 'fixed' })];
    case 'cornerPartition':
      return [
        makeSection({ widthMm: widthMm * 0.5, opening: 'fixed' }),
        makeSection({ widthMm: widthMm * 0.5, opening: 'fixed' }),
      ];
    case 'uShapePartition':
      return [
        makeSection({ widthMm: widthMm * 0.3, opening: 'fixed' }),
        makeSection({ widthMm: widthMm * 0.4, opening: 'swingRight' }),
        makeSection({ widthMm: widthMm * 0.3, opening: 'fixed' }),
      ];
    case 'custom':
      return [makeSection({ widthMm, opening: 'fixed' })];
    case 'partition':
    default:
      return [
        makeSection({ widthMm: widthMm / 2, opening: 'fixed' }),
        makeSection({ widthMm: widthMm / 2, opening: 'fixed' }),
      ];
  }
}
