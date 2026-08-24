import { useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useStore } from '../store/useStore';
import GenericTable, { type Column } from '../components/GenericTable';
import { Button, Card, Field, NumberInput, SelectInput, TextInput } from '../components/ui';
import { downloadTextFile } from '../lib/snapshot';
import {
  PROFILE_TYPE_LABELS,
  GLASS_KIND_LABELS,
  HARDWARE_CATEGORY_LABELS,
  SERVICE_KIND_LABELS,
  type Profile,
  type GlassType,
  type HardwareItem,
  type PaintOption,
  type RalColor,
  type ServiceOption,
  type MaterialItem,
} from '../types';

const TABS = [
  'Профили',
  'Стекло',
  'Фурнитура',
  'Покраска',
  'RAL цвета',
  'Услуги',
  'Материалы',
  'Наценка',
  'Формулы расчёта',
  'Импорт / Экспорт',
] as const;
type Tab = (typeof TABS)[number];

const unitOptions = [
  { value: 'шт', label: 'шт' },
  { value: 'м', label: 'м' },
  { value: 'м2', label: 'м2' },
  { value: 'кг', label: 'кг' },
  { value: 'компл', label: 'компл' },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('Профили');
  const store = useStore();

  const profileSystemOptions = store.profileSystems.map((s) => ({ value: s.id, label: s.name }));
  const ralOptions = [{ value: '', label: '—' }, ...store.ralColors.map((r) => ({ value: r.id, label: r.code }))];

  const profileColumns: Column<Profile>[] = [
    { key: 'name', label: 'Название', type: 'text' },
    { key: 'article', label: 'Артикул', type: 'text' },
    { key: 'type', label: 'Тип', type: 'select', options: Object.entries(PROFILE_TYPE_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'purpose', label: 'Назначение', type: 'text' },
    { key: 'systemId', label: 'Система', type: 'select', options: profileSystemOptions },
    { key: 'weightKgPerM', label: 'Вес, кг/м', type: 'number' },
    { key: 'pricePerM', label: 'Цена, ₽/м', type: 'number' },
    { key: 'supplyLengthMm', label: 'Длина поставки, мм', type: 'number' },
    { key: 'stockQty', label: 'Остаток, м', type: 'number' },
  ];

  const glassColumns: Column<GlassType>[] = [
    { key: 'kind', label: 'Вид', type: 'select', options: Object.entries(GLASS_KIND_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'thicknessMm', label: 'Толщина, мм', type: 'select', numeric: true, options: [4, 6, 8, 10].map((v) => ({ value: String(v), label: String(v) })) },
    { key: 'pricePerSqm', label: 'Цена, ₽/м²', type: 'number' },
    { key: 'weightKgPerSqm', label: 'Вес, кг/м²', type: 'number' },
    { key: 'colorHex', label: 'Цвет (превью)', type: 'color' },
    { key: 'description', label: 'Описание', type: 'text' },
  ];

  const hardwareColumns: Column<HardwareItem>[] = [
    { key: 'name', label: 'Название', type: 'text' },
    { key: 'category', label: 'Категория', type: 'select', options: Object.entries(HARDWARE_CATEGORY_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'article', label: 'Артикул', type: 'text' },
    { key: 'price', label: 'Цена, ₽', type: 'number' },
    { key: 'manufacturer', label: 'Производитель', type: 'text' },
    { key: 'unit', label: 'Ед. изм.', type: 'select', options: unitOptions },
  ];

  const paintColumns: Column<PaintOption>[] = [
    { key: 'label', label: 'Название', type: 'text' },
    { key: 'coating', label: 'Покрытие', type: 'select', options: [
      { value: 'none', label: 'Без покраски' },
      { value: 'powder', label: 'Порошковая' },
      { value: 'anodizing', label: 'Анодирование' },
      { value: 'decorative', label: 'Декоративное' },
    ] },
    { key: 'texture', label: 'Текстура', type: 'select', options: [
      { value: '', label: '—' },
      { value: 'gloss', label: 'Глянец' },
      { value: 'matte', label: 'Мат' },
      { value: 'moire', label: 'Муар' },
      { value: 'shagreen', label: 'Шагрень' },
    ] },
    { key: 'ralId', label: 'RAL', type: 'select', options: ralOptions },
    { key: 'pricingMode', label: 'Тариф', type: 'select', options: [
      { value: 'perKg', label: 'за кг' },
      { value: 'perMeter', label: 'за метр' },
      { value: 'perSqm', label: 'за м²' },
    ] },
    { key: 'price', label: 'Цена', type: 'number' },
  ];

  const ralColumns: Column<RalColor>[] = [
    { key: 'code', label: 'Код RAL', type: 'text' },
    { key: 'name', label: 'Название', type: 'text' },
    { key: 'hex', label: 'Цвет', type: 'color' },
  ];

  const serviceColumns: Column<ServiceOption>[] = [
    { key: 'label', label: 'Название', type: 'text' },
    { key: 'kind', label: 'Вид', type: 'select', options: Object.entries(SERVICE_KIND_LABELS).map(([value, label]) => ({ value, label })) },
    { key: 'pricingMode', label: 'Тариф', type: 'select', options: [
      { value: 'fixed', label: 'фикс.' },
      { value: 'perSqm', label: 'за м²' },
      { value: 'perM', label: 'за метр периметра' },
    ] },
    { key: 'price', label: 'Цена, ₽', type: 'number' },
  ];

  const materialColumns: Column<MaterialItem>[] = [
    { key: 'name', label: 'Название', type: 'text' },
    { key: 'article', label: 'Артикул', type: 'text' },
    { key: 'purchasePrice', label: 'Цена закупки', type: 'number' },
    { key: 'salePrice', label: 'Цена продажи', type: 'number' },
    { key: 'supplier', label: 'Поставщик', type: 'text' },
    { key: 'lengthMm', label: 'Длина, мм', type: 'number' },
    { key: 'weightKg', label: 'Вес, кг', type: 'number' },
    { key: 'unit', label: 'Ед. изм.', type: 'select', options: unitOptions },
    { key: 'comment', label: 'Комментарий', type: 'text' },
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-6">
      <h1 className="mb-1 text-xl font-bold text-slate-800">Настройки администратора</h1>
      <p className="mb-5 text-sm text-slate-500">
        Все цены, нормы и формулы хранятся здесь — калькулятор пересчитывается автоматически, без изменения кода программы.
      </p>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-3 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Профили' && (
        <Card>
          <GenericTable
            items={store.profiles}
            columns={profileColumns}
            onUpsert={store.upsertProfile}
            onRemove={store.removeProfile}
            onAdd={() =>
              store.upsertProfile({
                id: uuid(),
                name: 'Новый профиль',
                article: '',
                type: 'main',
                purpose: '',
                weightKgPerM: 1,
                pricePerM: 500,
                supplyLengthMm: 6000,
                systemId: store.profileSystems[0]?.id ?? '',
              })
            }
          />
        </Card>
      )}

      {tab === 'Стекло' && (
        <Card>
          <GenericTable
            items={store.glassTypes}
            columns={glassColumns}
            onUpsert={store.upsertGlassType}
            onRemove={store.removeGlassType}
            onAdd={() =>
              store.upsertGlassType({
                id: uuid(),
                kind: 'clear',
                thicknessMm: 6,
                pricePerSqm: 2500,
                weightKgPerSqm: 15,
                colorHex: '#dfeef2',
                opacity: 0.2,
                description: '',
              })
            }
          />
        </Card>
      )}

      {tab === 'Фурнитура' && (
        <Card>
          <GenericTable
            items={store.hardwareItems}
            columns={hardwareColumns}
            onUpsert={store.upsertHardware}
            onRemove={store.removeHardware}
            onAdd={() => store.upsertHardware({ id: uuid(), name: 'Новая позиция', category: 'fastener', article: '', price: 0, manufacturer: '', unit: 'шт' })}
          />
        </Card>
      )}

      {tab === 'Покраска' && (
        <Card>
          <GenericTable
            items={store.paintOptions}
            columns={paintColumns}
            onUpsert={store.upsertPaintOption}
            onRemove={store.removePaintOption}
            onAdd={() => store.upsertPaintOption({ id: uuid(), coating: 'powder', pricingMode: 'perKg', price: 200, label: 'Новое покрытие' })}
          />
        </Card>
      )}

      {tab === 'RAL цвета' && (
        <Card>
          <GenericTable
            items={store.ralColors}
            columns={ralColumns}
            onUpsert={store.upsertRal}
            onRemove={store.removeRal}
            onAdd={() => store.upsertRal({ id: uuid(), code: 'RAL ####', name: 'Новый цвет', hex: '#888888' })}
          />
        </Card>
      )}

      {tab === 'Услуги' && (
        <Card>
          <GenericTable
            items={store.serviceOptions}
            columns={serviceColumns}
            onUpsert={store.upsertService}
            onRemove={store.removeService}
            onAdd={() => store.upsertService({ id: uuid(), kind: 'visit', label: 'Новая услуга', pricingMode: 'fixed', price: 0 })}
          />
        </Card>
      )}

      {tab === 'Материалы' && (
        <Card>
          <GenericTable
            items={store.materials}
            columns={materialColumns}
            onUpsert={store.upsertMaterial}
            onRemove={store.removeMaterial}
            onAdd={() => store.upsertMaterial({ id: uuid(), name: 'Новый материал', article: '', purchasePrice: 0, salePrice: 0, supplier: '', unit: 'шт' })}
          />
        </Card>
      )}

      {tab === 'Наценка' && <MarkupForm />}
      {tab === 'Формулы расчёта' && <FormulasForm />}
      {tab === 'Импорт / Экспорт' && <ImportExport />}
    </div>
  );
}

function MarkupForm() {
  const markup = useStore((s) => s.markup);
  const setMarkup = useStore((s) => s.setMarkup);
  return (
    <Card title="Настройки наценки" className="max-w-xl">
      <Field label="Режим наценки">
        <SelectInput
          value={markup.mode}
          onChange={(v) => setMarkup({ ...markup, mode: v })}
          options={[
            { value: 'percent', label: 'Процент по каждой статье' },
            { value: 'fixed', label: 'Фиксированная сумма' },
          ]}
        />
      </Field>
      {markup.mode === 'percent' ? (
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="Наценка на профиль, %">
            <NumberInput value={markup.profilePercent} onChange={(e) => setMarkup({ ...markup, profilePercent: Number(e.target.value) || 0 })} />
          </Field>
          <Field label="Наценка на стекло, %">
            <NumberInput value={markup.glassPercent} onChange={(e) => setMarkup({ ...markup, glassPercent: Number(e.target.value) || 0 })} />
          </Field>
          <Field label="Наценка на фурнитуру, %">
            <NumberInput value={markup.hardwarePercent} onChange={(e) => setMarkup({ ...markup, hardwarePercent: Number(e.target.value) || 0 })} />
          </Field>
          <Field label="Наценка на покраску, %">
            <NumberInput value={markup.paintPercent} onChange={(e) => setMarkup({ ...markup, paintPercent: Number(e.target.value) || 0 })} />
          </Field>
          <Field label="Наценка на монтаж/услуги, %">
            <NumberInput value={markup.installPercent} onChange={(e) => setMarkup({ ...markup, installPercent: Number(e.target.value) || 0 })} />
          </Field>
        </div>
      ) : (
        <Field label="Фиксированная наценка, ₽">
          <NumberInput value={markup.fixedAmount} onChange={(e) => setMarkup({ ...markup, fixedAmount: Number(e.target.value) || 0 })} />
        </Field>
      )}
    </Card>
  );
}

function FormulasForm() {
  const formulas = useStore((s) => s.formulas);
  const setFormulas = useStore((s) => s.setFormulas);
  const set = <K extends keyof typeof formulas>(k: K, v: (typeof formulas)[K]) => setFormulas({ ...formulas, [k]: v });
  return (
    <Card title="Формулы и нормативы расчёта" className="max-w-3xl">
      <div className="grid grid-cols-3 gap-x-4">
        <Field label="Длина хлыста, мм" hint="стандартная длина поставки профиля">
          <NumberInput value={formulas.barLengthMm} onChange={(e) => set('barLengthMm', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Потери на пропил, мм">
          <NumberInput value={formulas.kerfMm} onChange={(e) => set('kerfMm', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Норматив отходов, %">
          <NumberInput value={formulas.wastePercent} onChange={(e) => set('wastePercent', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Запас материала, %">
          <NumberInput value={formulas.reservePercent} onChange={(e) => set('reservePercent', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Зазор стекла в штапике, мм">
          <NumberInput value={formulas.glassEdgeGapMm} onChange={(e) => set('glassEdgeGapMm', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Зазор полотна двери, мм">
          <NumberInput value={formulas.leafGapMm} onChange={(e) => set('leafGapMm', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Видимая рамка полотна, мм">
          <NumberInput value={formulas.leafFrameFaceMm} onChange={(e) => set('leafFrameFaceMm', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Длина профиля ручки, мм">
          <NumberInput value={formulas.handleProfileLengthMm} onChange={(e) => set('handleProfileLengthMm', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Порог усиления по ширине, мм">
          <NumberInput value={formulas.reinforcedWidthThresholdMm} onChange={(e) => set('reinforcedWidthThresholdMm', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Порог усиления по высоте, мм">
          <NumberInput value={formulas.reinforcedHeightThresholdMm} onChange={(e) => set('reinforcedHeightThresholdMm', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Шаг установки петель, мм">
          <NumberInput value={formulas.hingeStepMm} onChange={(e) => set('hingeStepMm', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Курс валюты (импорт)">
          <NumberInput value={formulas.currencyRate} onChange={(e) => set('currencyRate', Number(e.target.value) || 0)} />
        </Field>
        <Field label="Код валюты">
          <TextInput value={formulas.currencyCode} onChange={(e) => set('currencyCode', e.target.value)} />
        </Field>
      </div>
    </Card>
  );
}

function ImportExport() {
  const exportAllJSON = useStore((s) => s.exportAllJSON);
  const importAllJSON = useStore((s) => s.importAllJSON);
  const resetToDefaults = useStore((s) => s.resetToDefaults);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  return (
    <Card title="Резервное копирование справочников" className="max-w-xl">
      <p className="mb-3 text-sm text-slate-500">
        Экспортируйте всю базу (справочники, наценки, формулы, проекты) в JSON-файл или загрузите ранее сохранённый файл.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => downloadTextFile(exportAllJSON(), 'loft-calc-backup.json', 'application/json')}>
          ⬇ Экспортировать всё в JSON
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          ⬆ Загрузить JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              importAllJSON(await file.text());
              setMsg('Импортировано успешно.');
            } catch {
              setMsg('Ошибка: некорректный файл.');
            }
            e.target.value = '';
          }}
        />
        <Button
          variant="danger"
          onClick={() => {
            if (confirm('Сбросить все справочники к значениям по умолчанию? Проекты сохранятся.')) resetToDefaults();
          }}
        >
          Сбросить справочники к заводским
        </Button>
      </div>
      {msg && <p className="mt-2 text-sm text-emerald-600">{msg}</p>}
    </Card>
  );
}
