// Доменная модель калькулятора Loft-перегородок и дверей.
// Все справочники (профили, стекло, фурнитура, покраска, услуги, наценки, формулы)
// хранятся как данные в сторе/localStorage, а не зашиты в код — редактируются в Admin.

export type ID = string;

// ---------------------------------------------------------------------------
// Профили
// ---------------------------------------------------------------------------

export type ProfileType =
  | 'main' // Основной профиль
  | 'box' // Коробочный
  | 'stoevoy' // Стоевой
  | 'poperechny' // Поперечный
  | 'impost' // Импост
  | 'shtapik' // Штапик
  | 'connecting' // Соединительный
  | 'corner' // Угловой
  | 'threshold' // Порог
  | 'topGuide' // Верхняя направляющая
  | 'bottomGuide' // Нижняя направляющая
  | 'handle' // Профиль ручки
  | 'dobor' // Доборный профиль
  | 'reinforced'; // Усиленный профиль

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  main: 'Основной профиль',
  box: 'Коробочный',
  stoevoy: 'Стоевой',
  poperechny: 'Поперечный',
  impost: 'Импост',
  shtapik: 'Штапик',
  connecting: 'Соединительный',
  corner: 'Угловой',
  threshold: 'Порог',
  topGuide: 'Верхняя направляющая',
  bottomGuide: 'Нижняя направляющая',
  handle: 'Профиль ручки',
  dobor: 'Доборный профиль',
  reinforced: 'Усиленный профиль',
};

export interface Profile {
  id: ID;
  name: string;
  article: string;
  type: ProfileType;
  purpose: string; // Назначение
  weightKgPerM: number;
  pricePerM: number;
  supplyLengthMm: number; // Длина поставки (обычно 6000)
  stockQty?: number; // Остаток на складе, в метрах (опционально)
  drawingUrl?: string; // Чертёж профиля
  sectionUrl?: string; // Сечение профиля
  systemId: ID; // к какой профильной системе относится
  comment?: string;
}

export interface ProfileSystem {
  id: ID;
  name: string; // напр. "Loft Standard 40", "Loft Slim 25"
  description?: string;
}

// ---------------------------------------------------------------------------
// Стекло
// ---------------------------------------------------------------------------

export type GlassKind =
  | 'clear' // Прозрачное
  | 'extraClear' // Осветлённое
  | 'matte' // Матовое
  | 'graphite' // Графит
  | 'bronze' // Бронза
  | 'black' // Чёрное
  | 'reeded' // Рифлёное
  | 'ultraClear' // Ультрапрозрачное
  | 'tinted' // Тонированное
  | 'mirror'; // Зеркальное

export const GLASS_KIND_LABELS: Record<GlassKind, string> = {
  clear: 'Прозрачное',
  extraClear: 'Осветлённое',
  matte: 'Матовое',
  graphite: 'Графит',
  bronze: 'Бронза',
  black: 'Чёрное',
  reeded: 'Рифлёное',
  ultraClear: 'Ультрапрозрачное',
  tinted: 'Тонированное',
  mirror: 'Зеркальное',
};

export type GlassThickness = 4 | 6 | 8 | 10;

export interface GlassType {
  id: ID;
  kind: GlassKind;
  thicknessMm: GlassThickness;
  pricePerSqm: number;
  weightKgPerSqm: number;
  description?: string;
  colorHex: string; // для 3D/SVG превью
  opacity: number; // 0..1 для 3D превью
}

// ---------------------------------------------------------------------------
// Фурнитура
// ---------------------------------------------------------------------------

export type HardwareCategory =
  | 'hinge' // Петли
  | 'lock' // Замки
  | 'handle' // Ручки
  | 'strikePlate' // Ответные планки
  | 'closer' // Доводчики
  | 'roller' // Ролики
  | 'carriage' // Каретки
  | 'guide' // Направляющие
  | 'stopper' // Стопоры
  | 'seal' // Уплотнители
  | 'brush' // Щётки
  | 'boltLatch' // Шпингалеты
  | 'magnet' // Магниты
  | 'screw' // Саморезы
  | 'anchor' // Анкеры
  | 'fastener'; // Крепёж

