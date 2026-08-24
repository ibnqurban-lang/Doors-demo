import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calculateProject } from '../calc/engine';
import { resolveProfileColor } from '../calc/color';
import { svgElementToPngDataUrl, downloadDataUrl, downloadTextFile } from '../lib/snapshot';
import LeftPanel from '../components/LeftPanel';
import CostPanel from '../components/CostPanel';
import SchemeSVG from '../components/SchemeSVG';
import Scene3D, { INTERIOR_PRESETS, type DisplayMode, type InteriorPreset, type Scene3DHandle, type ViewPreset } from '../components/Scene3D';
import { Button, SelectInput, TextInput, Field } from '../components/ui';
import type { ClientInfo, ProductConfig, Section } from '../types';

export default function ConfiguratorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = useStore((s) => s.projects.find((p) => p.id === id));
  const updateProject = useStore((s) => s.updateProject);
  const profiles = useStore((s) => s.profiles);
  const profileSystems = useStore((s) => s.profileSystems);
  const glassTypes = useStore((s) => s.glassTypes);
  const hardwareItems = useStore((s) => s.hardwareItems);
  const paintOptions = useStore((s) => s.paintOptions);
  const ralColors = useStore((s) => s.ralColors);
  const serviceOptions = useStore((s) => s.serviceOptions);
  const formulas = useStore((s) => s.formulas);
  const markup = useStore((s) => s.markup);

  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('technical');
  const [interior, setInterior] = useState<InteriorPreset>('living');
  const [cameraView, setCameraView] = useState<ViewPreset>('iso');
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(false);

  const svgWrapRef = useRef<HTMLDivElement>(null);
  const scene3DHandle = useRef<Scene3DHandle | null>(null);

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

  const patchProduct = (patch: Partial<ProductConfig>) => {
    updateProject({ ...project, product: { ...project.product, ...patch } });
  };
  const patchSection = (sectionId: string, patch: Partial<Section>) => {
    patchProduct({ sections: project.product.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)) });
  };
  const patchClient = (patch: Partial<ClientInfo>) => {
    updateProject({ ...project, client: { ...project.client, ...patch } });
  };

  const profileColorHex = resolveProfileColor(paintOptions.find((p) => p.id === project.product.paintOptionId), ralColors);
  const ral = ralColors.find((r) => r.id === paintOptions.find((p) => p.id === project.product.paintOptionId)?.ralId);

  const saveSnapshot = (dataUrl: string) => {
    updateProject({ ...project, snapshots: [...project.snapshots, dataUrl].slice(-8) });
  };

  const handleSnapshot = async () => {
    if (viewMode === '3d' && scene3DHandle.current) {
      const url = scene3DHandle.current.snapshot();
      if (url) {
        saveSnapshot(url);
        downloadDataUrl(url, `${project.client.orderNumber}-3d.png`);
      }
      return;
    }
    const svg = svgWrapRef.current?.querySelector('svg');
    if (svg) {
      const url = await svgElementToPngDataUrl(svg as SVGSVGElement, 1200, 800);
      saveSnapshot(url);
      downloadDataUrl(url, `${project.client.orderNumber}-scheme.png`);
    }
  };

  const handleExportCsv = () => {
    const header = ['Наименование', 'Артикул', 'Количество', 'Ед.изм', 'Цена', 'Стоимость', 'Длина (м)', 'Площадь (м2)', 'Вес (кг)', 'Комментарий'];
    const rows = calc.spec.map((r) => [
      r.name,
      r.article,
      String(r.qty),
      r.unit,
      String(r.price),
      String(r.cost),
      r.lengthM != null ? String(r.lengthM) : '',
      r.areaSqm != null ? String(r.areaSqm) : '',
      r.weightKg != null ? String(r.weightKg) : '',
      r.comment ?? '',
    ]);
    const csv = [header, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    downloadTextFile(csv, `Спецификация-${project.client.orderNumber}.csv`);
  };

  return (
    <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600">
            ← к проектам
          </button>
          <span className="font-semibold text-slate-800">Заказ {project.client.orderNumber}</span>
          <span className="text-slate-500">{project.client.fullName}</span>
          <span className="text-slate-400">{project.client.phone}</span>
          <span className="text-slate-400">{project.client.address}</span>
        </div>
        <Button variant="ghost" onClick={() => setEditingClient((v) => !v)}>
          {editingClient ? 'Свернуть' : 'Изменить данные клиента'}
        </Button>
      </div>

      {editingClient && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-6">
          <Field label="ФИО клиента">
            <TextInput value={project.client.fullName} onChange={(e) => patchClient({ fullName: e.target.value })} />
          </Field>
          <Field label="Телефон">
            <TextInput value={project.client.phone} onChange={(e) => patchClient({ phone: e.target.value })} />
          </Field>
          <Field label="Адрес">
            <TextInput value={project.client.address} onChange={(e) => patchClient({ address: e.target.value })} />
          </Field>
          <Field label="Дизайнер">
            <TextInput value={project.client.designer} onChange={(e) => patchClient({ designer: e.target.value })} />
          </Field>
          <Field label="Дата">
            <TextInput type="date" value={project.client.date} onChange={(e) => patchClient({ date: e.target.value })} />
          </Field>
          <Field label="Комментарий">
            <TextInput value={project.client.comment} onChange={(e) => patchClient({ comment: e.target.value })} />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[320px_1fr_360px]">
        <div className="h-[calc(100vh-160px)]">
          <LeftPanel
            product={project.product}
            onChange={patchProduct}
            onChangeSection={patchSection}
            profileSystems={profileSystems}
            glassTypes={glassTypes}
            paintOptions={paintOptions}
            serviceOptions={serviceOptions}
          />
        </div>

        <div className="flex h-[calc(100vh-160px)] flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              <button onClick={() => setViewMode('2d')} className={`rounded-md px-3 py-1 font-medium ${viewMode === '2d' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
                2D схема
              </button>
              <button onClick={() => setViewMode('3d')} className={`rounded-md px-3 py-1 font-medium ${viewMode === '3d' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
                3D модель
              </button>
            </div>

            {viewMode === '3d' && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                  <button onClick={() => setDisplayMode('technical')} className={`rounded-md px-3 py-1 font-medium ${displayMode === 'technical' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
                    Технический
                  </button>
                  <button onClick={() => setDisplayMode('presentation')} className={`rounded-md px-3 py-1 font-medium ${displayMode === 'presentation' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
                    Показать в интерьере
                  </button>
                </div>
                {displayMode === 'presentation' && (
                  <SelectInput value={interior} onChange={(v) => setInterior(v)} options={INTERIOR_PRESETS.map((p) => ({ value: p.id, label: p.label }))} className="w-44" />
                )}
                <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                  {(['front', 'side', 'top', 'iso'] as ViewPreset[]).map((v) => (
                    <button key={v} onClick={() => setCameraView(v)} className={`rounded-md px-2.5 py-1 text-xs font-medium ${cameraView === v ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
                      {{ front: 'Спереди', side: 'Сбоку', top: 'Сверху', iso: 'Под углом' }[v]}
                    </button>
                  ))}
                </div>
                <Button variant={open ? 'primary' : 'secondary'} onClick={() => setOpen((v) => !v)}>
                  {open ? '✕ Закрыть' : '▷ Открыть'}
                </Button>
              </div>
            )}
          </div>

          <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
            {viewMode === '2d' ? (
              <div ref={svgWrapRef} className="h-full w-full p-2">
                <SchemeSVG product={project.product} glassTypes={glassTypes} profileColorHex={profileColorHex} ral={ral} openState={open} />
              </div>
            ) : (
              <Scene3D
                product={project.product}
                glassTypes={glassTypes}
                profileColorHex={profileColorHex}
                mode={displayMode}
                interior={interior}
                open={open}
                view={cameraView}
                onReady={(h) => (scene3DHandle.current = h)}
              />
            )}
          </div>
          {viewMode === '2d' && (
            <div className="flex justify-center">
              <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
                {open ? '✕ Показать закрытым' : '▷ Показать открытым'}
              </Button>
            </div>
          )}
        </div>

        <div className="h-[calc(100vh-160px)]">
          <CostPanel calc={calc} markup={markup} onOpenKp={() => navigate(`/kp/${project.id}`)} onSnapshot={handleSnapshot} onExportCsv={handleExportCsv} />
        </div>
      </div>
    </div>
  );
}
