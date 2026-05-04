import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import AppRoutes from './routes/AppRoutes';
import './styles/globals.css';
import { AppThemeProvider, useAppTheme } from './core/providers/AppThemeProvider';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchProfile } from './store/slices/authSlice';

const AppShell: React.FC = () => {
  const { isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken, user } = useAppSelector((s) => s.auth);

  React.useEffect(() => {
    if (isAuthenticated && accessToken) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated, accessToken]);

  const muiTheme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#22c55e',
        light: '#4ade80',
        dark: '#15803d',
      },
      background: {
        default: isDark ? '#04130d' : '#f4fbf6',
        paper: isDark ? '#0b1c15' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ecfdf5' : '#0f172a',
        secondary: isDark ? '#a7c4b4' : '#475569',
      },
      error: { main: '#dc2626' },
      success: { main: '#16a34a' },
      warning: { main: '#d97706' },
    },
    typography: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '999px',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: '16px' },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            padding: '10px 14px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <AppThemeProvider>
      <AppShell />
    </AppThemeProvider>
  </Provider>
);

export default App;