export const HARDWARE_CATEGORY_LABELS: Record<HardwareCategory, string> = {
  hinge: 'Петли',
  lock: 'Замки',
  handle: 'Ручки',
  strikePlate: 'Ответные планки',
  closer: 'Доводчики',
  roller: 'Ролики',
  carriage: 'Каретки',
  guide: 'Направляющие',
  stopper: 'Стопоры',
  seal: 'Уплотнители',
  brush: 'Щётки',
  boltLatch: 'Шпингалеты',
  magnet: 'Магниты',
  screw: 'Саморезы',
  anchor: 'Анкеры',
  fastener: 'Крепёж',
};

export type UnitOfMeasure = 'шт' | 'м' | 'м2' | 'кг' | 'компл';

export interface HardwareItem {
  id: ID;
  name: string;
  category: HardwareCategory;
  article: string;
  price: number;
  manufacturer: string;
  unit: UnitOfMeasure;
  comment?: string;
}

// ---------------------------------------------------------------------------
// Покраска
// ---------------------------------------------------------------------------

export type PaintCoating =
  | 'none' // Без покраски
  | 'powder' // Порошковая окраска
  | 'anodizing' // Анодирование
  | 'decorative'; // Декоративное покрытие

export type PaintTexture = 'gloss' | 'matte' | 'moire' | 'shagreen'; // Глянец / Мат / Муар / Шагрень

export type PaintPricingMode = 'perKg' | 'perMeter' | 'perSqm';

export interface RalColor {
  id: ID;
  code: string; // RAL 9005
  name: string;
  hex: string;
}

export interface PaintOption {
  id: ID;
  coating: PaintCoating;
  texture?: PaintTexture;
  ralId?: ID;
  pricingMode: PaintPricingMode;
  price: number; // за кг / за метр / за м2, в зависимости от pricingMode
  label: string;
}

// ---------------------------------------------------------------------------
// Доп. услуги
// ---------------------------------------------------------------------------

export type ServiceKind =
  | 'install' // Монтаж
  | 'delivery' // Доставка
  | 'lift' // Подъём
  | 'dismantle' // Демонтаж
  | 'measure' // Замер
  | 'visit'; // Выезд

export const SERVICE_KIND_LABELS: Record<ServiceKind, string> = {
  install: 'Монтаж',
  delivery: 'Доставка',
  lift: 'Подъём',
  dismantle: 'Демонтаж',
  measure: 'Замер',
  visit: 'Выезд',
};

export type ServicePricingMode = 'fixed' | 'perSqm' | 'perM';

export interface ServiceOption {
  id: ID;
  kind: ServiceKind;
  label: string;
  pricingMode: ServicePricingMode;
  price: number;
}

// ---------------------------------------------------------------------------
// Типы изделий
// ---------------------------------------------------------------------------

export type ProductTypeId =
  | 'partition' // Loft перегородка
  | 'swingDoor' // Loft распашная дверь
  | 'slidingDoor' // Loft раздвижная дверь
  | 'doubleSwingDoor' // Loft двустворчатая распашная дверь
  | 'doubleSlidingDoor' // Loft двустворчатая раздвижная дверь
  | 'partitionWithDoor' // Перегородка с дверью
  | 'transom' // Фрамуга
  | 'cornerPartition' // Угловая перегородка
  | 'uShapePartition' // П-образная конструкция
  | 'custom'; // Индивидуальная конструкция

export const PRODUCT_TYPE_LABELS: Record<ProductTypeId, string> = {
  partition: 'Loft перегородка',
  swingDoor: 'Loft распашная дверь',
  slidingDoor: 'Loft раздвижная дверь',
  doubleSwingDoor: 'Loft двустворчатая распашная дверь',
  doubleSlidingDoor: 'Loft двустворчатая раздвижная дверь',
  partitionWithDoor: 'Перегородка с дверью',
  transom: 'Фрамуга',
  cornerPartition: 'Угловая перегородка',
  uShapePartition: 'П-образная конструкция',
  custom: 'Индивидуальная конструкция',
};

// ---------------------------------------------------------------------------
// Геометрия / конфигурация изделия
// ---------------------------------------------------------------------------

export type OpeningType =
  | 'fixed' // глухая секция
  | 'swingLeft'
  | 'swingRight'
  | 'slideLeft'
  | 'slideRight';

export const OPENING_TYPE_LABELS: Record<OpeningType, string> = {
  fixed: 'Глухая (стационарная)',
  swingLeft: 'Распашная влево',
  swingRight: 'Распашная вправо',
  slideLeft: 'Раздвижная влево',
  slideRight: 'Раздвижная вправо',
};

