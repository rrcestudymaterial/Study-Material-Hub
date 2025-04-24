import React from 'react';
import { Box, Container, Typography, Grid, Link, IconButton } from '@mui/material';
import {
  Facebook,
  Twitter,
  YouTube,
  Instagram,
  LinkedIn,
  RssFeed,
  LocationOn,
  Email,
  Phone,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        bgcolor: '#2E3B55',
        color: 'white',
        pt: 6,
        pb: 4,
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Us */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              About Us
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Established in 2006, managed by Moogambigai Charitable and Education Trust (MCET),
              Bangalore. The College is approved by All India Council for Technical Education,
              New Delhi, Govt. of Karnataka & affiliated to Visvesvaraya Technological University
              (VTU), Belgaum. The college has also been certified ISO 9001-2015 institution.
            </Typography>
          </Grid>

          {/* Hot Links */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Hot Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {[
                { text: 'Career', url: 'https://www.rrce.org/career/' },
                { text: 'Admissions Enquiry 2025-2026', url: 'https://www.rrce.org/engineering-college-admissions' },
                { text: 'Results', url: 'https://www.rrce.org/academics/results/' },
                { text: 'Campus Tour', url: 'https://www.rrce.org/campus-tour/' },
                { text: 'Alumni', url: 'https://www.rrce.org/alumni/' },
                { text: 'Webmail', url: 'http://mail.office365.com' },
                { text: 'SIS Portal', url: 'http://sis.e365.tech/login.aspx?AppType=E&sid=2012' },
                { text: 'Chat with Student Ambassador', url: 'https://www.rrce.org/chat-with-a-student-ambassador/' },
              ].map((link) => (
                <Box component="li" key={link.text} sx={{ mb: 1 }}>
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      textDecoration: 'none',
                      '&:hover': { color: 'white', textDecoration: 'underline' },
                    }}
                  >
                    {link.text}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Milestones / Social Media */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Milestones
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {[
                { icon: <Facebook />, url: 'https://www.facebook.com/Rajarajeswari.College.of.Engineering' },
                { icon: <Twitter />, url: 'https://twitter.com/rrceblr' },
                { icon: <YouTube />, url: 'https://www.youtube.com/channel/UC1Vhv8EuXUw0ZOVm3OIIfMw' },
                { icon: <RssFeed />, url: 'http://www.rrce.org/blog/' },
                { icon: <Instagram />, url: 'https://www.instagram.com/rajarajeswariengcollege/' },
                { icon: <LinkedIn />, url: 'https://www.linkedin.com/school/rrce/' },
              ].map((social, index) => (
                <IconButton
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: 'white' } }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Get in Touch */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Get in Touch
            </Typography>
            <Box sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <LocationOn />
                <Typography variant="body2">
                  RajaRajeswari College of Engineering<br />
                  Ramohalli Cross, Kumbalgodu,<br />
                  Mysore Road, Bengaluru - 560 074,<br />
                  Karnataka, India.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Email />
                <Link
                  href="mailto:enquiry@rrce.org"
                  sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'white' } }}
                >
                  enquiry@rrce.org
                </Link>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Phone />
                <Link
                  href="tel:+918028437375"
                  sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'white' } }}
                >
                  +91-80-28437375
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer; 