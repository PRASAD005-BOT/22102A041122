import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import StockPage from './pages/StockPage';
import CorrelationMap from './pages/CorrelationMap';

function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stock Analysis
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
              Stock Prices
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/correlation"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Correlation Map
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        <Routes>
          <Route path="/" element={<StockPage />} />
          <Route path="/correlation" element={<CorrelationMap />} />
        </Routes>
      </Container>
    </>
  );
}

export default App; 