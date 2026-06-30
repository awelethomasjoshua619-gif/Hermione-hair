# Hermione Hair E-Commerce Platform

This repository contains the source code for the Hermione Hair e-commerce website, a full-stack application built with a React frontend and a Node.js/Express backend.

## ✨ Features

*   **Customer Frontend:** Product browsing, secure checkout with Paystack, order tracking, and user accounts.
*   **Admin Dashboard:** Comprehensive panel for managing products, orders, discounts, and customers.
*   **Advanced Analytics:** Insights into sales, visitors, and top-selling products.
*   **Secure Authentication:** JWT-based authentication with mandatory 2FA for administrators.
*   **Robust Backend:** Built with Express, Prisma, and TypeScript for a secure and scalable API.

## 🛠️ Tech Stack

*   **Frontend:** React, Vite
*   **Backend:** Node.js, Express, TypeScript
*   **Database:** PostgreSQL (via Prisma ORM)
*   **Authentication:** JWT, 2FA (otplib)
*   **Payments:** Paystack

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/awelethomasjoshua619-gif/Hermione-hair.git
    cd Hermione-hair
    ```
2.  **Install dependencies** for both frontend and backend.
3.  **Set up environment variables:** Create a `.env` file in the `backend/` directory based on `.env.example`.
4.  **Run the development servers:** Use the `run_all.bat` script to start the frontend, backend, and a Cloudflare tunnel for webhook testing.
