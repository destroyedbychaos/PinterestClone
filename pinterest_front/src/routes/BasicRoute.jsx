import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFoundPage from "../components/NotFoundPage";
import HomePage from "../pages/Home/HomePage";
import Layout from "../components/layout/Layout";
import LayoutWithoutFooter from "../components/layout/LayoutWithoutFooter";
import LoginForm from "../pages/Auth/LoginForm.jsx";
import RegisterForm from "../pages/Auth/RegisterForm.jsx";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword.jsx";


const BasicRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                
                <Route path="/register" element={<RegisterForm/>} />
                
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            
            <Route path="/login" element={<LayoutWithoutFooter />}>
                <Route index element={<LoginForm/>} />
            </Route>
            
            <Route path="/forgotpassword" element={<LayoutWithoutFooter />}>
                <Route index element={<ForgotPassword/>} />
            </Route>
        </Routes>
    );
};

export default BasicRoute;