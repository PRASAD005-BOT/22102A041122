# Stock Analysis Dashboard

A responsive React application that displays real-time stock data and correlation analysis.

## Features

- Real-time stock price charts
- Interactive stock selection
- Time range selection (10, 30, 60 minutes)
- Correlation heatmap between stocks
- Average price and standard deviation calculations
- Material UI components for a modern look

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000

## API Endpoints

The application uses the following API endpoints:

- Get All Stocks: `http://20.244.56.144/evaluation-service/stocks`
- Get Stock Price History: `http://20.244.56.144/evaluation-service/stocks/{TICKER}?minutes={m}`

## Technologies Used

- React
- Material UI
- Recharts for data visualization
- Axios for API requests
- React Router for navigation
