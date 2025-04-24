import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { StudyMaterial } from '../../types/StudyMaterial';
import { studyMaterialApi } from '../../lib/api';

interface AddMaterialProps {
  onAdd: (material: StudyMaterial) => void;
  onClose: () => void;
  open: boolean;
}

const AddMaterial: React.FC<AddMaterialProps> = ({ onAdd, onClose, open }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [type, setType] = useState<'PDF' | 'VIDEO'>('PDF');
  const [link, setLink] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !subject || !semester || !link || !author) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const newMaterial = await studyMaterialApi.create({
        title,
        description,
        subject,
        semester: parseInt(semester),
        type,
        link,
        tags,
        author,
      });

      onAdd({
        id: newMaterial.id,
        title: newMaterial.title,
        description: newMaterial.description || '',
        subject: newMaterial.categoryId,
        semester: newMaterial.semester,
        type: newMaterial.type as 'PDF' | 'VIDEO',
        link: newMaterial.fileUrl,
        tags: newMaterial.tags,
        uploadDate: newMaterial.createdAt.toISOString(),
        author: newMaterial.author
      });
      
      handleReset();
      onClose();
    } catch (err) {
      setError('Failed to add study material. Please try again.');
      console.error('Error adding material:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setSemester('');
    setType('PDF');
    setLink('');
    setAuthor('');
    setTags([]);
    setCurrentTag('');
    setError('');
  };

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Add New Study Material
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Subject</InputLabel>
            <Select value={subject} label="Subject" onChange={(e) => setSubject(e.target.value)}>
              <MenuItem value="CSE">Computer Science Engineering</MenuItem>
              <MenuItem value="ECE">Electronics & Communication Engineering</MenuItem>
              <MenuItem value="EEE">Electrical & Electronics Engineering</MenuItem>
              <MenuItem value="ME">Mechanical Engineering</MenuItem>
              <MenuItem value="CE">Civil Engineering</MenuItem>
              <MenuItem value="BCA">Bachelor of Computer Applications</MenuItem>
              <MenuItem value="BBA">Bachelor of Business Administration</MenuItem>
              <MenuItem value="BSH">Basic Sciences and Humanities</MenuItem>
              <MenuItem value="BSC">B.Sc. Honors</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Semester</InputLabel>
            <Select value={semester} label="Semester" onChange={(e) => setSemester(e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <MenuItem key={sem} value={sem}>
                  Semester {sem}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select value={type} label="Type" onChange={(e) => setType(e.target.value as 'PDF' | 'VIDEO')}>
              <MenuItem value="PDF">PDF</MenuItem>
              <MenuItem value="VIDEO">Video</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Link (Google Drive/YouTube)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Author/Faculty Name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add tags..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button variant="outlined" onClick={handleAddTag}>
                <AddIcon />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Material'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMaterial; 
