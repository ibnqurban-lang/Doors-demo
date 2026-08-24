import { v4 as uuid } from 'uuid';
import type {
  GlassType,
  PaintOption,
  ProductConfig,
  ProductTypeId,
  ProfileSystem,
  Section,
  ServiceOption,
} from '../types';
import { PRODUCT_TYPE_LABELS, OPENING_TYPE_LABELS, GLASS_KIND_LABELS } from '../types';
import { Button, Card, Checkbox, Field, NumberInput, SelectInput } from './ui';

interface Props {
  product: ProductConfig;
  onChange: (patch: Partial<ProductConfig>) => void;
  onChangeSection: (id: string, patch: Partial<Section>) => void;
  profileSystems: ProfileSystem[];
  glassTypes: GlassType[];
  paintOptions: PaintOption[];
  serviceOptions: ServiceOption[];
}

const glassCellsCount = (product: ProductConfig) =>
  product.sections.reduce((s, sec) => s + (sec.opening === 'fixed' ? sec.horizontalImposts + 1 : 1), 0);

export default function LeftPanel({ product, onChange, onChangeSection, profileSystems, glassTypes, paintOptions, serviceOptions }: Props) {
  const verticalImposts = Math.max(0, product.sections.length - 1);
  const totalHorizontalImposts = product.sections.reduce((s, sec) => s + (sec.opening === 'fixed' ? sec.horizontalImposts : 0), 0);

  const addSection = () => {
    const avgW = product.widthMm / (product.sections.length + 1);
    const scaled = product.sections.map((s) => ({ ...s, widthMm: avgW }));
    onChange({
      sections: [
        ...scaled,
        { id: uuid(), widthMm: avgW, opening: 'fixed', horizontalImposts: 0, glassTypeId: glassTypes[0]?.id ?? '', glassThicknessMm: glassTypes[0]?.thicknessMm ?? 6 },
      ],
    });
  };

  const removeSection = (id: string) => {
    if (product.sections.length <= 1) return;
    onChange({ sections: product.sections.filter((s) => s.id !== id) });
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
      <Card title="Тип изделия">
        <SelectInput
          value={product.productTypeId}
          onChange={(v) => onChange({ productTypeId: v as ProductTypeId })}
          options={Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => ({ value: value as ProductTypeId, label }))}
        />
      </Card>

      <Card title="Геометрия изделия">
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="Общая ширина, мм">
            <NumberInput value={product.widthMm} onChange={(e) => onChange({ widthMm: Number(e.target.value) || 0 })} min={200} step={10} />
          </Field>
          <Field label="Общая высота, мм">
            <NumberInput value={product.heightMm} onChange={(e) => onChange({ heightMm: Number(e.target.value) || 0 })} min={200} step={10} />
          </Field>
        </div>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
          <span>Вертикальных импостов: <b className="text-slate-700">{verticalImposts}</b></span>
          <span>Горизонтальных импостов: <b className="text-slate-700">{totalHorizontalImposts}</b></span>
          <span>Стекольных ячеек: <b className="text-slate-700">{glassCellsCount(product)}</b></span>
        </div>
      </Card>

      <Card
        title={`Секции (${product.sections.length})`}
        action={
          <Button variant="secondary" onClick={addSection}>
            + Секция
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          {product.sections.map((sec, idx) => (
            <div key={sec.id} className="rounded-lg border border-slate-200 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Секция {idx + 1}</span>
                {product.sections.length > 1 && (
                  <button onClick={() => removeSection(sec.id)} className="text-xs text-red-500 hover:underline">
                    удалить
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <Field label="Ширина, мм">
                  <NumberInput value={Math.round(sec.widthMm)} onChange={(e) => onChangeSection(sec.id, { widthMm: Number(e.target.value) || 1 })} min={100} step={10} />
                </Field>
                <Field label="Тип открывания">
                  <SelectInput
                    value={sec.opening}
                    onChange={(v) => onChangeSection(sec.id, { opening: v })}
                    options={Object.entries(OPENING_TYPE_LABELS).map(([value, label]) => ({ value: value as Section['opening'], label }))}
                  />
                </Field>
                <Field label="Стекло">
                  <SelectInput
                    value={sec.glassTypeId}
                    onChange={(v) => {
                      const g = glassTypes.find((x) => x.id === v);
                      onChangeSection(sec.id, { glassTypeId: v, glassThicknessMm: g?.thicknessMm ?? sec.glassThicknessMm });
                    }}
                    options={glassTypes.map((g) => ({ value: g.id, label: `${GLASS_KIND_LABELS[g.kind]}, ${g.thicknessMm}мм` }))}
                  />
                </Field>
                <Field label="Горизонт. импосты" hint={sec.opening !== 'fixed' ? 'не учитывается в полотне двери' : undefined}>
                  <NumberInput
                    value={sec.horizontalImposts}
                    onChange={(e) => onChangeSection(sec.id, { horizontalImposts: Math.max(0, Number(e.target.value) || 0) })}
                    min={0}
                    max={6}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Декоративные раскладки (молдинги)">
        <Checkbox checked={product.verticalMoldings.enabled} onChange={(v) => onChange({ verticalMoldings: { ...product.verticalMoldings, enabled: v } })} label="Вертикальные" />
        {product.verticalMoldings.enabled && (
          <div className="grid grid-cols-2 gap-x-3 mb-2">
            <Field label="Шаг, мм">
              <NumberInput value={product.verticalMoldings.stepMm} onChange={(e) => onChange({ verticalMoldings: { ...product.verticalMoldings, stepMm: Number(e.target.value) || 100 } })} min={100} step={10} />
            </Field>
            <Field label="Ширина, мм">
              <NumberInput value={product.verticalMoldings.widthMm} onChange={(e) => onChange({ verticalMoldings: { ...product.verticalMoldings, widthMm: Number(e.target.value) || 10 } })} min={10} step={5} />
            </Field>
          </div>
        )}
        <Checkbox checked={product.horizontalMoldings.enabled} onChange={(v) => onChange({ horizontalMoldings: { ...product.horizontalMoldings, enabled: v } })} label="Горизонтальные" />
        {product.horizontalMoldings.enabled && (
          <div className="grid grid-cols-2 gap-x-3">
            <Field label="Шаг, мм">
              <NumberInput value={product.horizontalMoldings.stepMm} onChange={(e) => onChange({ horizontalMoldings: { ...product.horizontalMoldings, stepMm: Number(e.target.value) || 100 } })} min={100} step={10} />
            </Field>
            <Field label="Ширина, мм">
              <NumberInput value={product.horizontalMoldings.widthMm} onChange={(e) => onChange({ horizontalMoldings: { ...product.horizontalMoldings, widthMm: Number(e.target.value) || 10 } })} min={10} step={5} />
            </Field>
          </div>
        )}
      </Card>

      <Card title="Профиль и покраска">
        <Field label="Профильная система">
          <SelectInput
            value={product.profileSystemId}
            onChange={(v) => onChange({ profileSystemId: v })}
            options={profileSystems.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Field>
        <Field label="Покрытие / цвет">
          <SelectInput value={product.paintOptionId} onChange={(v) => onChange({ paintOptionId: v })} options={paintOptions.map((p) => ({ value: p.id, label: p.label }))} />
        </Field>
      </Card>

      <Card title="Фурнитура и опции">
        <Checkbox checked={product.syncOpening} onChange={(v) => onChange({ syncOpening: v })} label="Синхронное открывание" />
        <Checkbox checked={product.closerEnabled} onChange={(v) => onChange({ closerEnabled: v })} label="Доводчик" />
        <Checkbox checked={product.lockEnabled} onChange={(v) => onChange({ lockEnabled: v })} label="Замок" />
      </Card>

      <Card title="Монтаж, доставка, доп. услуги">
        {serviceOptions.map((svc) => (
          <Checkbox
            key={svc.id}
            checked={product.selectedServiceIds.includes(svc.id)}
            onChange={(checked) =>
              onChange({
                selectedServiceIds: checked
                  ? [...product.selectedServiceIds, svc.id]
                  : product.selectedServiceIds.filter((id) => id !== svc.id),
              })
            }
            label={svc.label}
          />
        ))}
      </Card>
    </div>
  );
}
