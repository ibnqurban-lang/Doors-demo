import { Button } from './ui';

export interface Column<T> {
  key: keyof T;
  label: string;
  type: 'text' | 'number' | 'select' | 'color';
  options?: { value: string; label: string }[];
  width?: string;
  /** для select-колонок, хранящих числовое значение (напр. толщина стекла) */
  numeric?: boolean;
}

interface Props<T extends { id: string }> {
  items: T[];
  columns: Column<T>[];
  onUpsert: (item: T) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

export default function GenericTable<T extends { id: string }>({ items, columns, onUpsert, onRemove, onAdd }: Props<T>) {
  const setField = (item: T, key: keyof T, raw: string) => {
    const col = columns.find((c) => c.key === key);
    const value = col?.type === 'number' || col?.numeric ? Number(raw) : raw;
    onUpsert({ ...item, [key]: value });
  };

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Button variant="secondary" onClick={onAdd}>
          + Добавить позицию
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className="whitespace-nowrap px-2 py-2 font-medium text-slate-500" style={{ width: c.width }}>
                  {c.label}
                </th>
              ))}
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                {columns.map((c) => (
                  <td key={String(c.key)} className="px-2 py-1.5">
                    {c.type === 'select' ? (
                      <select
                        value={String(item[c.key] ?? '')}
                        onChange={(e) => setField(item, c.key, e.target.value)}
                        className="w-full rounded border border-slate-200 bg-white px-1.5 py-1 text-xs"
                      >
                        {c.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : c.type === 'color' ? (
                      <input
                        type="color"
                        value={String(item[c.key] ?? '#000000')}
                        onChange={(e) => setField(item, c.key, e.target.value)}
                        className="h-7 w-12 cursor-pointer rounded border border-slate-200"
                      />
                    ) : (
                      <input
                        type={c.type === 'number' ? 'number' : 'text'}
                        value={String(item[c.key] ?? '')}
                        onChange={(e) => setField(item, c.key, e.target.value)}
                        className="w-full rounded border border-slate-200 px-1.5 py-1 text-xs"
                      />
                    )}
                  </td>
                ))}
                <td className="px-2 py-1.5 text-right">
                  <button onClick={() => onRemove(item.id)} className="text-red-400 hover:text-red-600">
                    🗑
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-2 py-6 text-center text-slate-400">
                  Список пуст
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
