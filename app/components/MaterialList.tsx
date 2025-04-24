import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Zoom,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { FilterOptions, StudyMaterial } from '../../types/StudyMaterial';
import {
  PictureAsPdf,
  YouTube,
  Favorite,
  FavoriteBorder,
  AccessTime,
  School,
  GetApp,
  MenuBook,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { studyMaterialApi } from '../../lib/api';

// Sample data with enhanced information
const sampleMaterials: StudyMaterial[] = [
  {
    id: '1',
    title: 'Data Structures and Algorithms',
    description: 'Comprehensive guide to DSA concepts including arrays, linked lists, trees, and graphs. Perfect for interview preparation.',
    subject: 'CSE',
    semester: 3,
    type: 'PDF',
    link: 'https://drive.google.com/your-link-here',
    tags: ['DSA', 'Programming', 'Algorithms', 'Interview Prep'],
    uploadDate: '2024-04-24',
    author: 'Prof. Smith',
  },
  {
    id: '2',
    title: 'Circuit Theory Lecture Series',
    description: 'Complete video series covering basic to advanced circuit theory concepts with practical examples and simulations.',
    subject: 'ECE',
    semester: 2,
    type: 'VIDEO',
    link: 'https://youtube.com/your-link-here',
    tags: ['Circuits', 'Electrical', 'Theory', 'Video Series'],
    uploadDate: '2024-04-23',
    author: 'Dr. Johnson',
  },
];

interface MaterialListProps {
  filters: FilterOptions;
  materials: StudyMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<StudyMaterial[]>>;
  isLoggedIn: boolean;
}

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  material: StudyMaterial;
  onSave: (updatedMaterial: StudyMaterial) => void;
}

const EditDialog: React.FC<EditDialogProps> = ({ open, onClose, material, onSave }) => {
  const [editedMaterial, setEditedMaterial] = useState<StudyMaterial>(material);

  const handleChange = (field: keyof StudyMaterial) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedMaterial(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = () => {
    onSave(editedMaterial);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Material</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Title"
            fullWidth
            value={editedMaterial.title}
            onChange={handleChange('title')}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editedMaterial.description}
            onChange={handleChange('description')}
          />
          <TextField
            label="Link"
            fullWidth
            value={editedMaterial.link}
            onChange={handleChange('link')}
          />
          <TextField
            label="Author"
            fullWidth
            value={editedMaterial.author}
            onChange={handleChange('author')}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MaterialList: React.FC<MaterialListProps> = ({ filters, materials, setMaterials, isLoggedIn }) => {
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'downloads'>('date');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [downloads, setDownloads] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('downloads');
    return saved ? JSON.parse(saved) : {};
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<StudyMaterial | null>(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save downloads to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('downloads', JSON.stringify(downloads));
  }, [downloads]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch = material.title
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase()) ||
        material.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase());
      const matchesSubject = !filters.subject || material.subject === filters.subject;
      const matchesSemester = !filters.semester || material.semester === Number(filters.semester);
      const matchesType =
        filters.type === 'ALL' || material.type === filters.type;

      return matchesSearch && matchesSubject && matchesSemester && matchesType;
    });
  }, [filters, materials]);

  const sortedMaterials = useMemo(() => {
    return [...filteredMaterials].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      if (sortBy === 'downloads') {
        return (downloads[b.id] || 0) - (downloads[a.id] || 0);
      }
      return a.title.localeCompare(b.title);
    });
  }, [filteredMaterials, sortBy, downloads]);

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const incrementDownload = (id: string) => {
    setDownloads(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSelectChange = (field: string) => (event: any) => {
    // Implementation of handleSelectChange function
  };

  const handleEdit = (material: StudyMaterial) => {
    setCurrentMaterial(material);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await studyMaterialApi.remove(id);
        setMaterials(prev => prev.filter(material => material.id !== id));
        // Remove from favorites and downloads if present
        setFavorites(prev => prev.filter(fid => fid !== id));
        setDownloads(prev => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Failed to delete material. Please try again.');
      }
    }
  };

  const handleSaveEdit = (updatedMaterial: StudyMaterial) => {
    setMaterials(prev =>
      prev.map(material =>
        material.id === updatedMaterial.id ? updatedMaterial : material
      )
    );
  };

  if (filteredMaterials.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No materials found matching your filters.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
          <School sx={{ mr: 1 }} />
          {filteredMaterials.length} Materials Found
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={handleSortChange}>
            <MenuItem value="date">Latest First</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="downloads">Most Downloaded</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {sortedMaterials.map((material, index) => (
          <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }} key={material.id}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)'}`,
                  boxShadow: isDark 
                    ? '0 4px 8px rgba(0, 0, 0, 0.4)'
                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDark 
                      ? '0 8px 16px rgba(0, 0, 0, 0.6)'
                      : '0 4px 8px rgba(0, 0, 0, 0.2)',
                    borderColor: isDark 
                      ? 'rgba(255, 255, 255, 0.2)'
                      : theme.palette.primary.main,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    {material.type === 'PDF' ? (
                      <PictureAsPdf color="error" sx={{ mr: 1, mt: 0.5 }} />
                    ) : (
                      <YouTube color="error" sx={{ mr: 1, mt: 0.5 }} />
                    )}
                    <Box>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{
                          fontSize: '1.1rem',
                          fontWeight: 500,
                          color: isDark ? '#fff' : theme.palette.primary.main,
                          mb: 2,
                        }}
                      >
                        {material.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{
                          mb: 2,
                          opacity: 0.8,
                          lineHeight: 1.6,
                        }}
                      >
                        by {material.author}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <GetApp fontSize="small" />
                      {downloads[material.id] || 0} downloads
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{
                      mb: 2,
                      opacity: 0.8,
                      lineHeight: 1.6,
                    }}
                  >
                    {material.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    <Chip
                      size="small"
                      label={`${material.subject}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={`Semester ${material.semester}`}
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {material.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Open Material">
                      <Button
                        size="small"
                        color="primary"
                        variant="contained"
                        href={material.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={material.type === 'PDF' ? <PictureAsPdf /> : <YouTube />}
                        onClick={() => incrementDownload(material.id)}
                      >
                        Open
                      </Button>
                    </Tooltip>
                    <Tooltip title={favorites.includes(material.id) ? 'Remove from Favorites' : 'Add to Favorites'}>
                      <IconButton
                        size="small"
                        onClick={() => toggleFavorite(material.id)}
                        color={favorites.includes(material.id) ? 'secondary' : 'default'}
                      >
                        {favorites.includes(material.id) ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                    </Tooltip>
                    {isLoggedIn && (
                      <>
                        <Tooltip title="Edit Material">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(material)}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                backgroundColor: isDark 
                                  ? 'rgba(255, 255, 255, 0.1)' 
                                  : 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Material">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(material.id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                backgroundColor: isDark 
                                  ? 'rgba(255, 255, 255, 0.1)' 
                                  : 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                  <Tooltip title={formatDate(material.uploadDate)}>
                    <AccessTime fontSize="small" color="action" />
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          </Zoom>
        ))}
      </Grid>

      {currentMaterial && (
        <EditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          material={currentMaterial}
          onSave={handleSaveEdit}
        />
      )}
    </Box>
  );
};

export default MaterialList; 