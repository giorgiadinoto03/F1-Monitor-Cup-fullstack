import { createTheme, ThemeProvider } from '@mui/material/styles';
// 1. Creo un tema personalizzato (dark mode + colori Formula 1)
const theme = createTheme({
palette: {
    mode: 'dark',
    primary: { main: '#ff0000' },
    secondary: { main: '#ffffff' },
    background: { default: '#ff0000ff', paper: '#1a1a1a' },
},
typography: { // Imposto il font Titillium Web come font principale
    fontFamily: "'Titillium Web', sans-serif",
},

});

export default function Theme({ children }) {
return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}   