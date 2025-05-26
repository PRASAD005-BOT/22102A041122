import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://20.244.56.144/evaluation-service';

// Helper function to calculate correlation coefficient
function calculateCorrelation(x, y) {
  const n = x.length;
  if (n !== y.length) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

function HeatmapPage() {
  const [stocks, setStocks] = useState([]);
  const [timeRange, setTimeRange] = useState(30);
  const [correlationMatrix, setCorrelationMatrix] = useState([]);
  const [stockStats, setStockStats] = useState({});

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/stocks`);
        setStocks(response.data);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      if (stocks.length === 0) return;

      try {
        // Fetch data for all stocks
        const stockData = await Promise.all(
          stocks.map(async (stock) => {
            const response = await axios.get(
              `${API_BASE_URL}/stocks/${stock.ticker}?minutes=${timeRange}`
            );
            return {
              ticker: stock.ticker,
              prices: response.data.map(item => item.price),
              timestamps: response.data.map(item => item.lastUpdatedAt),
            };
          })
        );

        // Calculate statistics for each stock
        const stats = {};
        stockData.forEach(({ ticker, prices }) => {
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
          const variance = prices.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / prices.length;
          stats[ticker] = {
            average: avg,
            stdDev: Math.sqrt(variance),
          };
        });
        setStockStats(stats);

        // Calculate correlation matrix
        const matrix = stocks.map((stock1) =>
          stocks.map((stock2) => {
            const data1 = stockData.find(d => d.ticker === stock1.ticker);
            const data2 = stockData.find(d => d.ticker === stock2.ticker);
            return calculateCorrelation(data1.prices, data2.prices);
          })
        );
        setCorrelationMatrix(matrix);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
  }, [stocks, timeRange]);

  const getColor = (correlation) => {
    const intensity = Math.abs(correlation);
    const hue = correlation > 0 ? 120 : 0; // Green for positive, Red for negative
    return `hsl(${hue}, 70%, ${100 - intensity * 50}%)`;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value={10}>10 minutes</MenuItem>
            <MenuItem value={30}>30 minutes</MenuItem>
            <MenuItem value={60}>60 minutes</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Stock Correlation Heatmap
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px' }}></th>
                {stocks.map((stock) => (
                  <th key={stock.ticker} style={{ padding: '8px' }}>
                    {stock.ticker}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock1, i) => (
                <tr key={stock1.ticker}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>
                    <Tooltip
                      title={
                        <div>
                          <div>Avg: ${stockStats[stock1.ticker]?.average.toFixed(2)}</div>
                          <div>Std Dev: ${stockStats[stock1.ticker]?.stdDev.toFixed(2)}</div>
                        </div>
                      }
                    >
                      <span>{stock1.ticker}</span>
                    </Tooltip>
                  </td>
                  {correlationMatrix[i]?.map((correlation, j) => (
                    <td
                      key={`${stock1.ticker}-${stocks[j].ticker}`}
                      style={{
                        padding: '8px',
                        backgroundColor: getColor(correlation),
                        textAlign: 'center',
                      }}
                    >
                      {correlation.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}

export default HeatmapPage; 