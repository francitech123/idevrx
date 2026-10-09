/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        'paper-raised': 'var(--color-paper-raised)',
        'paper-muted': 'var(--color-paper-muted)',
        card: 'var(--color-card)',
        ink: 'var(--color-ink)',
        'ink-subtle': 'var(--color-ink-subtle)',
        'ink-faint': 'var(--color-ink-faint)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        'line-strong': 'var(--color-line-strong)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-link-hover)',
        'on-ink': 'var(--color-on-ink)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
        info: 'var(--color-info)',
      },
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        button: '6px',
        input: '6px',
        card: '10px',
      },
      maxWidth: {
        container: '1280px',
        reading: '720px',
      },
      aspectRatio: {
        photo: '3 / 2',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