export interface Section {
  id: ID;
  widthMm: number;
  opening: OpeningType;
  horizontalImposts: number; // кол-во горизонтальных импостов внутри секции -> рядов = +1
  glassTypeId: ID;
  glassThicknessMm: GlassThickness;
}

export interface MoldingConfig {
  enabled: boolean;
  stepMm: number;
  widthMm: number;
  thicknessMm: number;
  colorId?: ID; // если не задан — берётся цвет профиля
}

export interface MarkupSettings {
  mode: 'percent' | 'fixed';
  profilePercent: number;
  glassPercent: number;
  hardwarePercent: number;
  installPercent: number;
  paintPercent: number;
  fixedAmount: number; // используется при mode = 'fixed'
}

export interface FormulaSettings {
  barLengthMm: number; // длина хлыста, обычно 6000
  kerfMm: number; // потери на пропил на каждый рез
  wastePercent: number; // норматив отходов, %
  reservePercent: number; // запас материала, %
  glassEdgeGapMm: number; // на сколько мм с каждой стороны стекло меньше проёма (заходит в штапик)
  leafGapMm: number; // зазор между полотном и коробкой/импостом, с каждой стороны
  leafFrameFaceMm: number; // видимая ширина рамки полотна, с каждой стороны (для расчёта стекла в полотне)
  handleProfileLengthMm: number;
  reinforcedWidthThresholdMm: number; // выше этой ширины секции — усиленный профиль
  reinforcedHeightThresholdMm: number;
  hingeStepMm: number; // шаг установки петель по высоте полотна
  sealPricePerMFallback: number;
  currencyRate: number; // курс валюты для импортных материалов (у.е. -> базовая валюта)
  currencyCode: string;
}

// ---------------------------------------------------------------------------
// Проект (заказ)
// ---------------------------------------------------------------------------

export interface ProductConfig {
  productTypeId: ProductTypeId;
  widthMm: number;
  heightMm: number;
  sections: Section[];
  verticalMoldings: MoldingConfig;
  horizontalMoldings: MoldingConfig;
  profileSystemId: ID;
  mainProfileId: ID;
  paintOptionId: ID;
  syncOpening: boolean;
  closerEnabled: boolean;
  lockEnabled: boolean;
  selectedServiceIds: ID[];
}

export interface ClientInfo {
  fullName: string;
  phone: string;
  address: string;
  designer?: string;
  date: string; // ISO
  orderNumber: string;
  comment?: string;
}

export interface Project {
  id: ID;
  client: ClientInfo;
  product: ProductConfig;
  markupOverride?: Partial<MarkupSettings>;
  createdAt: string;
  updatedAt: string;
  snapshots: string[]; // dataURL картинок 3D/схемы
}

// ---------------------------------------------------------------------------
// Материалы (отдельный справочник, не входит напрямую в расчёт профилей/стекла)
// ---------------------------------------------------------------------------

export interface MaterialItem {
  id: ID;
  name: string;
  article: string;
  drawingUrl?: string;
  photoUrl?: string;
  purchasePrice: number;
  salePrice: number;
  supplier: string;
  lengthMm?: number;
  weightKg?: number;
  unit: UnitOfMeasure;
  comment?: string;
}

// ---------------------------------------------------------------------------
// Спецификация / расчёт
// ---------------------------------------------------------------------------

export interface SpecRow {
  id: ID;
  group: 'Профиль' | 'Стекло' | 'Фурнитура' | 'Покраска' | 'Услуги';
  name: string;
  article: string;
  qty: number;
  unit: UnitOfMeasure;
  price: number;
  cost: number;
  lengthM?: number;
  areaSqm?: number;
  weightKg?: number;
  comment?: string;
}

export interface CuttingResult {
  profileId: ID;
  profileName: string;
  pieceLengthsMm: number[];
  barsUsed: number;
  barLengthMm: number;
  totalUsedMm: number;
  totalBarMm: number;
  wastePercent: number;
}

export interface CalcTotals {
  profileCost: number;
  glassCost: number;
  hardwareCost: number;
  paintCost: number;
  servicesCost: number;
  costPrice: number; // себестоимость
  markupAmount: number; // наценка
  sellPrice: number; // итоговая стоимость
  profit: number;
  marginPercent: number; // прибыль / цена продажи * 100
}

export interface CalcResult {
  spec: SpecRow[];
  cutting: CuttingResult[];
  totals: CalcTotals;
  glassAreaSqm: number;
  totalProfileWeightKg: number;
  warnings: string[];
}
