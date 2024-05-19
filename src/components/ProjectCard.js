import React from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';

const font_style = {
    fontFamily: 'Lato, sans-serif',
    fontWeight: 400,
}

const ProjectCard = ({ project, index }) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.5  // Trigger animation when half of the item is in view
    });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, translateY: 50 }}
            animate={inView ? { opacity: 1, translateY: 0 } : {}}
            exit={{ opacity: 0, translateY: 50 }}
            transition={{ duration: 0.5, delay: index * 0.3 }}
            sx={{ marginX: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            // add media query for smaller screens
            '@media (max-width: 1292px)': {
                width: '90%',
            }
        }}
        >
            <Card sx={{ 
                margin: '1rem', 
                overflow: 'hidden',
                backgroundColor: 'transparent',
                border: '2px solid #ff4081',
            }}>
                <CardActionArea sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    '@media (max-width: 1292px)': {
                        flexDirection: 'column',
                    }
                }}>
                    <CardMedia
                        component="img"
                        image={project.imageUrl}
                        alt={project.title}
                        sx={{ 
                            height: '20rem', 
                            width: '35.5rem', 
                            objectFit: 'cover',
                            '@media (orientation: portrait)': {
                                objectFit: 'contain',
                                padding: '0 20%',
                            }
                        }}
                    />
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                        <Typography sx={{ fontSize: "2rem", ...font_style }} gutterBottom variant="h5" component="div" color="#DFFF3D">
                            {project.title}
                        </Typography>
                        <Typography sx={{ fontSize: "1.2rem", ...font_style }} variant="body2" color="#00FF9C">
                            {project.description}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </motion.div>
    );
};

export default ProjectCard;