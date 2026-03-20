import { useTheme } from '../contexts/ThemeContext';

const themes = [
  { id: 'gruvbox-light', name: 'Gruvbox Light', preview: '#458588', type: 'light' },
  { id: 'catppuccin-latte', name: 'Catppuccin Latte', preview: '#8839ef', type: 'light' },
  { id: 'gruvbox-dark', name: 'Gruvbox Dark', preview: '#83a598', type: 'dark' },
  { id: 'dracula', name: 'Dracula', preview: '#bd93f9', type: 'dark' },
];

interface ThemeSwitcherProps {
  onClose?: () => void;
}

export default function ThemeSwitcher({ onClose }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  const lightThemes = themes.filter(t => t.type === 'light');
  const darkThemes = themes.filter(t => t.type === 'dark');

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

        <div className="p-4 space-y-6">
          {/* Light Themes */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Light Themes</h3>
            <div className="grid gap-3">
              {lightThemes.map((t) => (
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

          {/* Dark Themes */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Dark Themes</h3>
            <div className="grid gap-3">
              {darkThemes.map((t) => (
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
      </div>
    </div>
  );
}
