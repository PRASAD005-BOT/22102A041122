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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
const WINDOW_SIZE = 10;

// Default data for fallback
const DEFAULT_NUMBERS = {
  'p': [2, 3, 5, 7, 11, 13, 17, 19, 23, 29], // Prime numbers
  'f': [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],   // Fibonacci numbers
  'e': [2, 4, 6, 8, 10, 12, 14, 16, 18, 20], // Even numbers
  'r': [7, 13, 24, 31, 42, 55, 68, 79, 91, 103] // Random numbers
};

function NumberCalculator() {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState('e');
  const [loading, setLoading] = useState(false);
  const [windowPrevState, setWindowPrevState] = useState([]);
  const [windowCurrState, setWindowCurrState] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [average, setAverage] = useState(0);

  const fetchNumbers = async (type) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/${type}`);
      
      if (response.data && response.data.numbers) {
        const newNumbers = response.data.numbers;
        updateWindow(newNumbers);
      }
    } catch (error) {
      console.error('Error fetching numbers:', error);
      // Use default data on API failure
      updateWindow(DEFAULT_NUMBERS[type]);
    } finally {
      setLoading(false);
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
              p: 3, 
              mt: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Number Average Calculator
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Number Type</InputLabel>
              <Select
                value={selectedType}
                label="Number Type"
                onChange={handleTypeChange}
                disabled={loading}
              >
                <MenuItem value="p">Prime Numbers</MenuItem>
                <MenuItem value="f">Fibonacci Numbers</MenuItem>
                <MenuItem value="e">Even Numbers</MenuItem>
                <MenuItem value="r">Random Numbers</MenuItem>
              </Select>
            </FormControl>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Previous Window State
                      </Typography>
                      <Typography variant="body1">
                        {windowPrevState.length > 0 
                          ? windowPrevState.join(', ')
                          : 'No previous state'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Current Window State
                      </Typography>
                      <Typography variant="body1">
                        {windowCurrState.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        New Numbers Received
                      </Typography>
                      <Typography variant="body1">
                        {numbers.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Average
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {average.toFixed(2)}
                      </Typography>
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