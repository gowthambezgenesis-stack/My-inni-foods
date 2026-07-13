import { Moon, Sun } from 'lucide-react';
import { useAdminThemeClasses } from '../../lib/adminTheme';
import { useAdminThemeStore } from '../../store/adminThemeStore';
import { cn } from '../../lib/utils';

export function AdminThemeToggle() {
  const theme = useAdminThemeStore((state) => state.theme);
  const toggleTheme = useAdminThemeStore((state) => state.toggleTheme);
  const t = useAdminThemeClasses();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg border transition-colors cursor-pointer',
        t.iconBtn,
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
