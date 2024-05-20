import React from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Card, CardContent, CardMedia, Typography, Box, Tooltip } from '@mui/material';
import { SiReact, SiNodedotjs, SiMongodb, SiExpress, SiHtml5, SiCss3, SiJavascript, SiBootstrap, SiFirebase, SiGooglecloud, SiKotlin, SiAndroidstudio } from 'react-icons/si';

const font_style = {
    fontFamily: 'Lato, sans-serif',
    fontWeight: 400,
};
const technologyIcons = {
    react: <Tooltip title="React"><SiReact color="#61DAFB" /></Tooltip>,
    nodejs: <Tooltip title="Node.js"><SiNodedotjs color="#339933" /></Tooltip>,
    mongodb: <Tooltip title="MongoDB"><SiMongodb color="#47A248" /></Tooltip>,
    express: <Tooltip title="Express"><SiExpress color="#339933" /></Tooltip>,
    html: <Tooltip title="HTML5"><SiHtml5 color="#E34F26" /></Tooltip>,
    css: <Tooltip title="CSS3"><SiCss3 color="#1572B6" /></Tooltip>,
    javascript: <Tooltip title="JavaScript"><SiJavascript color="#F7DF1E" /></Tooltip>,
    bootstrap: <Tooltip title="Bootstrap"><SiBootstrap color="#7952B3" /></Tooltip>,
    firebase: <Tooltip title="Firebase"><SiFirebase color="#FFCA28" /></Tooltip>,
    gcp: <Tooltip title="Google Cloud Platform"><SiGooglecloud color="#4285F4" /></Tooltip>,
    kotlin: <Tooltip title="Kotlin"><SiKotlin color="#0095D5" /></Tooltip>,
    "android-studio": <Tooltip title="Android Studio"><SiAndroidstudio color="#3DDC84" /></Tooltip>,
};


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
        >
            <Card sx={{ 
                margin: '1rem', 
                overflow: 'hidden',
                backgroundColor: 'transparent',
                border: '2px solid #ff4081',
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
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
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', display: 'flex', flexDirection:'column', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: "2rem", ...font_style }} gutterBottom variant="h5" component="div" color="#DFFF3D">
                            {project.title}
                        </Typography>
                        <Typography sx={{ fontSize: "1.2rem", ...font_style }} variant="body2" color="#00FF9C">
                            {project.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            {project.technologies.map((tech, index) => (
                                <Tooltip key={index} title={tech.charAt(0).toUpperCase() + tech.slice(1).replace('-', ' ')}>
                                    <Box sx={{ margin: '0 0.5rem', color: 'white', fontSize: '2rem' }}>
                                        {technologyIcons[tech]}
                                    </Box>
                                </Tooltip>
                            ))}
                        </Box>
                    </CardContent>
                </Box>
            </Card>
        </motion.div>
    );
};

export default ProjectCard;


// const technologyIcons = {
//     react: <Tooltip title="React"><SiReact/></Tooltip>,
//     nodejs: <Tooltip title="Node.js"><SiNodedotjs/></Tooltip>,
//     mongodb: <Tooltip title="MongoDB"><SiMongodb/></Tooltip>,
//     express: <Tooltip title="Express"><SiExpress/></Tooltip>,
//     html: <Tooltip title="HTML5"><SiHtml5/></Tooltip>,
//     css: <Tooltip title="CSS3"><SiCss3/></Tooltip>,
//     javascript: <Tooltip title="JavaScript"><SiJavascript/></Tooltip>,
//     bootstrap: <Tooltip title="Bootstrap"><SiBootstrap/></Tooltip>,
//     firebase: <Tooltip title="Firebase"><SiFirebase/></Tooltip>,
//     gcp: <Tooltip title="Google Cloud Platform"><SiGooglecloud/></Tooltip>,
//     kotlin: <Tooltip title="Kotlin"><SiKotlin/></Tooltip>,
//     "android-studio": <Tooltip title="Android Studio"><SiAndroidstudio/></Tooltip>,
// };