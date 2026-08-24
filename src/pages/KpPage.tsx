import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculateProject } from '../calc/engine';
import { resolveProfileColor } from '../calc/color';
import { downloadTextFile } from '../lib/snapshot';
import SchemeSVG from '../components/SchemeSVG';
import { Button, money } from '../components/ui';
import { PRODUCT_TYPE_LABELS } from '../types';

export default function KpPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const profiles = useStore((s) => s.profiles);
  const glassTypes = useStore((s) => s.glassTypes);
  const hardwareItems = useStore((s) => s.hardwareItems);
  const paintOptions = useStore((s) => s.paintOptions);
  const ralColors = useStore((s) => s.ralColors);
  const serviceOptions = useStore((s) => s.serviceOptions);
  const formulas = useStore((s) => s.formulas);
  const markup = useStore((s) => s.markup);

  const [payment, setPayment] = useState('50% предоплата при подписании договора, 50% — по факту монтажа');
  const [leadTime, setLeadTime] = useState('10–14 рабочих дней с момента внесения предоплаты и утверждения замера');
  const [warranty, setWarranty] = useState('24 месяца на конструкцию, 12 месяцев на фурнитуру');

  const calc = useMemo(() => {
    if (!project) return null;
    return calculateProject(project, { profiles, glassTypes, hardwareItems, paintOptions, serviceOptions, formulas, markup });
  }, [project, profiles, glassTypes, hardwareItems, paintOptions, serviceOptions, formulas, markup]);

  if (!project || !calc) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center text-slate-500">
        Проект не найден.
        <div className="mt-4">
          <Button onClick={() => navigate('/')}>К списку проектов</Button>
        </div>
      </div>
    );
  }

  const profileColorHex = resolveProfileColor(paintOptions.find((p) => p.id === project.product.paintOptionId), ralColors);
  const sketch = project.snapshots[project.snapshots.length - 1];

  const groups: { group: string; rows: typeof calc.spec }[] = ['Профиль', 'Стекло', 'Фурнитура', 'Покраска', 'Услуги'].map((g) => ({
    group: g,
    rows: calc.spec.filter((r) => r.group === g),
  }));

  const exportExcel = () => {
    const header = ['Наименование', 'Артикул', 'Количество', 'Ед.изм', 'Цена', 'Стоимость'];
    const rows = calc.spec.map((r) => [r.name, r.article, String(r.qty), r.unit, String(r.price), String(r.cost)]);
    const csv = [header, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    downloadTextFile(csv, `КП-${project.client.orderNumber}.csv`);
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
        <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-600">
          ← назад к конфигуратору
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportExcel}>
            ⬇ Excel (CSV)
          </Button>
          <Button onClick={() => window.print()}>🖨 Печать / PDF</Button>
        </div>
      </div>

      <div className="no-print mb-4 grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Условия оплаты</span>
          <textarea value={payment} onChange={(e) => setPayment(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm" rows={2} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Срок изготовления</span>
          <textarea value={leadTime} onChange={(e) => setLeadTime(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm" rows={2} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Гарантия</span>
          <textarea value={warranty} onChange={(e) => setWarranty(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2 text-sm" rows={2} />
        </label>
      </div>

      {/* Печатный документ */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <div className="mb-6 flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">L</div>
            <div>
              <div className="text-lg font-bold text-slate-800">LoftCalc</div>
              <div className="text-xs text-slate-400">Алюминиевые Loft-перегородки и двери на заказ</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold text-slate-700">Коммерческое предложение</div>
            <div className="text-slate-400">№ {project.client.orderNumber} от {project.client.date}</div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-slate-400">Клиент: </span>
            <span className="font-medium text-slate-700">{project.client.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400">Телефон: </span>
            <span className="font-medium text-slate-700">{project.client.phone}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400">Адрес объекта: </span>
            <span className="font-medium text-slate-700">{project.client.address}</span>
          </div>
          {project.client.designer && (
            <div>
              <span className="text-slate-400">Дизайнер: </span>
              <span className="font-medium text-slate-700">{project.client.designer}</span>
            </div>
          )}
          <div>
            <span className="text-slate-400">Изделие: </span>
            <span className="font-medium text-slate-700">{PRODUCT_TYPE_LABELS[project.product.productTypeId]}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-slate-700">Эскиз изделия</div>
          <div className="flex h-72 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {sketch ? (
              <img src={sketch} alt="Эскиз изделия" className="h-full w-full object-contain" />
            ) : (
              <SchemeSVG product={project.product} glassTypes={glassTypes} profileColorHex={profileColorHex} />
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Габариты: {Math.round(project.product.widthMm)} × {Math.round(project.product.heightMm)} мм · Площадь остекления: {calc.glassAreaSqm} м²
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-slate-700">Спецификация</div>
          {groups.filter((g) => g.rows.length > 0).map((g) => (
            <div key={g.group} className="mb-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{g.group}</div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-400">
                    <th className="py-1 font-medium">Наименование</th>
                    <th className="py-1 font-medium">Арт.</th>
                    <th className="py-1 text-right font-medium">Кол-во</th>
                    <th className="py-1 font-medium">Ед.</th>
                    <th className="py-1 text-right font-medium">Цена</th>
                    <th className="py-1 text-right font-medium">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="py-1 text-slate-700">{r.name}</td>
                      <td className="py-1 text-slate-400">{r.article}</td>
                      <td className="py-1 text-right text-slate-600">{r.qty}</td>
                      <td className="py-1 text-slate-400">{r.unit}</td>
                      <td className="py-1 text-right text-slate-600">{money(r.price)}</td>
                      <td className="py-1 text-right font-medium text-slate-800">{money(r.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mb-6 flex justify-end">
          <div className="w-72 rounded-lg bg-slate-50 p-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Себестоимость</span>
              <span>{money(calc.totals.costPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Наценка</span>
              <span>{money(calc.totals.markupAmount)}</span>
            </div>
            <div className="my-2 border-t border-slate-200" />
            <div className="flex items-baseline justify-between">
              <span className="font-semibold text-slate-700">Итого к оплате</span>
              <span className="text-xl font-bold text-indigo-700">{money(calc.totals.sellPrice)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <div>
            <div className="mb-1 font-semibold text-slate-600">Условия оплаты</div>
            <div className="whitespace-pre-line">{payment}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-slate-600">Срок изготовления</div>
            <div className="whitespace-pre-line">{leadTime}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-slate-600">Гарантия</div>
            <div className="whitespace-pre-line">{warranty}</div>
          </div>
        </div>

        {project.client.comment && (
          <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">Комментарий: {project.client.comment}</div>
        )}
      </div>
    </div>
  );
}
