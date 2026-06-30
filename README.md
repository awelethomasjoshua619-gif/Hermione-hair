# React + Vite
# Hermione Hair E-Commerce Platform

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
This repository contains the source code for the Hermione Hair e-commerce website, a full-stack application built with a React frontend and a Node.js/Express backend.

Currently, two official plugins are available:
## ✨ Features

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
*   **Customer Frontend:** Product browsing, secure checkout with Paystack, order tracking, and user accounts.
*   **Admin Dashboard:** Comprehensive panel for managing products, orders, discounts, and customers.
*   **Advanced Analytics:** Insights into sales, visitors, and top-selling products.
*   **Secure Authentication:** JWT-based authentication with mandatory 2FA for administrators.
*   **Robust Backend:** Built with Express, Prisma, and TypeScript for a secure and scalable API.

## React Compiler
## 🛠️ Tech Stack

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
*   **Frontend:** React, Vite
*   **Backend:** Node.js, Express, TypeScript
*   **Database:** PostgreSQL (via Prisma ORM)
*   **Authentication:** JWT, 2FA (otplib)
*   **Payments:** Paystack

## Expanding the ESLint configuration
## 🚀 Getting Started

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Hermione-hair
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/awelethomasjoshua619-gif/Hermione-hair.git
    cd Hermione-hair
    ```
2.  **Install dependencies** for both frontend and backend.
3.  **Set up environment variables:** Create a `.env` file in the `backend/` directory based on `.env.example`.
4.  **Run the development servers:** Use the `run_all.bat` script to start the frontend, backend, and a Cloudflare tunnel for webhook testing.
