# Average Calculator

A React application that calculates averages from different types of numbers (prime, Fibonacci, even, random) using a sliding window approach.

## Features

- Select from different number types (prime, Fibonacci, even, random)
- Real-time average calculation using a sliding window
- Beautiful Material-UI interface
- Responsive design
- Default data handling for API failures

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd average-calculator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

To start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` directory.

## Project Structure

```
average-calculator/
├── src/
│   ├── pages/
│   │   └── NumberCalculator.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Technologies Used

- React
- Material-UI
- React Router
- Axios
- CSS3 