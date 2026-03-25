'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import LimitlessDropdown from '@/components/limitless-dropdown';

type MockItem = {
  id: number;
  name: string;
  email: string;
};

const generateItems = (page: number, pageSize: number = 50): MockItem[] => {
  const start = page * pageSize;
  return Array.from({ length: pageSize }, (_, i) => ({
    id: start + i,
    name: `User ${start + i + 1}`,
    email: `user${start + i + 1}@example.com`,
  }));
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function LimitlessDropdownDemo() {
  const [items, setItems] = useState<MockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [value, setValue] = useState<MockItem | null>(null);
  const initialized = useRef(false);

  const loadInitial = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;
    setIsLoading(true);
    await delay(600);
    setItems(generateItems(0));
    setPage(1);
    setHasNextPage(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage) return;
    setIsFetchingNextPage(true);
    await delay(500);
    const nextItems = generateItems(page);
    setItems((prev) => [...prev, ...nextItems]);
    setPage((p) => p + 1);
    setHasNextPage(page < 9);
    setIsFetchingNextPage(false);
  }, [page, isFetchingNextPage, hasNextPage]);

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    if (!newSearch) {
      setItems(generateItems(0));
      setPage(1);
      setHasNextPage(true);
      return;
    }
    const filtered = generateItems(0, 200).filter(
      (item) =>
        item.name.toLowerCase().includes(newSearch.toLowerCase()) ||
        item.email.toLowerCase().includes(newSearch.toLowerCase())
    );
    setItems(filtered.slice(0, 50));
    setHasNextPage(filtered.length > 50);
    setPage(1);
  }, []);

  return (
    <LimitlessDropdown<MockItem>
      items={items}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      onLoadMore={loadMore}
      search={search}
      onSearchChange={handleSearchChange}
      label="Select a user..."
      single
      value={value}
      onChange={(val) => setValue(val as MockItem)}
      nameSet={(item) => `${item.name} <${item.email}>`}
      idSet="id"
      className="w-full"
    />
  );
}
