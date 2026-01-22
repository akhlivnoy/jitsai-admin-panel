import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { callTechniquesAdmin, searchTechniques, PAGE_SIZE, type Technique } from './api';
import { TechniqueCreateEditPage } from './TechniqueCreateEditPage';

export function TechniquesPanel() {
  const [items, setItems] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<Technique | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  async function load(resetList = true) {
    if (!resetList && loadingMore) return;
    (resetList ? setLoading : setLoadingMore)(true);
    setError(null);
    try {
      const newOffset = resetList ? 0 : offset;
      const data = await searchTechniques(search, null, PAGE_SIZE, newOffset);
      const isFullPage = data.length === PAGE_SIZE;
      setHasMore(isFullPage);
      if (resetList) {
        setItems(data);
        setOffset(newOffset + PAGE_SIZE);
      } else {
        setItems(current => [...current, ...data]);
        setOffset(newOffset + PAGE_SIZE);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load techniques');
      setHasMore(false);
    } finally {
      (resetList ? setLoading : setLoadingMore)(false);
    }
  }

  useEffect(() => {
    setOffset(0);
    setItems([]);
    setHasMore(true);
    load(true);
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && hasMore && !loading && !loadingMore && items.length > 0) {
          load(false);
        }
      },
      { threshold: 0.1 },
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, items.length]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this technique?')) return;
    setError(null);
    try {
      await callTechniquesAdmin('remove', { id });
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete technique');
    }
  }

  if (isCreating) {
    return (
      <TechniqueCreateEditPage
        onSuccess={() => {
          setIsCreating(false);
          load(true);
        }}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (editingItem) {
    return (
      <TechniqueCreateEditPage
        item={editingItem}
        onSuccess={() => {
          setEditingItem(null);
          load(true);
        }}
        onCancel={() => setEditingItem(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Techniques admin</p>
          <h1 className="text-xl font-semibold">Manage techniques</h1>
          <div className="mt-3 flex-row">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search techniques..."
              className="w-full max-w-2xl rounded-md border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
            />
            <div className="flex items-start gap-2 ml-4">
              <button
                type="button"
                onClick={() => load(true)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 text-white"
                disabled={loading}
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + New technique
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold">Techniques</h2>
          <span className="text-sm text-gray-500">{items.length} loaded</span>
        </div>
        {loading && items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">Loading...</p>
        ) : error && items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">No techniques found.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-100">
              {items.map(item => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      {item.category_name && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {item.category_name}
                        </span>
                      )}
                    </div>
                    {item.aliases && item.aliases.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.aliases.map((a, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700 border border-blue-100"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {hasMore && (
              <div
                ref={observerTarget}
                className="border-t border-gray-100 px-4 py-4 text-center"
              >
                {loadingMore ? (
                  <p className="text-sm text-gray-500">Loading more...</p>
                ) : (
                  <p className="text-xs text-gray-400">Scroll to load more</p>
                )}
              </div>
            )}
            {!hasMore && items.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-3 text-center">
                <p className="text-xs text-gray-400">No more techniques</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
