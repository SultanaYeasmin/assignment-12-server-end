# 🚀 Transito – Parcel Management System (Server Side)

This is the **backend (server side)** of the Transito Parcel Management System.  
Built with **Node.js, Express.js, and MongoDB**, it provides RESTful APIs for parcel booking, user authentication, delivery management, admin operations, and payment integration.

---

## 🌐 Live Server
🔗 [https://parcel-management-system-server-eight.vercel.app](https://parcel-management-system-server-eight.vercel.app)

---

## ✨ Features

- **User Management**
  - Register/Login (with Firebase authentication from client side)
  - Role-based system (User, DeliveryMan, Admin)
  - Admin can promote users to DeliveryMan or Admin

- **Parcel Management**
  - Book a parcel (with auto-calculated price)
  - Update or cancel parcel (pending only)
  - Assign delivery men (Admin only)
  - Update delivery status (DeliveryMan only)

- **Statistics & Dashboard**
  - Total parcels booked, delivered, and users count
  - Booking statistics by date using MongoDB Aggregation
  - Top 3 Delivery Men with average ratings

- **Reviews**
  - Users can review Delivery Men
  - Delivery Men can view their own reviews

- **Payment**
  - Stripe payment integration for parcel booking

- **Other Features**
  - Date range search for bookings
  - Pagination for users list
  - Environment variables for sensitive credentials (MongoDB, Stripe)

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** Firebase Auth (handled on client, validated in backend)
- **Payment:** Stripe
- **Deployment:** Vercel

---


## 📂 GitHub Repositories  

- **Client Side Repo:** [Click Here](https://github.com/SultanaYeasmin/assignment-12)  
- **Server Side Repo:** [Click Here](https://github.com/SultanaYeasmin/assignment-12-server-end)  

---