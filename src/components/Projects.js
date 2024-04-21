import React from 'react';
import { Box, Typography } from '@mui/material';
import './css/Projects.css';  // Assuming you use a similar CSS file for projects
import { Container } from 'reactstrap';
import ProjectCard from './ProjectCard';  // Import the new ProjectCard component

const projectsData = [
    {
        title: "UBlog",
        description: "A social media website I built for my undergraduate web development course.",
        imageUrl: "/img/ublog.gif"
    },
    {
        title: "Disinfectors Inc. Website",
        description: "A website I built for a startup company that provides disinfection services. Includes a booking system and order tracking.",
        imageUrl: "/img/disinfectors.gif"
    },
    {
        title: "Feedme",
        description: "Food ordering and delivery app for android built using Kotlin and android studio.",
        imageUrl: "/img/feedme2.gif"
    },
];


export default function Projects() {
    return (
        <>
        <Container className='projects-title' sx={{width:'80%'}}>
            <Typography variant="h2" sx={{ mb: 4, color:'#DFFF3D'}}>My Projects</Typography>
        </Container>        
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '2rem',
            marginBottom: '2rem',
            marginX: 'auto',
            width: '80%',
        }}>
            {projectsData.map((project, index) => (
                <ProjectCard key={index} project={project} index={index} />
            ))}
            <br />
            <br />
        </Box>
        </>
    );
}