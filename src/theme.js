import { createTheme } from '@mui/material/styles';
import { dataDisplayCustomizations } from './themeCustomizations';

const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    secondary: { main: '#ff5722' },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    ...dataDisplayCustomizations,
    // Aquí puedes agregar otros overrides que necesites
  },
});

export default customTheme;
