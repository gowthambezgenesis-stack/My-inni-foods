import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
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

function StatCard({
  name,
  value,
  icon: Icon,
  subtext,
  gradient,
}: {
  name: string;
  value: string;
  icon: React.ElementType;
  subtext: string;
  gradient: string;
}) {
  return (
    <div className="bg-neutral-950 border border-white/[0.08] rounded-xl p-6 relative overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-orange-500/5">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{name}</p>
          <p className="text-3xl font-semibold text-white tracking-tight font-mono">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient} text-white`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-[11px] text-neutral-500 font-mono">{subtext}</p>
    </div>
  );
}

export function Dashboard() {
  const { role, isSuperAdmin, user } = useAuthStore();
  const { stats, loading, error, lastUpdated: statsUpdated } = useRealtimeDashboardStats();
  const showOrders = canAccessOrders(role) || isSuperAdmin;
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    lastUpdated: ordersUpdated,
  } = useRealtimeOrders({ enabled: showOrders });

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '—';
    return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const dashboardTitle = isSuperAdmin
    ? 'Super Admin Dashboard'
    : `${formatRoleLabel(role ?? undefined)} Dashboard`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-neutral-400 text-sm">
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{dashboardTitle}</h2>
          <p className="text-neutral-400 mt-1">
            {isSuperAdmin
              ? 'Real-time overview of orders, revenue, and store operations.'
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
              icon={DollarSign}
              subtext={`${stats.paid_orders} paid orders`}
              gradient="from-orange-500 to-amber-500"
            />
            <StatCard
              name="Today's Sales"
              value={formatCurrency(stats.todays_sales)}
              icon={TrendingUp}
              subtext="Paid orders today"
              gradient="from-emerald-500 to-teal-500"
            />
          </>
        )}
        <StatCard
          name="Total Orders"
          value={String(stats.total_orders)}
          icon={ShoppingBag}
          subtext={`${stats.todays_orders} orders today`}
          gradient="from-red-500 to-rose-500"
        />
        <StatCard
          name="Pending Orders"
          value={String(stats.pending_orders)}
          icon={Clock}
          subtext="Awaiting payment or fulfillment"
          gradient="from-amber-500 to-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ...(showOrders ? [{ label: 'View All Orders', path: '/admin/orders', icon: Package }] : []),
          ...(canManageUsers(role) || isSuperAdmin
            ? [{ label: 'Manage Users', path: '/admin/users', icon: Users }]
            : []),
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="group flex items-center justify-between bg-neutral-950 border border-white/[0.08] hover:border-orange-500/30 rounded-xl px-5 py-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-orange-400" />
                <span className="text-sm font-medium text-white">{action.label}</span>
              </div>
              <ArrowRight
                size={16}
                className="text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all"
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
                <h3 className="text-base font-semibold text-white">All Orders</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {ordersLoading ? 'Loading...' : `${orders.length} order${orders.length === 1 ? '' : 's'} total`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <LiveIndicator lastUpdated={ordersUpdated} />
                <Link to="/admin/orders" className="text-xs text-orange-400 hover:text-orange-300 font-medium">
                  Manage orders
                </Link>
              </div>
            </div>

            {ordersError ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center text-sm text-red-400">
                {ordersError}
              </div>
            ) : ordersLoading ? (
              <div className="bg-neutral-950 border border-white/[0.08] rounded-xl p-10 text-center text-sm text-neutral-400">
                Loading orders...
              </div>
            ) : (
              <OrderTable orders={orders} />
            )}
          </div>
        )}

        {isSuperAdmin && (
          <div className="bg-neutral-950 border border-white/[0.08] rounded-xl p-6 h-fit">
            <h3 className="text-base font-semibold text-white mb-6">Users by Role</h3>
            <div className="space-y-3">
              {Object.entries(stats.users_by_role).map(([roleKey, count]) => (
                <div key={roleKey} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400 capitalize">{roleKey.replace('_', ' ')}</span>
                  <span className="font-mono text-white bg-white/[0.06] px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
              {Object.keys(stats.users_by_role).length === 0 && (
                <p className="text-sm text-neutral-500">No user profiles yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
