import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFoundPage from "../components/NotFoundPage";
import HomePage from "../pages/Home/HomePage";
import Layout from "../components/layout/Layout";
import LayoutWithoutFooter from "../components/layout/LayoutWithoutFooter";
import LoginForm from "../pages/Auth/LoginForm.jsx";
import RegisterForm from "../pages/Auth/RegisterForm.jsx";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword.jsx";
import VerifyCode from "../pages/ForgotPassword/VerifyCode.jsx";
import ResetPassword from "../pages/ForgotPassword/ResetPassword.jsx";
import PasswordResetSuccess from "../pages/ForgotPassword/PasswordResetSuccess.jsx";


const BasicRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            
            <Route path="/register" element={<LayoutWithoutFooter />}>
                <Route index element={<RegisterForm/>} />
            </Route>
            
            <Route path="/login" element={<LayoutWithoutFooter />}>
                <Route index element={<LoginForm/>} />
            </Route>
            
            <Route path="/forgotpassword" element={<LayoutWithoutFooter />}>
                <Route index element={<ForgotPassword/>} />
            </Route>
            
            <Route path="/verify-code" element={<LayoutWithoutFooter />}>
                <Route index element={<VerifyCode/>} />
            </Route>
            
            <Route path="/reset-password" element={<LayoutWithoutFooter />}>
                <Route index element={<ResetPassword/>} />
            </Route>
            
            <Route path="/password-reset-success" element={<LayoutWithoutFooter />}>
                <Route index element={<PasswordResetSuccess/>} />
            </Route>
        </Routes>
    );
};

export default BasicRoute;