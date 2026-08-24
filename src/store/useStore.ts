import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type {
  Profile,
  ProfileSystem,
  GlassType,
  RalColor,
  PaintOption,
  HardwareItem,
  ServiceOption,
  MaterialItem,
  MarkupSettings,
  FormulaSettings,
  Project,
  ClientInfo,
  ProductTypeId,
} from '../types';
import {
  profileSystems as seedProfileSystems,
  profiles as seedProfiles,
  glassTypes as seedGlassTypes,
  ralColors as seedRalColors,
  paintOptions as seedPaintOptions,
  hardwareItems as seedHardwareItems,
  serviceOptions as seedServiceOptions,
  materials as seedMaterials,
  defaultMarkup,
  defaultFormulas,
  buildDefaultSections,
} from '../data/seed';

// ---------------------------------------------------------------------------
// Это и есть "база данных" приложения: всё хранится как данные (localStorage
// через persist), ничего не зашито в код компонентов. Администратор меняет
// цены/нормы/формулы через Admin-экраны — калькулятор пересчитывается сам.
// ---------------------------------------------------------------------------

interface DbState {
  profileSystems: ProfileSystem[];
  profiles: Profile[];
  glassTypes: GlassType[];
  ralColors: RalColor[];
  paintOptions: PaintOption[];
  hardwareItems: HardwareItem[];
  serviceOptions: ServiceOption[];
  materials: MaterialItem[];
  markup: MarkupSettings;
  formulas: FormulaSettings;
  projects: Project[];
}

interface DbActions {
  upsertProfile: (p: Profile) => void;
  removeProfile: (id: string) => void;
  upsertGlassType: (g: GlassType) => void;
  removeGlassType: (id: string) => void;
  upsertHardware: (h: HardwareItem) => void;
  removeHardware: (id: string) => void;
  upsertPaintOption: (p: PaintOption) => void;
  removePaintOption: (id: string) => void;
  upsertRal: (r: RalColor) => void;
  removeRal: (id: string) => void;
  upsertService: (s: ServiceOption) => void;
  removeService: (id: string) => void;
  upsertMaterial: (m: MaterialItem) => void;
  removeMaterial: (id: string) => void;
  setMarkup: (m: MarkupSettings) => void;
  setFormulas: (f: FormulaSettings) => void;

  createProject: (client: ClientInfo, productTypeId: ProductTypeId) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;

  resetToDefaults: () => void;
  exportAllJSON: () => string;
  importAllJSON: (json: string) => void;
}

export type StoreState = DbState & DbActions;

const initialDb: DbState = {
  profileSystems: seedProfileSystems,
  profiles: seedProfiles,
  glassTypes: seedGlassTypes,
  ralColors: seedRalColors,
  paintOptions: seedPaintOptions,
  hardwareItems: seedHardwareItems,
  serviceOptions: seedServiceOptions,
  materials: seedMaterials,
  markup: defaultMarkup,
  formulas: defaultFormulas,
  projects: [],
};

function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const copy = list.slice();
  copy[idx] = item;
  return copy;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialDb,

      upsertProfile: (p) => set((s) => ({ profiles: upsertById(s.profiles, p) })),
      removeProfile: (id) => set((s) => ({ profiles: s.profiles.filter((x) => x.id !== id) })),

      upsertGlassType: (g) => set((s) => ({ glassTypes: upsertById(s.glassTypes, g) })),
      removeGlassType: (id) => set((s) => ({ glassTypes: s.glassTypes.filter((x) => x.id !== id) })),

      upsertHardware: (h) => set((s) => ({ hardwareItems: upsertById(s.hardwareItems, h) })),
      removeHardware: (id) => set((s) => ({ hardwareItems: s.hardwareItems.filter((x) => x.id !== id) })),

      upsertPaintOption: (p) => set((s) => ({ paintOptions: upsertById(s.paintOptions, p) })),
      removePaintOption: (id) => set((s) => ({ paintOptions: s.paintOptions.filter((x) => x.id !== id) })),

      upsertRal: (r) => set((s) => ({ ralColors: upsertById(s.ralColors, r) })),
      removeRal: (id) => set((s) => ({ ralColors: s.ralColors.filter((x) => x.id !== id) })),

      upsertService: (svc) => set((s) => ({ serviceOptions: upsertById(s.serviceOptions, svc) })),
      removeService: (id) => set((s) => ({ serviceOptions: s.serviceOptions.filter((x) => x.id !== id) })),

      upsertMaterial: (m) => set((s) => ({ materials: upsertById(s.materials, m) })),
      removeMaterial: (id) => set((s) => ({ materials: s.materials.filter((x) => x.id !== id) })),

      setMarkup: (m) => set({ markup: m }),
      setFormulas: (f) => set({ formulas: f }),

      createProject: (client, productTypeId) => {
        const widthMm = 1200;
        const heightMm = 2400;
        const project: Project = {
          id: uuid(),
          client,
          product: {
            productTypeId,
            widthMm,
            heightMm,
            sections: buildDefaultSections(productTypeId, widthMm),
            verticalMoldings: { enabled: false, stepMm: 300, widthMm: 20, thicknessMm: 20 },
            horizontalMoldings: { enabled: false, stepMm: 300, widthMm: 20, thicknessMm: 20 },
            profileSystemId: 'sys-standard40',
            mainProfileId: 'p-std-main',
            paintOptionId: 'paint-powder-9005-matte',
            syncOpening: true,
            closerEnabled: false,
            lockEnabled: true,
            selectedServiceIds: ['srv-install', 'srv-delivery'],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          snapshots: [],
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        return project;
      },

      updateProject: (project) => {
        const updated = { ...project, updatedAt: new Date().toISOString() };
        set((s) => ({ projects: upsertById(s.projects, updated) }));
      },

      deleteProject: (id) => set((s) => ({ projects: s.projects.filter((x) => x.id !== id) })),

      duplicateProject: (id) => {
        const src = get().projects.find((p) => p.id === id);
        if (!src) return null;
        const copy: Project = {
          ...src,
          id: uuid(),
          client: { ...src.client, orderNumber: `${src.client.orderNumber}-копия` },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          snapshots: [],
        };
        set((s) => ({ projects: [copy, ...s.projects] }));
        return copy;
      },

      resetToDefaults: () => set({ ...initialDb, projects: get().projects }),

      exportAllJSON: () => JSON.stringify(get(), null, 2),

      importAllJSON: (json) => {
        try {
          const data = JSON.parse(json);
          set((s) => ({ ...s, ...data }));
        } catch {
          throw new Error('Некорректный JSON');
        }
      },
    }),
    { name: 'loft-calc-db' },
  ),
);
