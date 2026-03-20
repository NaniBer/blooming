import { useTheme } from '../contexts/ThemeContext';

const themes = [
  { id: 'original', name: 'Original Green', preview: '#4CAF50' },
  { id: 'catppuccin-latte', name: 'Catppuccin Latte', preview: '#8839ef' },
  { id: 'catppuccin-frappe', name: 'Catppuccin Frappe', preview: '#cba6f7' },
  { id: 'catppuccin-macchiato', name: 'Catppuccin Macchiato', preview: '#c6a0f6' },
  { id: 'catppuccin-mocha', name: 'Catppuccin Mocha', preview: '#cba6f7' },
  { id: 'dracula', name: 'Dracula', preview: '#bd93f9' },
  { id: 'nord', name: 'Nord', preview: '#81a1c1' },
  { id: 'gruvbox-light', name: 'Gruvbox Light', preview: '#458588' },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', preview: '#83a598' },
  { id: 'tokyo-night', name: 'Tokyo Night', preview: '#7aa2f7' },
  { id: 'rose-pine', name: 'Rose Pine', preview: '#c4a7e7' },
];

interface ThemeSwitcherProps {
  onClose?: () => void;
}

export default function ThemeSwitcher({ onClose }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-border p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-text-primary">Choose Theme</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-4 grid gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                onClose?.();
              }}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                theme === t.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary'
              }`}
            >
              <div
                className="w-12 h-12 rounded-lg shadow-md"
                style={{ backgroundColor: t.preview }}
              />
              <div className="text-left flex-1">
                <div className="font-semibold text-text-primary">{t.name}</div>
                <div className="text-xs text-text-secondary">{t.preview}</div>
              </div>
              {theme === t.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
