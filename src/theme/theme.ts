import { createTheme, MantineColorsTuple } from '@mantine/core';

const warmGold: MantineColorsTuple = [
  '#fef9e6',
  '#fcf3cc',
  '#f9ecb3',
  '#f6e599',
  '#f3de80',
  '#f0d766',
  '#D4A017',
  '#b8900e',
  '#9c7a0c',
  '#80640a',
];

export const tempasTheme = createTheme({
  primaryColor: 'warmGold',
  white: '#eee',
  autoContrast: true,
  colors: {
    warmGold,
  },

  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  fontFamilyMonospace:
    "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono'",
  headings: {
    fontFamily: 'Inter, ui-sans-serif, system-ui',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '28px', lineHeight: '1.15' },
      h2: { fontSize: '22px', lineHeight: '1.18' },
      h3: { fontSize: '18px', lineHeight: '1.2' },
    },
  },

  spacing: { xs: '8px', sm: '12px', md: '16px', lg: '22px', xl: '32px' },
  radius: { xs: '6px', sm: '8px', md: '10px', lg: '12px', xl: '16px' },

  shadows: {
    xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
    sm: '0 4px 10px rgba(15, 23, 42, 0.06)',
    md: '0 8px 24px rgba(15, 23, 42, 0.08)',
    lg: '0 18px 60px rgba(15, 23, 42, 0.10)',
    xl: '0 30px 90px rgba(15, 23, 42, 0.12)',
  },

  components: {
    Button: {
      defaultProps: { radius: 'sm', size: 'md' },
    },
    Card: {
      defaultProps: { radius: 'md' },
    },
    Modal: {
      defaultProps: { radius: 'md' },
    },
    Popover: { defaultProps: { radius: 'sm' } },
    Tooltip: { defaultProps: { multiline: false } },
  },
});
