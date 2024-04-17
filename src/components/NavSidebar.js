import React from 'react';
import { Box, List, ListItem, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { NavLink } from 'react-router-dom';

const NavSidebar = () => {
    return (
        <Box sx={{
            width: '100px', 
            position: 'fixed', 
            height: '80vh', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            display: 'flex', 
            alignItems: 'center',
        }}>
            <List>
                {renderNavItem("/", <HomeIcon sx={{fontSize:'2.5rem', marginBottom: '15px'}}/>)}
                {renderNavItem("/projects", <WorkIcon sx={{fontSize:'2.5rem', marginBottom: '15px'}} />)}
                {renderNavItem("/about", <InfoOutlinedIcon sx={{fontSize:'2.5rem'}} />)}
            </List>
        </Box>
    );
};

const renderNavItem = (path, icon) => (
    <ListItem disablePadding>
        <NavLink to={path} end style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? '#DFFF3D' : '#00FF9C',
        })}>
            <IconButton sx={{ color: 'inherit' }}>
                {icon}
            </IconButton>
        </NavLink>
    </ListItem>
);

export default NavSidebar;