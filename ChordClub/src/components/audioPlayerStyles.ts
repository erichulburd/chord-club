

export const getColors = (theme: Record<string, string>) => ({
  default: theme['border-basic-color-2'],
  lighter: theme['border-basic-color-2'] || '#1A2138',
  recording: theme['border-danger-color-4'],
  played: theme['border-primary-color-1'] || '#3366FF',
});
