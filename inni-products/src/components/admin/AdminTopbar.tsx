import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Loader2, Search, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  OrderNotification,
  useAdminNotificationStore,
} from '../../store/adminNotificationStore';
import { formatRoleLabel } from '../../lib/adminRoles';
import { AdminThemeToggle } from './AdminThemeToggle';
import { useAdminThemeClasses } from '../../lib/adminTheme';
import { cn } from '../../lib/utils';
import { useAdminSearchSuggestions } from '../../hooks/useAdminSearchSuggestions';
import { AdminSearchSuggestion } from '../../features/admin/adminSearchApi';
import { formatOrderStatusLabel } from '../../lib/orderStatuses';
import { OrderStatus } from '../../types';

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatClockDate(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatClockTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function HighlightText({
  html,
  fallback,
  className,
}: {
  html?: string;
  fallback: string;
  className?: string;
}) {
  if (html) {
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <span className={className}>{fallback}</span>;
}

function SearchSuggestionItem({
  suggestion,
  active,
  onSelect,
  t,
}: {
  suggestion: AdminSearchSuggestion;
  active: boolean;
  onSelect: () => void;
  t: ReturnType<typeof useAdminThemeClasses>;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      className={cn(
        'w-full text-left px-4 py-3 transition-colors',
        active ? 'bg-orange-500/10' : t.dropdownItemHover,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('text-sm font-medium truncate', t.heading)}>
            <HighlightText
              html={suggestion.highlight_order_number}
              fallback={suggestion.order_number}
            />
          </p>
          <p className={cn('text-xs mt-0.5 truncate', t.body)}>
            <HighlightText
              html={suggestion.highlight_customer_name}
              fallback={suggestion.customer_name || 'Guest'}
            />
            {suggestion.city ? (
              <>
                {' · '}
                <HighlightText
                  html={suggestion.highlight_city}
                  fallback={suggestion.city}
                />
              </>
            ) : null}
          </p>
        </div>
        <span className="text-xs text-orange-400 font-mono shrink-0">
          ₹{Number(suggestion.total_amount).toLocaleString('en-IN')}
        </span>
      </div>
      <p className={cn('text-[10px] uppercase tracking-wider mt-1', t.muted)}>
        {formatOrderStatusLabel(suggestion.status as OrderStatus)}
      </p>
    </button>
  );
}

export function AdminTopbar({
  scrollContainerRef,
}: {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
}) {
  const { user, role, isSuperAdmin } = useAuthStore();
  const notifications = useAdminNotificationStore((state) => state.notifications);
  const unreadCount = useAdminNotificationStore((state) => state.unreadCount);
  const dismissViewed = useAdminNotificationStore((state) => state.dismissViewed);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  /** Snapshot shown while the panel is open — removed from the store after one view. */
  const [viewedItems, setViewedItems] = useState<OrderNotification[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const t = useAdminThemeClasses();

  const {
    debouncedQuery,
    results: searchResults,
    source: searchSource,
    loading: searchLoading,
    error: searchError,
    showSuggestions,
    minQueryLength,
  } = useAdminSearchSuggestions(searchQuery, searchOpen);

  const accessLabel = isSuperAdmin ? 'Full Access' : formatRoleLabel(role ?? undefined);

  const closeNotifications = () => {
    setNotificationsOpen(false);
    setViewedItems([]);
  };

  useEffect(() => {
    if (!notificationsOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        closeNotifications();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return undefined;

    const onScroll = () => setScrolled(scrollContainer.scrollTop > 8);
    onScroll();
    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [scrollContainerRef]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [debouncedQuery, searchResults.length]);

  useEffect(() => {
    if (!searchOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const navigateToSearchResults = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    navigate(`/admin/orders/all?search=${encodeURIComponent(trimmed)}`);
  };

  const navigateToOrder = (orderId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/admin/orders/${orderId}`);
  };

  const handleGlobalSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (activeSuggestionIndex >= 0 && searchResults[activeSuggestionIndex]) {
      navigateToOrder(searchResults[activeSuggestionIndex].id);
      return;
    }

    navigateToSearchResults(query);
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchResults.length === 0) {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1,
      );
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setSearchOpen(false);
    }
  };

  const handleNotificationsToggle = () => {
    if (notificationsOpen) {
      closeNotifications();
      return;
    }

    setViewedItems(notifications);
    dismissViewed();
    setNotificationsOpen(true);
  };

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <header
      className={cn(
        'shrink-0 z-20 px-6 py-4 transition-all duration-300',
        scrolled
          ? cn('backdrop-blur-md border-b', t.topbar)
          : 'bg-transparent border-b border-transparent backdrop-blur-none',
      )}
    >
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Date & live clock */}
        <div className="shrink-0 min-w-[6.5rem] sm:min-w-[7.5rem]">
          <p className={cn('text-xs sm:text-sm font-semibold tracking-tight tabular-nums', t.heading)}>
            {formatClockDate(now)}
          </p>
          <p className={cn('text-[11px] sm:text-xs font-mono tabular-nums mt-0.5', t.muted)}>
            {formatClockTime(now)}
          </p>
        </div>

        {/* Global search */}
        <form
          onSubmit={handleGlobalSearch}
          className="flex-1 w-full max-w-xl mx-auto"
        >
          <div className="relative group" ref={searchRef}>
            <Search
              className={cn(
                'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors pointer-events-none z-10',
                t.muted,
                'group-focus-within:text-orange-400',
              )}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search orders, customers, cities..."
              autoComplete="off"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="admin-search-suggestions"
              aria-autocomplete="list"
              className={cn(
                'w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm transition-all duration-200',
                'focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10',
                t.input,
              )}
            />

            {searchOpen && searchQuery.trim().length > 0 && searchQuery.trim().length < minQueryLength && (
              <div
                className={cn(
                  'absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-xl border shadow-2xl overflow-hidden z-30',
                  t.dropdown,
                )}
              >
                <p className={cn('px-4 py-3 text-xs', t.muted)}>
                  Type at least {minQueryLength} characters for suggestions
                </p>
              </div>
            )}

            {searchOpen && showSuggestions && (
              <div
                id="admin-search-suggestions"
                role="listbox"
                className={cn(
                  'absolute left-0 right-0 top-[calc(100%+0.5rem)] rounded-xl border shadow-2xl overflow-hidden z-30',
                  '[&_mark]:bg-orange-500/30 [&_mark]:text-inherit [&_mark]:rounded-sm [&_mark]:px-0.5',
                  t.dropdown,
                )}
              >
                <div className={cn('px-4 py-2.5 border-b flex items-center justify-between gap-2', t.border)}>
                  <p className={cn('text-[11px] font-medium', t.muted)}>Suggestions</p>
                  {searchLoading ? (
                    <Loader2 className={cn('w-3.5 h-3.5 animate-spin', t.muted)} aria-hidden />
                  ) : (
                    <p className="text-[10px] text-orange-400/80 font-mono uppercase tracking-wider">
                      {searchSource === 'meilisearch' ? 'Typo-tolerant' : 'Database'}
                    </p>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {searchLoading && searchResults.length === 0 ? (
                    <p className={cn('px-4 py-6 text-sm text-center', t.muted)}>Searching…</p>
                  ) : searchError ? (
                    <p className={cn('px-4 py-6 text-sm text-center text-red-400')}>{searchError}</p>
                  ) : searchResults.length === 0 ? (
                    <p className={cn('px-4 py-6 text-sm text-center', t.muted)}>
                      No orders match &ldquo;{debouncedQuery}&rdquo;
                    </p>
                  ) : (
                    <ul className={cn('divide-y', t.divide)}>
                      {searchResults.map((suggestion, index) => (
                        <li key={suggestion.id} role="option" aria-selected={index === activeSuggestionIndex}>
                          <SearchSuggestionItem
                            suggestion={suggestion}
                            active={index === activeSuggestionIndex}
                            onSelect={() => navigateToOrder(suggestion.id)}
                            t={t}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {!searchLoading && debouncedQuery && (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => navigateToSearchResults(debouncedQuery)}
                    className={cn(
                      'w-full px-4 py-2.5 text-left text-xs font-medium border-t transition-colors',
                      t.border,
                      t.dropdownItemHover,
                      'text-orange-400',
                    )}
                  >
                    View all results for &ldquo;{debouncedQuery}&rdquo;
                  </button>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 shrink-0">
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={handleNotificationsToggle}
            className={cn(
              'relative p-2 rounded-lg border transition-colors cursor-pointer',
              t.iconBtn,
              notificationsOpen && t.iconBtnActive,
            )}
            aria-label={unreadCount > 0 ? `${unreadCount} new order notifications` : 'Notifications'}
            aria-expanded={notificationsOpen}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-[10px] font-semibold text-white flex items-center justify-center leading-none">
                {badgeLabel}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className={cn('absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border shadow-2xl overflow-hidden z-20', t.dropdown)}>
              <div className={cn('px-4 py-3 border-b flex items-center justify-between gap-3', t.border)}>
                <div>
                  <p className={cn('text-sm font-semibold', t.heading)}>Notifications</p>
                  <p className={cn('text-[11px] mt-0.5', t.muted)}>New order arrivals</p>
                </div>
                <Link
                  to="/admin/orders"
                  onClick={closeNotifications}
                  className="text-[11px] text-orange-400 hover:text-orange-300 font-medium"
                >
                  View orders
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {viewedItems.length === 0 ? (
                  <p className={cn('px-4 py-8 text-sm text-center', t.muted)}>
                    No new orders yet.
                  </p>
                ) : (
                  <ul className={cn('divide-y', t.divide)}>
                    {viewedItems.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={`/admin/orders/${item.id}`}
                          onClick={closeNotifications}
                          className={cn('block px-4 py-3 transition-colors', t.dropdownItemHover)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className={cn('text-sm font-medium truncate', t.heading)}>
                                New order {item.orderNumber}
                              </p>
                              <p className={cn('text-xs mt-0.5 truncate', t.body)}>
                                {item.customerName}
                              </p>
                            </div>
                            <span className={cn('text-[10px] font-mono shrink-0', t.muted)}>
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-orange-400 font-mono mt-1">
                            ₹{Number(item.totalAmount).toLocaleString('en-IN')}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <AdminThemeToggle />

        <div
          className="relative"
          onMouseEnter={() => setProfileOpen(true)}
          onMouseLeave={() => setProfileOpen(false)}
        >
          <button
            type="button"
            className={cn(
              'p-2 rounded-lg border transition-colors cursor-pointer',
              t.iconBtn,
              profileOpen && t.iconBtnActive,
            )}
            aria-label="Admin profile"
            aria-expanded={profileOpen}
          >
            <User size={18} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full pt-2 z-20">
              <div
                className={cn(
                  'w-64 rounded-xl border shadow-2xl overflow-hidden',
                  t.dropdown,
                )}
              >
              <div className="px-4 py-3">
                {user?.full_name && (
                  <p className={cn('text-sm font-semibold truncate', t.heading)}>{user.full_name}</p>
                )}
                <p className={cn('text-sm truncate', user?.full_name ? cn('mt-0.5', t.body) : t.heading)}>
                  {user?.email}
                </p>
                <p className="text-[10px] text-orange-400 uppercase tracking-widest font-mono mt-2">
                  {accessLabel}
                </p>
              </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
