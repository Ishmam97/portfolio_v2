import React from 'react';
import { Box, Typography } from '@mui/material';
import './css/Projects.css';  // Assuming you use a similar CSS file for projects
import { Container } from 'reactstrap';
import ProjectCard from './ProjectCard';  // Import the new ProjectCard component

const projectsData = [
    {
        title: "UBlog",
        description: "A social media website I built for my undergraduate web development course.",
        imageUrl: "/img/ublog.gif",
        technologies: ["react", "nodejs", "mongodb", "express"]
    },
    {
        title: "Disinfectors Inc. Website",
        description: "A website I built for a startup company that provides disinfection services. Includes a booking system and order tracking.",
        imageUrl: "/img/disinfectors.gif",
        technologies: ["html", "css", "javascript", "bootstrap", "firebase", "gcp"]
    },
    {
        title: "Feedme",
        description: "Food ordering and delivery app for android built using Kotlin and android studio.",
        imageUrl: "/img/feedme2.gif",
        technologies: ["kotlin", "android-studio", "firebase"]
    },
];


export default function Projects() {
    return (
        <>
        <Container className='projects-title' sx={{width:'80%'}}>
            <Typography variant="h2" sx={{
                mb: 6,
                mt: 3,
                color:'#DFFF3D',
                fontFamily: 'Lato, sans-serif',
            }}>
                    My Projects
            </Typography>
        </Container>        
        <Box sx={{
            width: '95%',
            margin: 'auto',
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