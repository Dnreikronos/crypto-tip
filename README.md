<div align="center">
  <img src="frontend/public/logo.png" alt="CryptoTip Logo" width="120" height="120">
  
  # CryptoTip
  
  **Get Crypto Funding for Your Code**
</div>

CryptoTip is a developer-first platform where you can register your open-source projects to receive cryptocurrency donations. Built with blockchain technology, it provides transparency, security, and global accessibility for open-source funding.

## Table of Contents

- [Introduction](#introduction)
- [Technologies Used](#technologies-used)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Conclusion](#conclusion)

## Introduction

- Project Registration: Register your open-source projects to start receiving donations.

- Cryptocurrency Donations: Accept financial support in various cryptocurrencies.

- Blockchain-Powered: Ensures all transactions are transparent and secure.

- Global Access: Supports open-source funding from anywhere in the world.



## Technologies Used

### Frontend



### Backend



## Installation

Before you start, ensure you have `node` and `npm` installed on your machine. 

1. **Clone the repository**:
   
   ```bash
   git clone https://github.com/Dnreikronos/crypto-tip.git
   ```

2. **Navigate to the repository**:

   ```bash
   cd crypto-tip
   ```

3. **Install the dependencies**:

   - For Frontend:
   
     ```bash
     cd frontend && npm install
     ```

   - For Backend:

     ```bash
      cd backend && docker-compose up --build
     ```

## Running the Application

- **To run the frontend**:

  ```bash
  npm run start-frontend
  ```

  This starts the React application on `http://localhost:3000` (or another available port).

- **To run the backend**:

  ```bash
   docker-compose up
  ```

  This initializes the Go server, typically on `http://localhost:9090`.


---

If you find any bugs or have a feature request, please open an issue on [GitHub](https://github.com/Dnreikronos/crypto-tip/issues).
