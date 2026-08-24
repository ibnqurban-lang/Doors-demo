import type { CalcResult, MarkupSettings } from '../types';
import { Button, Card, money } from './ui';

interface Props {
  calc: CalcResult;
  markup: MarkupSettings;
  onOpenKp: () => void;
  onSnapshot: () => void;
  onExportCsv: () => void;
}

const ROW_LABELS: [keyof CalcResult['totals'], string][] = [
  ['profileCost', 'Стоимость профиля'],
  ['glassCost', 'Стоимость стекла'],
  ['hardwareCost', 'Стоимость фурнитуры'],
  ['paintCost', 'Стоимость покраски'],
  ['servicesCost', 'Монтаж / доставка / услуги'],
];

export default function CostPanel({ calc, markup, onOpenKp, onSnapshot, onExportCsv }: Props) {
  const t = calc.totals;
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pl-1">
      <Card title="Расчёт стоимости">
        <div className="flex flex-col gap-1.5 text-sm">
          {ROW_LABELS.map(([key, label]) => (
            <div key={key} className="flex justify-between text-slate-600">
              <span>{label}</span>
              <span className="font-medium text-slate-800">{money(t[key] as number)}</span>
            </div>
          ))}
          <div className="my-1.5 border-t border-dashed border-slate-200" />
          <div className="flex justify-between text-slate-600">
            <span>Себестоимость</span>
            <span className="font-medium text-slate-800">{money(t.costPrice)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Наценка {markup.mode === 'percent' ? '' : '(фикс.)'}</span>
            <span className="font-medium text-slate-800">{money(t.markupAmount)}</span>
          </div>
          <div className="my-1.5 border-t border-slate-200" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-slate-700">Итоговая стоимость</span>
            <span className="text-xl font-bold text-indigo-700">{money(t.sellPrice)}</span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>
              Прибыль: <b className="text-emerald-600">{money(t.profit)}</b>
            </span>
            <span>
              Маржинальность: <b className="text-emerald-600">{t.marginPercent}%</b>
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>Площадь стекла: {calc.glassAreaSqm} м²</span>
            <span>Масса профиля: {calc.totalProfileWeightKg} кг</span>
          </div>
        </div>
      </Card>

      {calc.warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 text-xs text-amber-700">
          <ul className="list-disc space-y-1 pl-4">
            {calc.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Действия">
        <div className="flex flex-col gap-2">
          <Button onClick={onOpenKp}>📄 Создать КП</Button>
          <Button variant="secondary" onClick={onSnapshot}>
            📷 Сделать снимок
          </Button>
          <Button variant="secondary" onClick={onExportCsv}>
            ⬇ Экспорт спецификации (CSV/Excel)
          </Button>
        </div>
      </Card>

      <Card title="Спецификация материалов" className="flex-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-400">
                <th className="py-1 pr-2 font-medium">Наименование</th>
                <th className="py-1 pr-2 font-medium">Арт.</th>
                <th className="py-1 pr-2 text-right font-medium">Кол-во</th>
                <th className="py-1 pr-2 font-medium">Ед.</th>
                <th className="py-1 pr-2 text-right font-medium">Цена</th>
                <th className="py-1 pr-2 text-right font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {calc.spec.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="py-1.5 pr-2 text-slate-700">
                    {row.name}
                    {row.comment && <div className="text-[10px] text-slate-400">{row.comment}</div>}
                  </td>
                  <td className="py-1.5 pr-2 text-slate-400">{row.article}</td>
                  <td className="py-1.5 pr-2 text-right text-slate-600">{row.qty}</td>
                  <td className="py-1.5 pr-2 text-slate-400">{row.unit}</td>
                  <td className="py-1.5 pr-2 text-right text-slate-600">{money(row.price)}</td>
                  <td className="py-1.5 pr-2 text-right font-medium text-slate-800">{money(row.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
