import { createTheme } from '@mui/material/styles';

const NavbarTheme = createTheme({
  // You can customize your theme here. Example:
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
            boxShadow: '0 0 10px 5px #d00037ad',  // Added custom shadow
            borderRadius: '0 0 5px 5px',          // Added border radius
            marginBottom: '10px',                 // Added bottom margin
            display: 'block',                     // Set display to block
            backgroundColor: '#0B1618', // Custom background color with !important
            color: '#DFFF3D'
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 'auto',
          padding: '0'
        }
      }
    }
  }
});

export default NavbarTheme;