import React from "react";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { GitHub, LinkedIn, Instagram, Mail } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import '../App.css';

const Navbar = () => {
    return (
        // <AppBar position="static" sx={{ boxShadow: 'none', bgcolor: 'black' }}>
        // add id to AppBar
        <AppBar position="static" sx={{ boxShadow: 'none', bgcolor: 'black' }} id="navbar">
            <Toolbar sx={{ minHeight: 'auto', padding: '0' }}>
                {/* Logo Text */}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontFamily: 'Creattion, Arial', fontSize: '3.5rem'}}>
                    Ishmam
                </Typography>

                {/* Social Icons */}
                <IconButton color="inherit" href="https://github.com/ishmam97" target="_blank" sx={{ padding: '0', margin: '0 5px' }}>
                    <GitHub />
                </IconButton>
                <IconButton color="inherit" href="https://www.linkedin.com/in/ishmam-solaiman-212b32186/" target="_blank" sx={{ padding: '0', margin: '0 5px' }}>
                    <LinkedIn />
                </IconButton>
                <IconButton color="inherit" href="https://instagram.com/ishmam97/" target="_blank" sx={{ padding: '0', margin: '0 5px' }}>
                    <Instagram />
                </IconButton>
                {/* add hover tooltip saying contact me*/}
                <IconButton color="inherit" href="mailto:ishmam.a.solaiman@gmail.com" sx={{ padding: '0', margin: '0 5px' }}>
                    <Tooltip title="Contact Me" arrow>
                        <Mail />
                    </Tooltip>
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
