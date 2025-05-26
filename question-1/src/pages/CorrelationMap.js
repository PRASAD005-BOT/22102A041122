import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Container,
  useTheme,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://20.244.56.144/evaluation-service';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MjM1NjczLCJpYXQiOjE3NDgyMzUzNzMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjQxYTc5ZDBhLTVmYWEtNDJjMS1iYjAyLTAzNjA1MWY3NWJlOSIsInN1YiI6ImVuZ2luZWVycHJhc2FkMjFAZ21haWwuY29tIn0sImVtYWlsIjoiZW5naW5lZXJwcmFzYWQyMUBnbWFpbC5jb20iLCJuYW1lIjoidmFkbGFtdXJpIHZhcmEgcHJhc2FkIiwicm9sbE5vIjoiMjIxMDJhMDQxMTIyIiwiYWNjZXNzQ29kZSI6ImRKRnVmRSIsImNsaWVudElEIjoiNDFhNzlkMGEtNWZhYS00MmMxLWJiMDItMDM2MDUxZjc1YmU5IiwiY2xpZW50U2VjcmV0IjoiWUVUeUphTUpudWhCcGRXZSJ9._dsOTcguvEd2uA8-ELNP-XDFKWXoX-EwPRCFd7IagoM';

// Default stocks list
const DEFAULT_STOCKS = [
  { name: "Advanced Micro Devices, Inc.", ticker: "AMD" },
  { name: "Alphabet Inc. Class A", ticker: "GOOGL" },
  { name: "Alphabet Inc. Class C", ticker: "GOOG" },
  { name: "Amazon.com, Inc.", ticker: "AMZN" },
  { name: "Amgen Inc.", ticker: "AMGN" },
  { name: "Apple Inc.", ticker: "AAPL" },
  { name: "Berkshire Hathaway Inc.", ticker: "BRKB" },
  { name: "Booking Holdings Inc.", ticker: "BKNG" },
  { name: "Broadcom Inc.", ticker: "AVGO" },
  { name: "CSX Corporation", ticker: "CSX" },
  { name: "Eli Lilly and Company", ticker: "LLY" },
  { name: "Marriott International, Inc.", ticker: "MAR" },
  { name: "Marvell Technology, Inc.", ticker: "MRVL" },
  { name: "Meta Platforms, Inc.", ticker: "МЕТА" },
  { name: "Microsoft Corporation", ticker: "MSFT" },
  { name: "Nvidia Corporation", ticker: "NVDA" },
  { name: "PayPal Holdings, Inc.", ticker: "PYPL" },
  { name: "TSMC", ticker: "2330TW" },
  { name: "Tesla, Inc.", ticker: "TSLA" },
  { name: "Visa Inc.", ticker: "V" }
];

// Generate default correlation data
const generateDefaultCorrelationData = () => {
  const data = {};
  DEFAULT_STOCKS.forEach(stock1 => {
    data[stock1.ticker] = {};
    DEFAULT_STOCKS.forEach(stock2 => {
      if (stock1.ticker === stock2.ticker) {
        data[stock1.ticker][stock2.ticker] = 1;
      } else {
        // Generate random correlation between -1 and 1
        data[stock1.ticker][stock2.ticker] = parseFloat((Math.random() * 2 - 1).toFixed(2));
      }
    });
  });
  return data;
};

function CorrelationMap() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [correlationData, setCorrelationData] = useState(generateDefaultCorrelationData());
  const [stocks, setStocks] = useState(DEFAULT_STOCKS);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/stocks`);
        if (response.data && Array.isArray(response.data)) {
          setStocks(response.data);
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const getCorrelationColor = (value) => {
    // Convert correlation value (-1 to 1) to a color
    const hue = value > 0 ? 120 : 0; // Green for positive, Red for negative
    const saturation = Math.abs(value) * 100;
    const lightness = 50 + Math.abs(value) * 20;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <Container maxWidth="lg">
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
          Stock Correlation Heatmap
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: `auto repeat(${stocks.length}, 1fr)`,
              gap: 1,
              p: 2,
            }}>
              {/* Header row */}
              <Box sx={{ width: 150 }} /> {/* Empty corner cell */}
              {stocks.map(stock => (
                <Box
                  key={stock.ticker}
                  sx={{
                    p: 1,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'top left',
                    height: 100,
                    width: 100,
                    position: 'relative',
                    left: 50,
                  }}
                >
                  {stock.ticker}
                </Box>
              ))}

              {/* Data rows */}
              {stocks.map(stock1 => (
                <React.Fragment key={stock1.ticker}>
                  {/* Row label */}
                  <Box
                    sx={{
                      p: 1,
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      textAlign: 'right',
                      borderRight: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {stock1.ticker}
                  </Box>

                  {/* Correlation cells */}
                  {stocks.map(stock2 => {
                    const correlation = correlationData[stock1.ticker]?.[stock2.ticker] || 0;
                    return (
                      <Box
                        key={`${stock1.ticker}-${stock2.ticker}`}
                        sx={{
                          p: 1,
                          textAlign: 'center',
                          backgroundColor: getCorrelationColor(correlation),
                          color: Math.abs(correlation) > 0.5 ? 'white' : 'inherit',
                          fontSize: '0.8rem',
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                        title={`${stock1.ticker} vs ${stock2.ticker}: ${correlation.toFixed(2)}`}
                      >
                        {correlation.toFixed(2)}
                      </Box>
                    );
                  })}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        )}

        {/* Legend */}
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Typography variant="body2">Negative Correlation</Typography>
          <Box sx={{ 
            width: 200, 
            height: 20, 
            background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(0, 0%, 50%), hsl(120, 100%, 50%))',
            borderRadius: 1,
          }} />
          <Typography variant="body2">Positive Correlation</Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default CorrelationMap; 