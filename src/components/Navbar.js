import React from "react";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { GitHub, LinkedIn, Instagram, Mail } from '@mui/icons-material';
import { Tooltip, Box } from '@mui/material';
import '../App.css';

const Navbar = () => {
    // Common glow color and shadow settings
    const neonColor = '#DFFF3D';
    const neonShadow = `
        0 0 5px ${neonColor},
        0 0 10px ${neonColor},
        0 0 20px ${neonColor},
        0 0 40px ${neonColor}
    `;
    
    return (
        <AppBar position="static" sx={{ boxShadow: 'none', bgcolor: 'black' }} id="navbar">
            <Toolbar sx={{ minHeight: 'auto', padding: '0' }}>

                {/* Logo Text (clickable with neon glow on hover) */}
                <Typography
                    variant="h6"
                    component="a"
                    href="/"
                    sx={{
                        flexGrow: 1,
                        fontFamily: 'Creattion, Arial',
                        fontSize: '3.5rem',
                        whiteSpace: 'nowrap',
                        color: 'inherit',
                        textDecoration: 'none',
                        transition: 'color 0.3s, text-shadow 0.3s',
                        ':hover': {
                            color: neonColor,
                            textShadow: neonShadow,
                        },
                    }}
                >
                    Ishmam
                    <Box
                        component="span"
                        sx={{
                            '@media (max-width: 515px)': {
                                display: 'none',
                            },
                        }}
                    >
                        {' '}A. Solaiman
                    </Box>
                </Typography>

                {/* Social Icons (same glow on hover) */}
                <IconButton
                    color="inherit"
                    href="https://github.com/ishmam97"
                    target="_blank"
                    sx={{
                        padding: '0',
                        margin: '0 5px',
                        transition: 'color 0.3s, filter 0.3s',
                        ':hover': {
                            color: neonColor,
                            filter: `drop-shadow(0 0 5px ${neonColor})
                                     drop-shadow(0 0 10px ${neonColor})
                                     drop-shadow(0 0 20px ${neonColor})
                                     drop-shadow(0 0 40px ${neonColor})`,
                        },
                    }}
                >
                    <GitHub />
                </IconButton>
                
                <IconButton
                    color="inherit"
                    href="https://www.linkedin.com/in/ishmam-solaiman-212b32186/"
                    target="_blank"
                    sx={{
                        padding: '0',
                        margin: '0 5px',
                        transition: 'color 0.3s, filter 0.3s',
                        ':hover': {
                            color: neonColor,
                            filter: `drop-shadow(0 0 5px ${neonColor})
                                     drop-shadow(0 0 10px ${neonColor})
                                     drop-shadow(0 0 20px ${neonColor})
                                     drop-shadow(0 0 40px ${neonColor})`,
                        },
                    }}
                >
                    <LinkedIn />
                </IconButton>
                
                <IconButton
                    color="inherit"
                    href="https://instagram.com/ishmam97/"
                    target="_blank"
                    sx={{
                        padding: '0',
                        margin: '0 5px',
                        transition: 'color 0.3s, filter 0.3s',
                        ':hover': {
                            color: neonColor,
                            filter: `drop-shadow(0 0 5px ${neonColor})
                                     drop-shadow(0 0 10px ${neonColor})
                                     drop-shadow(0 0 20px ${neonColor})
                                     drop-shadow(0 0 40px ${neonColor})`,
                        },
                    }}
                >
                    <Instagram />
                </IconButton>
                
                <IconButton
                    color="inherit"
                    href="mailto:ishmam.a.solaiman@gmail.com"
                    sx={{
                        padding: '0',
                        margin: '0 5px',
                        transition: 'color 0.3s, filter 0.3s',
                        ':hover': {
                            color: neonColor,
                            filter: `drop-shadow(0 0 5px ${neonColor})
                                     drop-shadow(0 0 10px ${neonColor})
                                     drop-shadow(0 0 20px ${neonColor})
                                     drop-shadow(0 0 40px ${neonColor})`,
                        },
                    }}
                >
                    <Tooltip title="Contact Me" arrow>
                        <Mail />
                    </Tooltip>
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
