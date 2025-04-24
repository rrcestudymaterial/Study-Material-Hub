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
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { StudyMaterial } from '../../types/StudyMaterial';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !subject || !semester || !link || !author) {
      setError('Please fill in all required fields');
      return;
    }

    const newMaterial: StudyMaterial = {
      id: Date.now().toString(),
      title,
      description,
      subject,
      semester: parseInt(semester),
      type,
      link,
      tags,
      uploadDate: new Date().toISOString(),
      author,
    };

    onAdd(newMaterial);
    handleReset();
    onClose();
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
            <InputLabel>Department</InputLabel>
            <Select value={subject} label="Department" onChange={(e) => setSubject(e.target.value)}>
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
        <Button onClick={handleReset}>Reset</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Material
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMaterial; 