import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShowChartIcon from '@mui/icons-material/ShowChart';
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

const generateDefaultStockData = (minutes) => {
  const data = [];
  const now = new Date();
  const basePrice = 150 + Math.random() * 50;
  
  for (let i = minutes; i >= 0; i--) {
    const time = new Date(now - i * 60000);
    const price = basePrice + (Math.random() - 0.5) * 10;
    data.push({
      time: time.toLocaleTimeString(),
      price: parseFloat(price.toFixed(2)),
      timestamp: time.toISOString(),
    });
  }
  return data;
};

axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;

function StockPage() {
  const theme = useTheme();
  const [stocks, setStocks] = useState(DEFAULT_STOCKS);
  const [selectedStock, setSelectedStock] = useState(DEFAULT_STOCKS[0].ticker);
  const [timeRange, setTimeRange] = useState(30);
  const [stockData, setStockData] = useState(generateDefaultStockData(30));
  const [averagePrice, setAveragePrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [usingDefaultData, setUsingDefaultData] = useState(false);
  const [selectedStockName, setSelectedStockName] = useState(DEFAULT_STOCKS[0].name);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/stocks`);
        if (response.data && Array.isArray(response.data)) {
          setStocks(response.data);
          if (response.data.length > 0) {
            setSelectedStock(response.data[0].ticker);
            setSelectedStockName(response.data[0].name);
          }
        }
        setUsingDefaultData(false);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setUsingDefaultData(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!selectedStock) return;
      
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/stocks/${selectedStock}?minutes=${timeRange}`
        );
        
        let data;
        if (Array.isArray(response.data)) {
          data = response.data.map(item => ({
            time: new Date(item.lastUpdatedAt).toLocaleTimeString(),
            price: item.price,
            timestamp: item.lastUpdatedAt,
          }));
        } else if (response.data.stock) {
          data = [{
            time: new Date(response.data.stock.lastUpdatedAt).toLocaleTimeString(),
            price: response.data.stock.price,
            timestamp: response.data.stock.lastUpdatedAt,
          }];
        }

        setStockData(data);
        updateStatistics(data);
        setUsingDefaultData(false);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        const defaultData = generateDefaultStockData(timeRange);
        setStockData(defaultData);
        updateStatistics(defaultData);
        setUsingDefaultData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [selectedStock, timeRange]);

  const updateStatistics = (data) => {
    if (data.length > 0) {
      const avg = data.reduce((sum, item) => sum + item.price, 0) / data.length;
      setAveragePrice(avg);
      
      const latest = data[data.length - 1].price;
      const oldest = data[0].price;
      setCurrentPrice(latest);
      setPriceChange(((latest - oldest) / oldest) * 100);
    }
  };

  const handleStockChange = (event) => {
    const ticker = event.target.value;
    setSelectedStock(ticker);
    const stock = stocks.find(s => s.ticker === ticker);
    if (stock) {
      setSelectedStockName(stock.name);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          elevation={3}
          sx={{ 
            p: 2, 
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle2" color="primary">
            Time: {label}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Price: ${payload[0].value.toFixed(2)}
          </Typography>
          {usingDefaultData && (
            <Typography variant="caption" color="warning.main">
              (Demo Data)
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Stock</InputLabel>
            <Select
              value={selectedStock}
              label="Select Stock"
              onChange={handleStockChange}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {stocks.map((stock) => (
                <MenuItem key={stock.ticker} value={stock.ticker}>
                  {stock.name} ({stock.ticker})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value={10}>10 minutes</MenuItem>
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={50}>50 minutes</MenuItem>
              <MenuItem value={60}>60 minutes</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && stockData.length > 0 && (
        <>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={3}
                sx={{ 
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Current Price</Typography>
                  </Box>
                  <Typography variant="h4">
                    ${currentPrice.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      icon={<ShowChartIcon />}
                      label={`${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`}
                      color={priceChange >= 0 ? "success" : "error"}
                      sx={{ 
                        backgroundColor: priceChange >= 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                        color: priceChange >= 0 ? '#4caf50' : '#f44336',
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                elevation={3}
                sx={{ 
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Average Price</Typography>
                  </Box>
                  <Typography variant="h4">
                    ${averagePrice.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Last {timeRange} minutes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              mt: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {selectedStockName} ({selectedStock}) Price History
              </Typography>
            </Box>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stockData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={theme.palette.divider}
                  />
                  <XAxis 
                    dataKey="time" 
                    label={{ 
                      value: 'Time', 
                      position: 'insideBottom', 
                      offset: -5,
                      fill: theme.palette.text.secondary,
                    }}
                    stroke={theme.palette.text.secondary}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    label={{ 
                      value: 'Price ($)', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: theme.palette.text.secondary,
                    }}
                    stroke={theme.palette.text.secondary}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    name="Price"
                  />
                  <Line
                    type="monotone"
                    dataKey={() => averagePrice}
                    stroke={theme.palette.secondary.main}
                    strokeDasharray="5 5"
                    name="Average"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
}

export default StockPage; 