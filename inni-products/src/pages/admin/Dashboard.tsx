import React from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  TrendingUp,
  ArrowRight,
  Users,
  Package,
} from 'lucide-react';
import { LiveIndicator } from '../../components/admin/LiveIndicator';
import { OrderTable } from '../../components/admin/OrderTable';
import { useRealtimeDashboardStats } from '../../hooks/useRealtimeDashboardStats';
import { useRealtimeOrders } from '../../hooks/useRealtimeOrders';
import {
  canAccessOrders,
  canManageUsers,
  canViewRevenue,
  formatRoleLabel,
} from '../../lib/adminRoles';
import { useAuthStore } from '../../store/authStore';
import { useAdminThemeClasses, type AdminThemeClasses } from '../../lib/adminTheme';
import { cn } from '../../lib/utils';

function StatCard({
  name,
  value,
  icon: Icon,
  subtext,
  gradient,
  t,
}: {
  name: string;
  value: string;
  icon: React.ElementType;
  subtext: string;
  gradient: string;
  t: AdminThemeClasses;
}) {
  return (
    <div className={cn('border rounded-xl p-6 relative overflow-hidden transition-all duration-300', t.surface, t.surfaceHover)}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className={cn('text-xs font-medium uppercase tracking-wider', t.label)}>{name}</p>
          <p className={cn('text-3xl font-semibold tracking-tight font-mono', t.heading)}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient} text-white`}>
          <Icon size={20} />
        </div>
      </div>
      <p className={cn('mt-4 text-[11px] font-mono', t.muted)}>{subtext}</p>
    </div>
  );
}

export function Dashboard() {
  const { role, isSuperAdmin, user } = useAuthStore();
  const t = useAdminThemeClasses();
  const { stats, loading, error, lastUpdated: statsUpdated } = useRealtimeDashboardStats();
  const showOrders = canAccessOrders(role) || isSuperAdmin;
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    lastUpdated: ordersUpdated,
  } = useRealtimeOrders({ enabled: showOrders, filters: { recent: true } });

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '—';
    return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const dashboardTitle = isSuperAdmin
    ? 'Super Admin Dashboard'
    : `${formatRoleLabel(role ?? undefined)} Dashboard`;

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[50vh] text-sm', t.loading)}>
        Loading dashboard...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const showRevenue = canViewRevenue(role) || isSuperAdmin;
  const recentOrders = orders.slice(0, 7);
  const recentOrdersLabel = `${recentOrders.length} recent order${recentOrders.length === 1 ? '' : 's'}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className={cn('text-3xl font-bold tracking-tight', t.heading)}>{dashboardTitle}</h2>
          <p className={cn('mt-1', t.body)}>
            {isSuperAdmin
              ? 'Real-time overview of recent orders, revenue, and store operations.'
              : `Welcome back${user?.full_name ? `, ${user.full_name}` : ''}. Here is your workspace overview.`}
          </p>
        </div>
        <LiveIndicator lastUpdated={statsUpdated ?? ordersUpdated} />
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${showRevenue ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-6`}>
        {showRevenue && (
          <>
            <StatCard
              name="Total Revenue"
              value={formatCurrency(stats.total_revenue)}
              icon={IndianRupee}
              subtext={`${stats.paid_orders} paid this month`}
              gradient="from-orange-500 to-amber-500"
              t={t}
            />
            <StatCard
              name="Today's Sales"
              value={formatCurrency(stats.todays_sales)}
              icon={TrendingUp}
              subtext="Paid orders today"
              gradient="from-emerald-500 to-teal-500"
              t={t}
            />
          </>
        )}
        <StatCard
          name="Total Orders"
          value={String(stats.total_orders)}
          icon={ShoppingBag}
          subtext={`${stats.todays_orders} orders today · this month`}
          gradient="from-red-500 to-rose-500"
          t={t}
        />
        <StatCard
          name="Pending Order"
          value={String(stats.not_delivered_orders)}
          icon={Clock}
          subtext="Orders awaiting delivery"
          gradient="from-amber-500 to-yellow-500"
          t={t}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ...(showOrders ? [{ label: 'Recent Orders', path: '/admin/orders', icon: Package }] : []),
          ...(canManageUsers(role) || isSuperAdmin
            ? [{ label: 'Manage Users', path: '/admin/users', icon: Users }]
            : []),
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className={cn('group flex items-center justify-between border hover:border-orange-500/30 rounded-xl px-5 py-4 transition-all', t.surface)}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-orange-400" />
                <span className={cn('text-sm font-medium', t.heading)}>{action.label}</span>
              </div>
              <ArrowRight
                size={16}
                className={cn('group-hover:translate-x-0.5 transition-all', t.arrowMuted)}
              />
            </Link>
          );
        })}
      </div>

      <div className={`grid grid-cols-1 ${isSuperAdmin ? 'lg:grid-cols-3' : ''} gap-8`}>
        {showOrders && (
          <div className={isSuperAdmin ? 'lg:col-span-2 space-y-4' : 'space-y-4'}>
            <div className="flex justify-between items-center gap-4">
              <div>
                <h3 className={cn('text-base font-semibold', t.heading)}>Recent Orders</h3>
                <p className={cn('text-xs mt-0.5', t.muted)}>
                  {ordersLoading ? 'Loading...' : recentOrdersLabel}
                </p>
              </div>
              <Link to="/admin/orders" className="text-xs text-orange-400 hover:text-orange-300 font-medium">
                View recent orders
              </Link>
            </div>

            {ordersError ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-sm text-red-400">
                {ordersError}
              </div>
            ) : ordersLoading ? (
              <div className={cn('border rounded-xl p-10 text-center text-sm', t.surface, t.loading)}>
                Loading orders...
              </div>
            ) : (
              <OrderTable orders={recentOrders} />
            )}
          </div>
        )}

        {isSuperAdmin && (
          <div className={cn('border rounded-xl p-6 h-fit', t.surface)}>
            <h3 className={cn('text-base font-semibold mb-6', t.heading)}>Users by Role</h3>
            <div className="space-y-3">
              {Object.entries(stats.users_by_role).map(([roleKey, count]) => (
                <div key={roleKey} className="flex items-center justify-between text-sm">
                  <span className={cn('capitalize', t.body)}>{roleKey.replace('_', ' ')}</span>
                  <span className={cn('font-mono px-2 py-0.5 rounded', t.badge)}>{count}</span>
                </div>
              ))}
              {Object.keys(stats.users_by_role).length === 0 && (
                <p className={cn('text-sm', t.muted)}>No user profiles yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
