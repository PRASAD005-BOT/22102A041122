import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import NumberCalculator from './pages/NumberCalculator';

function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Average Calculator
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Calculator
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        <Routes>
          <Route path="/" element={<NumberCalculator />} />
        </Routes>
      </Container>
    </>
  );
}

export default App; 