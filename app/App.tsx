import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  createTheme,
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Tooltip,
  Avatar,
  Button,
  Link,
  Dialog,
  Fab,
  Zoom,
} from '@mui/material';
import { 
  Brightness4, 
  Brightness7, 
  Add as AddIcon,
  KeyboardArrowUp 
} from '@mui/icons-material';
import { FilterOptions, StudyMaterial } from '../types/StudyMaterial';
import MaterialList from './components/MaterialList';
import FilterSection from './components/FilterSection';
import Login from './components/Login';
import AddMaterial from './components/AddMaterial';
import Footer from './components/Footer';
import { studyMaterialApi } from '../lib/api';

// Import the logo
import logo from '../logo.jpg';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openAddMaterial, setOpenAddMaterial] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    subject: '',
    semester: '',
    type: 'ALL',
  });
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem('isLoggedIn');
    if (loginStatus === 'true') {
      setIsLoggedIn(true);
    }

    const darkModeStatus = localStorage.getItem('darkMode');
    if (darkModeStatus === 'true') {
      setDarkMode(true);
    }

    // Load materials from localStorage
    const savedMaterials = localStorage.getItem('materials');
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    }

    const handleScroll = () => {
      const scrollThreshold = 200; // Reduced threshold to show button earlier
      setShowBackToTop(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setOpenLogin(false);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  const handleAddMaterial = async (newMaterial: StudyMaterial) => {
    try {
      const savedMaterial = await studyMaterialApi.create(newMaterial);
      const mappedMaterial: StudyMaterial = {
        id: savedMaterial.id,
        title: savedMaterial.title,
        description: savedMaterial.description || '',
        subject: savedMaterial.categoryId,
        semester: savedMaterial.semester,
        type: savedMaterial.type as 'PDF' | 'VIDEO',
        link: savedMaterial.fileUrl,
        tags: savedMaterial.tags,
        uploadDate: savedMaterial.createdAt.toISOString(),
        author: savedMaterial.author
      };
      const updatedMaterials = [...materials, mappedMaterial];
      setMaterials(updatedMaterials);
    } catch (error) {
      console.error('Error saving material to database:', error);
      // You might want to show an error message to the user here
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90A4AE' : '#2E3B55',
      },
      secondary: {
        main: darkMode ? '#FF6B6B' : '#E63946',
      },
      background: {
        default: darkMode ? '#121212' : '#F8F9FA',
        paper: darkMode ? '#1E1E1E' : '#FFFFFF',
      },
    },
    typography: {
      h4: {
        fontWeight: 600,
        letterSpacing: '0.02em',
        color: darkMode ? '#FFFFFF' : '#2E3B55',
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: darkMode
              ? 'linear-gradient(135deg, #1A1F35 0%, #121212 100%)'
              : 'linear-gradient(135deg, #2E3B55 0%, #1A1F35 100%)',
            boxShadow: darkMode
              ? '0 2px 4px rgba(0,0,0,0.2)'
              : '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode
              ? '0 2px 8px rgba(0,0,0,0.2)'
              : '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: darkMode
                ? '0 4px 12px rgba(0,0,0,0.3)'
                : '0 4px 12px rgba(0,0,0,0.1)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: darkMode ? '#121212' : '#ffffff',
      }}>
        {/* Background Logo */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={logo}
            sx={{
              width: '25%',
              maxWidth: '300px',
              opacity: darkMode ? 0.15 : 0.1,
              filter: `grayscale(100%) ${darkMode ? 'brightness(1.2)' : 'brightness(0.8)'}`,
              transform: 'scale(1)',
            }}
          />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar
            position="fixed"
            sx={{
              background: darkMode
                ? 'linear-gradient(135deg, #1A1F35 0%, #121212 100%)'
                : 'linear-gradient(135deg, #2E3B55 0%, #1A1F35 100%)',
              boxShadow: '0 3px 5px 2px rgba(46, 59, 85, .3)',
            }}
          >
            <Toolbar sx={{ minHeight: { xs: '64px', sm: '70px' } }}>
              <Box
                component="img"
                sx={{
                  height: { xs: 40, sm: 45 },
                  width: { xs: 40, sm: 45 },
                  borderRadius: '12px',
                  objectFit: 'cover',
                  mr: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.1)',
                }}
                alt="RRCE Logo"
                src={logo}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    lineHeight: 1.2,
                    background: 'linear-gradient(45deg, #FFFFFF 30%, #E0E0E0 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  RajaRajeswari College of Engineering
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  component="div" 
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.8rem' },
                    fontWeight: 400,
                    letterSpacing: '0.4px',
                    opacity: 0.75,
                    color: 'white',
                    fontStyle: 'italic',
                    mt: 0.2,
                  }}
                >
                  An Autonomous Institution
                </Typography>
              </Box>

              <Box 
                sx={{ 
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                  borderRadius: '20px',
                  px: 2,
                  py: 0.5,
                  mr: 3,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Typography 
                  variant="subtitle1"
                  sx={{ 
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    color: 'white',
                    opacity: 0.9,
                  }}
                >
                  Study Materials Hub
                </Typography>
              </Box>

              <Link
                href="https://www.rrce.org"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'white',
                  textDecoration: 'none',
                  mr: 3,
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '0.9rem',
                  opacity: 0.9,
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    opacity: 1,
                    textDecoration: 'none',
                    background: 'linear-gradient(45deg, #FFFFFF 30%, #E0E0E0 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  },
                }}
              >
                Visit RRCE Website
              </Link>
              <IconButton
                color="inherit"
                onClick={toggleDarkMode}
                sx={{ 
                  mr: 2,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              {isLoggedIn && (
                <IconButton
                  color="inherit"
                  onClick={() => setOpenAddMaterial(true)}
                  sx={{ 
                    mr: 2,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  title="Add Material"
                >
                  <AddIcon />
                </IconButton>
              )}
              {isLoggedIn ? (
                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button 
                  color="inherit" 
                  onClick={() => setOpenLogin(true)}
                  sx={{
                    borderRadius: '20px',
                    px: 2,
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  Admin Login
                </Button>
              )}
            </Toolbar>
          </AppBar>
          <Toolbar /> {/* This is for spacing below AppBar */}
          <Container maxWidth="lg" sx={{ mt: 4, flex: 1 }}>
            <FilterSection filters={filters} setFilters={setFilters} />
            <MaterialList
              materials={materials}
              filters={filters}
              setMaterials={setMaterials}
              isLoggedIn={isLoggedIn}
            />
          </Container>
          <Footer />
        </Box>

        <Zoom in={showBackToTop}>
          <Box
            role="presentation"
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 32 },
              right: { xs: 16, sm: 32 },
              zIndex: 2000,
            }}
          >
            <Tooltip title="Back to top" placement="left">
              <Fab
                onClick={scrollToTop}
                size="large"
                color="primary"
                aria-label="back to top"
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                }}
              >
                <KeyboardArrowUp sx={{ fontSize: { xs: 24, sm: 32 } }} />
              </Fab>
            </Tooltip>
          </Box>
        </Zoom>
      </Box>
      
      {/* Login Dialog */}
      <Dialog open={openLogin} onClose={() => setOpenLogin(false)}>
        <Login onLogin={handleLogin} />
      </Dialog>

      {/* Add Material Dialog */}
      <AddMaterial
        open={openAddMaterial}
        onClose={() => setOpenAddMaterial(false)}
        onAdd={handleAddMaterial}
      />
    </ThemeProvider>
  );
};

export default App; 