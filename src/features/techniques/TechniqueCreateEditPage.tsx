import { type FormEvent, useState } from 'react';
import { callTechniquesAdmin, type Technique, type MutationPayload } from './api';

const CATEGORY_OPTIONS = [
  { category: 'guard', category_name: 'Guards' },
  { category: 'position', category_name: 'Positions' },
  { category: 'guardPass', category_name: 'Passes' },
  { category: 'guardRetention', category_name: 'Guard Retention' },
  { category: 'sweep', category_name: 'Sweeps' },
  { category: 'takedown', category_name: 'Takedowns' },
  { category: 'submission', category_name: 'Submissions' },
  { category: 'transition', category_name: 'Transitions' },
  { category: 'guardPull', category_name: 'Guard Pull' },
  { category: 'escape', category_name: 'Escapes' },
];

export type CreateEditPageProps = {
  item?: Technique | null;
  onSuccess: () => void;
  onCancel: () => void;
};

const emptyForm = {
  name: '',
  aliases: [] as string[],
  category: '',
  category_name: '',
  description: '',
  history: '',
  modern_usage: '',
};

export function TechniqueCreateEditPage({ item, onSuccess, onCancel }: CreateEditPageProps) {
  const initialForm = item
    ? {
        name: item.name,
        aliases: item.aliases ?? [],
        category: item.category ?? '',
        category_name: item.category_name ?? '',
        description: item.description ?? '',
        history: item.history ?? '',
        modern_usage: item.modern_usage ?? '',
      }
    : emptyForm;

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(item);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEditing) {
        // Build payload with only changed fields
        const payload: MutationPayload = { id: item!.id };

        // Compare arrays by stringifying them for simplicity
        const aliasesChanged =
          JSON.stringify(form.aliases.filter(a => a.trim())) !== JSON.stringify(initialForm.aliases);

        if (form.name !== initialForm.name) payload.name = form.name;
        if (aliasesChanged) payload.aliases = form.aliases.filter(a => a.trim());
        if (form.category !== initialForm.category) payload.category = form.category || null;
        if (form.category_name !== initialForm.category_name) payload.category_name = form.category_name || null;
        if (form.description !== initialForm.description) payload.description = form.description || null;
        if (form.history !== initialForm.history) payload.history = form.history || null;
        if (form.modern_usage !== initialForm.modern_usage) payload.modern_usage = form.modern_usage || null;

        await callTechniquesAdmin('update', payload);
      } else {
        await callTechniquesAdmin('insert', {
          name: form.name,
          aliases: form.aliases.filter(a => a.trim()),
          category: form.category || null,
          category_name: form.category_name || null,
          description: form.description || null,
          history: form.history || null,
          modern_usage: form.modern_usage || null,
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save technique');
    } finally {
      setSaving(false);
    }
  }

  function addAlias() {
    setForm(current => ({ ...current, aliases: [...current.aliases, ''] }));
  }

  function removeAlias(index: number) {
    setForm(current => ({
      ...current,
      aliases: current.aliases.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-blue-600 hover:underline mb-2"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold">{isEditing ? 'Edit technique' : 'Create technique'}</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-md border border-gray-200 bg-white p-6 shadow-sm"
      >
        {error && <p className="rounded bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={e => setForm(current => ({ ...current, name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="e.g. Armbar"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.category ?? ''}
            onChange={e => {
              const val = e.target.value;
              const option = CATEGORY_OPTIONS.find(o => o.category === val);
              setForm(current => ({
                ...current,
                category: val,
                category_name: option ? option.category_name : '',
              }));
            }}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {CATEGORY_OPTIONS.map(opt => (
              <option
                key={opt.category}
                value={opt.category}
              >
                {opt.category_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aliases</label>
          <div className="space-y-2">
            {form.aliases.map((alias, idx) => (
              <div
                key={idx}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={alias}
                  onChange={e => {
                    const newAliases = [...form.aliases];
                    newAliases[idx] = e.target.value;
                    setForm(current => ({ ...current, aliases: newAliases }));
                  }}
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Bar"
                />
                <button
                  type="button"
                  onClick={() => removeAlias(idx)}
                  className="rounded border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAlias}
              className="rounded border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-50 text-white"
            >
              + Add alias
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(current => ({ ...current, description: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Brief description of the technique"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">History</label>
          <textarea
            value={form.history}
            onChange={e => setForm(current => ({ ...current, history: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Historical background of the technique"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modern usage</label>
          <textarea
            value={form.modern_usage}
            onChange={e => setForm(current => ({ ...current, modern_usage: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="How the technique is used in modern practice"
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create technique'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
