import React from 'react';
import {
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  InputAdornment,
  SelectChangeEvent,
  useTheme,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  School,
  MenuBook,
  VideoLibrary,
  Description,
} from '@mui/icons-material';
import { FilterOptions } from '../../types/StudyMaterial';

interface FilterSectionProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ filters, setFilters }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleTextChange = (field: keyof FilterOptions) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const handleSelectChange = (field: keyof FilterOptions) => (
    event: SelectChangeEvent<string>
  ) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const hasActiveFilters = () => {
    return (
      filters.searchQuery ||
      filters.subject ||
      filters.semester ||
      filters.type !== 'ALL'
    );
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      subject: '',
      semester: '',
      type: 'ALL',
    });
  };

  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 3, 
        mb: 3,
        background: isDark
          ? 'linear-gradient(to right bottom, rgba(46, 59, 85, 0.3), rgba(26, 31, 53, 0.3))'
          : 'linear-gradient(to right bottom, rgba(46, 59, 85, 0.05), rgba(230, 57, 70, 0.05))',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        borderRadius: 2,
        '& .MuiInputLabel-root': {
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : theme.palette.text.primary,
        },
        '& .MuiOutlinedInput-root': {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
          '& fieldset': {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
          },
          '&:hover fieldset': {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.5)' : theme.palette.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
          },
        },
        '& .MuiInputBase-input': {
          color: isDark ? 'rgba(255, 255, 255, 0.9)' : theme.palette.text.primary,
        },
        '& .MuiSelect-icon': {
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : undefined,
        },
        '& .MuiInputAdornment-root .MuiSvgIcon-root': {
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : theme.palette.primary.main,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: theme.palette.text.primary,
            fontWeight: 500,
          }}
        >
          <FilterList sx={{ color: theme.palette.primary.main }} />
          Filter Materials
        </Typography>
        {hasActiveFilters() && (
          <Tooltip title="Clear all filters">
            <IconButton 
              onClick={clearFilters} 
              size="small"
              sx={{ 
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: isDark 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(46, 59, 85, 0.1)',
                },
              }}
            >
              <Clear />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search Materials"
            value={filters.searchQuery}
            onChange={handleTextChange('searchQuery')}
            placeholder="Search by title or description..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={filters.subject}
              label="Department"
              onChange={handleSelectChange('subject')}
              startAdornment={<MenuBook sx={{ ml: 1, mr: -0.5 }} />}
            >
              <MenuItem value="">All Departments</MenuItem>
              <MenuItem value="CSE-BC">CSE (IoT, Cyber Security including Blockchain Technology)</MenuItem>
              <MenuItem value="R&A">Robotics and Automation</MenuItem>
              <MenuItem value="AIML">Artificial Intelligence & Machine Learning</MenuItem>
              <MenuItem value="CIVIL">Civil Engineering</MenuItem>
              <MenuItem value="CSE">Computer Science and Engineering</MenuItem>
              <MenuItem value="CSD">Computer Science and Design</MenuItem>
              <MenuItem value="ECE">Electronics and Communication Engineering</MenuItem>
              <MenuItem value="EEE">Electrical and Electronics Engineering</MenuItem>
              <MenuItem value="ISE">Information Science and Engineering</MenuItem>
              <MenuItem value="MECH">Mechanical Engineering</MenuItem>
              <MenuItem value="MCA">Master of Computer Applications</MenuItem>
              <MenuItem value="MBA">Master of Business Administration</MenuItem>
              <MenuItem value="BCA">Bachelor of Computer Applications (BCA)</MenuItem>
              <MenuItem value="BBA">Bachelor of Business Administration (BBA)</MenuItem>
              <MenuItem value="BSH">Basic Sciences and Humanities</MenuItem>
              <MenuItem value="BSC">B.Sc. Honors</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Semester</InputLabel>
            <Select
              value={filters.semester}
              label="Semester"
              onChange={handleSelectChange('semester')}
              startAdornment={<School sx={{ ml: 1, mr: -0.5 }} />}
            >
              <MenuItem value="">All Semesters</MenuItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <MenuItem key={sem} value={sem}>
                  Semester {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={handleSelectChange('type')}
              startAdornment={
                filters.type === 'PDF' ? (
                  <Description sx={{ ml: 1, mr: -0.5 }} />
                ) : filters.type === 'VIDEO' ? (
                  <VideoLibrary sx={{ ml: 1, mr: -0.5 }} />
                ) : (
                  <FilterList sx={{ ml: 1, mr: -0.5 }} />
                )
              }
            >
              <MenuItem value="ALL">All Types</MenuItem>
              <MenuItem value="PDF">PDF</MenuItem>
              <MenuItem value="VIDEO">Video</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {hasActiveFilters() && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mr: 1, 
              mt: 0.5,
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : theme.palette.text.secondary,
            }}
          >
            Active Filters:
          </Typography>
          {filters.searchQuery && (
            <Chip
              size="small"
              label={`Search: ${filters.searchQuery}`}
              onDelete={() => setFilters({ ...filters, searchQuery: '' })}
              sx={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(46, 59, 85, 0.1)',
                color: theme.palette.text.primary,
                '& .MuiChip-deleteIcon': {
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : undefined,
                  '&:hover': {
                    color: isDark ? 'white' : undefined,
                  },
                },
              }}
            />
          )}
          {filters.subject && (
            <Chip
              size="small"
              label={`Department: ${filters.subject}`}
              onDelete={() => setFilters({ ...filters, subject: '' })}
              sx={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(46, 59, 85, 0.1)',
                color: theme.palette.text.primary,
                '& .MuiChip-deleteIcon': {
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : undefined,
                  '&:hover': {
                    color: isDark ? 'white' : undefined,
                  },
                },
              }}
            />
          )}
          {filters.semester && (
            <Chip
              size="small"
              label={`Semester ${filters.semester}`}
              onDelete={() => setFilters({ ...filters, semester: '' })}
              sx={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(46, 59, 85, 0.1)',
                color: theme.palette.text.primary,
                '& .MuiChip-deleteIcon': {
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : undefined,
                  '&:hover': {
                    color: isDark ? 'white' : undefined,
                  },
                },
              }}
            />
          )}
          {filters.type !== 'ALL' && (
            <Chip
              size="small"
              label={`Type: ${filters.type}`}
              onDelete={() => setFilters({ ...filters, type: 'ALL' })}
              sx={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(46, 59, 85, 0.1)',
                color: theme.palette.text.primary,
                '& .MuiChip-deleteIcon': {
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : undefined,
                  '&:hover': {
                    color: isDark ? 'white' : undefined,
                  },
                },
              }}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default FilterSection; 