import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PRODUCT_TYPE_LABELS, type ClientInfo, type ProductTypeId } from '../types';
import { Button, Card, Field, TextInput, Badge } from '../components/ui';

const PRODUCT_TYPES = Object.entries(PRODUCT_TYPE_LABELS) as [ProductTypeId, string][];

function emptyClient(): ClientInfo {
  const today = new Date().toISOString().slice(0, 10);
  return {
    fullName: '',
    phone: '',
    address: '',
    designer: '',
    date: today,
    orderNumber: `З-${Math.floor(1000 + Math.random() * 9000)}`,
    comment: '',
  };
}

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const createProject = useStore((s) => s.createProject);
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientInfo>(emptyClient());
  const [productTypeId, setProductTypeId] = useState<ProductTypeId>('partition');

  const set = <K extends keyof ClientInfo>(k: K, v: ClientInfo[K]) => setClient((c) => ({ ...c, [k]: v }));

  const submit = () => {
    const project = createProject(client, productTypeId);
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Новый проект</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 px-6 pt-4">
          <Field label="ФИО клиента">
            <TextInput value={client.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Иванов Иван Иванович" />
          </Field>
          <Field label="Телефон">
            <TextInput value={client.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+7 900 000-00-00" />
          </Field>
          <Field label="Адрес объекта">
            <TextInput value={client.address} onChange={(e) => set('address', e.target.value)} placeholder="г. Москва, ул. ..." />
          </Field>
          <Field label="Дизайнер (при необходимости)">
            <TextInput value={client.designer} onChange={(e) => set('designer', e.target.value)} />
          </Field>
          <Field label="Дата">
            <TextInput type="date" value={client.date} onChange={(e) => set('date', e.target.value)} />
          </Field>
          <Field label="Номер заказа">
            <TextInput value={client.orderNumber} onChange={(e) => set('orderNumber', e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Field label="Комментарий">
              <TextInput value={client.comment} onChange={(e) => set('comment', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="px-6 pb-2">
          <span className="mb-2 block text-xs font-medium text-slate-500">Тип изделия</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PRODUCT_TYPES.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setProductTypeId(id)}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                  productTypeId === id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!client.fullName || !client.phone}>
            Создать и открыть конфигуратор
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const projects = useStore((s) => s.projects);
  const deleteProject = useStore((s) => s.deleteProject);
  const duplicateProject = useStore((s) => s.duplicateProject);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.client.fullName, p.client.phone, p.client.orderNumber, p.client.address, p.client.date].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  }, [projects, query]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">База проектов</h1>
          <p className="text-sm text-slate-500">Поиск по клиенту, телефону, номеру заказа, адресу или дате</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Новый проект</Button>
      </div>

      <div className="mb-4 max-w-md">
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: клиент, телефон, № заказа, адрес, дата..."
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center text-sm text-slate-400 py-14">
          {projects.length === 0 ? 'Проектов пока нет — создайте первый.' : 'Ничего не найдено.'}
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">№ заказа</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Адрес</th>
                <th className="px-4 py-3 font-medium">Изделие</th>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Обновлён</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-700">{p.client.orderNumber}</td>
                  <td className="px-4 py-3">{p.client.fullName}</td>
                  <td className="px-4 py-3 text-slate-500">{p.client.phone}</td>
                  <td className="px-4 py-3 text-slate-500">{p.client.address}</td>
                  <td className="px-4 py-3">
                    <Badge tone="indigo">{PRODUCT_TYPE_LABELS[p.product.productTypeId]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.client.date}</td>
                  <td className="px-4 py-3 text-slate-400">{new Date(p.updatedAt).toLocaleString('ru-RU')}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="secondary" onClick={() => navigate(`/project/${p.id}`)}>
                        Открыть
                      </Button>
                      <Button variant="ghost" onClick={() => duplicateProject(p.id)} title="Дублировать">
                        ⧉
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (confirm('Удалить проект?')) deleteProject(p.id);
                        }}
                        title="Удалить"
                      >
                        🗑
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
