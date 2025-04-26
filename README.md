### 🛍️ Product Management API

A simple product management backend built using **Node.js**, **Express**, and **MongoDB**.  
Supports operations like product listing, filtering, search, sorting, and user reviews with ratings.

---

## 🚀 Features

- Product CRUD operations  
- Rating and Review system  
- Trending products (by highest rating)  
- Advanced product filtering, search & pagination  
- JWT-based authentication (if applicable)  
- MongoDB aggregation for analytics

---

## 🧰 Tech Stack

- Node.js  
- Express.js  
- MongoDB + Mongoose  
- dotenv  
- nodemon (for development)

---

## ⚙️ Setup Instructions

### 1. 📁 Clone the repository

```bash
git clone https://github.com/yourusername/product-management.git
```

---

### 2. 📦 Install dependencies

```bash
npm install
```

---

### 3. ⚙️ Configure environment variables

Create a `.env` file in the root and add the following:

```
PORT = 5000
HOST = "localhost"
SECRET_KEY = your-secret-key
KEY = your-key
URL = your-mongodb-url
PROFILE_IMAGE_PATH = your-profile-image-path
PRODUCT_IMAGE_PATH = your-product-image-path
IMAGE_PATH = your-image-path
```

---

### 4. ▶️ Start the server

```bash
npm start
```

Server will run on `http://localhost:5000`

---


## 📁 Folder Structure

```
project/
│
├── controllers/        # Route handlers
├── models/             # Mongoose schemas
├── routes/             # API route definitions
├── middleware/         # Auth / error handling
├── config/             # DB config, etc.
├── .env                # Environment variables
├── app.js              # App entry point
```

---

## 🧪 Testing

You can test endpoints using tools like:

- Postman

---

## 📃 License

This project is open-source and free to use under the [MIT License](LICENSE).
