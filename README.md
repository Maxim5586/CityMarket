# CityMarket
## Description
CityMarket is an e-commerce platform for clothing from various popular brands. The website is developed using EJS and Node.js, offering users an intuitive shopping experience with real-time catalog filtering, brand selection, and secure payments via PayPal.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Technologies](#technologies)

## Installation
**Requirements :**
- Node.js (v16 or higher recommended)
- npm (v8 or higher recommended)

**Setup :**
1. Clone the repository : `https://github.com/Maxim5586/CityMarket.git`
2. Go to the root directory : `cd Serveur`
3. Install dependencies : `npm install`
4. Set up the `.env` file by copying the `.env.example` file and filling in the necessary values :
  - `CLIENT_ID`: PayPal client ID.
  - `DATABASE_LINK`: MongoDB connection string.
  - `APP_SECRET`: PayPal app secret key.
  - `PORT`: Port on which the server will be running.

## Usage
**Executable Commands**
1. Run the project locally : `node server.js`

## Features
- Responsive Design: Optimized for mobile, tablet, and desktop viewing.
- PayPal Integration: Secure payment gateway integration.
- Real-Time Catalog Filtering: Users can filter items by brand, size, and price.
- Dynamic Catalog Page: Display and manage a variety of clothing items, with quick navigation and filtering.
- User Reviews: Customers can leave comments and rate products.

## Technologies
- Node.js and Express.js: Backend development.
- EJS: Templating engine for dynamic pages.
- MongoDB: Database for storing user data and product information.
- PayPal API: Secure payment processing.
- CSS and Responsive Design: Optimized user interface for all devices.

