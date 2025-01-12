import React from 'react';
import './css/AboutMe.css';

import { Container, Typography, List, ListItem, ListItemText} from '@mui/material';
import { Timeline, Events, Event } from 'vertical-timeline-component-react';

import { resumeExperience } from './experienceData';

export default function AboutMe() {
  const customTheme = {
    borderDotColor: '#372963',
    descriptionColor: '#c592ff',
    dotColor: '#c592ff',
    eventColor: '#DFFF3D',
    lineColor: '#00FF9C',
    subtitleColor: '#ff4081',
    titleColor: '#00FF9C',
    yearColor: '#ff4081',
  };

  return (
    <Container className='section-container' sx={{ color: 'white', py: 4 }}>
      <Typography variant="h3" sx={{justifySelf: 'center', color: '#DFFF3D'}}>
        My Journey
      </Typography>

      <Timeline
        lang="en"
        theme={customTheme}
        dateFormat="only-number"
        collapse
        withoutDay
      >
        {resumeExperience.map((item, index) => {
        
          const bulletList = (
            <List sx={{ listStyleType: 'disc', pl: 4 }}>
              {item.bullets.map((bullet, i) => (
                <ListItem key={i} sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText primary={bullet} />
                </ListItem>
              ))}
            </List>
          );

          const descriptionArray = [bulletList];

          return (
            <Events 
            key={index} 
            title={item.title} 
            subtitle={item.company}
            startDate={item.startDate}
            endDate={item.endDate} 
>
              <Event title="Details" description={descriptionArray}/>
            </Events>
          );
        })}
      </Timeline>
    </Container>
  );
}
