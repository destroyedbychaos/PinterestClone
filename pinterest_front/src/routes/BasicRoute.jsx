import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFoundPage from "../components/NotFoundPage";
import HomePage from "../pages/Home/HomePage";
import Layout from "../components/layout/Layout";
import LoginForm from "../pages/Auth/LoginForm.jsx";
import RegisterForm from "../pages/Auth/RegisterForm.jsx";
import ForgotPassword1 from "../pages/ForgotPassword/ForgotPassword1.jsx";


const BasicRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                
                <Route path="/login" element={<LoginForm/>} />
                <Route path="/register" element={<RegisterForm/>} />
                <Route path="/forgotpassword1" element={<ForgotPassword1/>} />

                
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

export default BasicRoute;