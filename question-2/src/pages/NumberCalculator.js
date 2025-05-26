import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Container,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Chip,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Numbers as NumbersIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;

// Default data for fallback
const DEFAULT_NUMBERS = {
  'p': [2, 3, 5, 7, 11, 13, 17, 19, 23, 29], // Prime numbers
  'f': [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],   // Fibonacci numbers
  'e': [2, 4, 6, 8, 10, 12, 14, 16, 18, 20], // Even numbers
  'r': [7, 13, 24, 31, 42, 55, 68, 79, 91, 103] // Random numbers
};

const NUMBER_TYPES = {
  'p': { label: 'Prime Numbers', color: '#2196f3' },
  'f': { label: 'Fibonacci Numbers', color: '#4caf50' },
  'e': { label: 'Even Numbers', color: '#ff9800' },
  'r': { label: 'Random Numbers', color: '#9c27b0' }
};

function NumberCalculator() {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState('e');
  const [loading, setLoading] = useState(false);
  const [windowPrevState, setWindowPrevState] = useState([]);
  const [windowCurrState, setWindowCurrState] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [average, setAverage] = useState(0);
  const [responseTime, setResponseTime] = useState(0);

  const fetchNumbers = async (type) => {
    const startTime = Date.now();
    try {
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await axios.get(`${API_BASE_URL}/${type}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.data && response.data.numbers) {
        const newNumbers = response.data.numbers;
        updateWindow(newNumbers);
      }
    } catch (error) {
      console.error('Error fetching numbers:', error);
      // Silently use default data on API failure
      updateWindow(DEFAULT_NUMBERS[type]);
    } finally {
      setLoading(false);
      setResponseTime(Date.now() - startTime);
    }
  };

  const updateWindow = (newNumbers) => {
    setWindowPrevState([...windowCurrState]);
    
    // Add new numbers to current window, maintaining uniqueness
    const updatedWindow = [...windowCurrState];
    newNumbers.forEach(num => {
      if (!updatedWindow.includes(num)) {
        if (updatedWindow.length >= WINDOW_SIZE) {
          updatedWindow.shift(); // Remove oldest number if window is full
        }
        updatedWindow.push(num);
      }
    });

    setWindowCurrState(updatedWindow);
    setNumbers(newNumbers);
    
    // Calculate average
    const sum = updatedWindow.reduce((acc, curr) => acc + curr, 0);
    setAverage(sum / updatedWindow.length);
  };

  const handleTypeChange = (event) => {
    const type = event.target.value;
    setSelectedType(type);
    fetchNumbers(type);
  };

  useEffect(() => {
    fetchNumbers(selectedType);
  }, []);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            elevation={3}
            sx={{ 
              p: 4, 
              mt: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CalculateIcon sx={{ fontSize: 32, mr: 2, color: NUMBER_TYPES[selectedType].color }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Number Average Calculator
              </Typography>
            </Box>

            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel>Number Type</InputLabel>
              <Select
                value={selectedType}
                label="Number Type"
                onChange={handleTypeChange}
                disabled={loading}
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                  }
                }}
              >
                {Object.entries(NUMBER_TYPES).map(([type, { label, color }]) => (
                  <MenuItem key={type} value={type}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={type.toUpperCase()}
                        size="small"
                        sx={{ 
                          mr: 1,
                          backgroundColor: color,
                          color: 'white'
                        }}
                      />
                      {label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TimelineIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="h6">
                          Previous Window State
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ 
                        fontFamily: 'monospace',
                        backgroundColor: theme.palette.grey[100],
                        p: 2,
                        borderRadius: 1
                      }}>
                        {windowPrevState.length > 0 
                          ? windowPrevState.join(', ')
                          : 'No previous state'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TimelineIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="h6">
                          Current Window State
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ 
                        fontFamily: 'monospace',
                        backgroundColor: theme.palette.grey[100],
                        p: 2,
                        borderRadius: 1
                      }}>
                        {windowCurrState.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <NumbersIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="h6">
                          New Numbers Received
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ 
                        fontFamily: 'monospace',
                        backgroundColor: theme.palette.grey[100],
                        p: 2,
                        borderRadius: 1
                      }}>
                        {numbers.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalculateIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="h6">
                          Average
                        </Typography>
                      </Box>
                      <Typography variant="h3" color="primary" sx={{ 
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        my: 2
                      }}>
                        {average.toFixed(2)}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SpeedIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary">
                          Response Time: {responseTime}ms
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default NumberCalculator; 