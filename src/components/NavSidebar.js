import React from 'react';
import { Box, List, ListItem, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
// import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { NavLink } from 'react-router-dom';

const NavSidebar = () => {
    return (
        <Box sx={{
            width: '60px', 
            position: 'fixed', 
            height: '80vh', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            display: 'flex', 
            alignItems: 'center',
            zIndex: 1,
            '@media (max-width: 1366px)': {
                width: '100%', 
                height:'60px',
                bottom: 0, // Position at the bottom
                top: 'auto', // Remove top positioning
                marginTop:'5px',
            }
        }}>
            <List sx={{
                '@media (max-width: 1366px)': {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    backgroundFilter: 'blur(10px)',
                }
            }}>
                {renderNavItem("/", <HomeIcon sx={{fontSize:'2.5rem', marginBottom: '15px','@media (max-width: 1366px)': {
                    marginBottom: '5px',
            }}}/>)}
                {renderNavItem("/projects", <WorkIcon sx={{fontSize:'2.5rem', marginBottom: '15px', '@media (max-width: 1366px)': {
                    marginBottom: '5px',
            }}} />)}
                {/* {renderNavItem("/about", <InfoOutlinedIcon sx={{fontSize:'2.5rem'}} />)} */}
            </List>
        </Box>
    );
};

const renderNavItem = (path, icon) => (
    <ListItem disablePadding>
        <NavLink to={path} end style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? '#DFFF3D' : '#00FF9C',
            // faded background color when active
            backgroundColor: isActive ? 'rgba(223, 255, 61, 0.15)' : 'transparent',
            borderRadius: '50%',
        })}>
            <IconButton sx={{ color: 'inherit' }}>
                {icon}
            </IconButton>
        </NavLink>
    </ListItem>
);

export default NavSidebar;