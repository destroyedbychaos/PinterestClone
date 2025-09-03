import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFoundPage from "../components/NotFoundPage";
import HomePage from "../pages/Home/HomePage";
import Layout from "../components/layout/Layout";
import LayoutWithoutSideMenu from "../components/layout/LayoutWithoutSideMenu";
import LayoutWithoutFooter from "../components/layout/LayoutWithoutFooter";
import LoginForm from "../pages/Auth/LoginForm.jsx";
import RegisterForm from "../pages/Auth/RegisterForm.jsx";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword.jsx";
import VerifyCode from "../pages/ForgotPassword/VerifyCode.jsx";
import ResetPassword from "../pages/ForgotPassword/ResetPassword.jsx";
import PasswordResetSuccess from "../pages/ForgotPassword/PasswordResetSuccess.jsx";
import ProfileBoards from "../pages/Profile/ProfileBoards.jsx";
import ProfileEdit from "../pages/Profile/ProfileEdit.jsx";
import SearchFilter from "../pages/Search/SearchFilter.jsx";
import SearchProfile from "../pages/Search/SearchProfile.jsx";
import UserProfile from "../pages/Profile/UserProfile.jsx";
import Notifications from "../pages/Notifications/Notifications.jsx";



const BasicRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                
                <Route path="*" element={<NotFoundPage />} />
            </Route>
            
            <Route path="/register" element={<LayoutWithoutSideMenu />}>
                <Route index element={<RegisterForm/>} />
            </Route>
            
            <Route path="/login" element={<LayoutWithoutSideMenu />}>
                <Route index element={<LoginForm/>} />
            </Route>
            
            <Route path="/forgotpassword" element={<Layout />}>
                <Route index element={<ForgotPassword/>} />
            </Route>
            
            <Route path="/verify-code" element={<Layout />}>
                <Route index element={<VerifyCode/>} />
            </Route>
            
            <Route path="/reset-password" element={<Layout />}>
                <Route index element={<ResetPassword/>} />
            </Route>
            
            <Route path="/password-reset-success" element={<Layout />}>
                <Route index element={<PasswordResetSuccess/>} />
            </Route>
            <Route path="/profile-boards" element={<Layout />}>
                <Route index element={<ProfileBoards/>} />
            </Route>
            <Route path="/profile-edit" element={<Layout />}>
                <Route index element={<ProfileEdit/>} />
            </Route>
            <Route path="/search-filter" element={<Layout />}>
                <Route index element={<SearchFilter/>} />
            </Route>
            <Route path="/search-profile" element={<Layout />}>
                <Route index element={<SearchProfile/>} />
            </Route>
            <Route path="/notifications" element={<Layout />}>
                <Route index element={<Notifications/>} />
            </Route>

            <Route path="/user/:username" element={<LayoutWithoutFooter />}>
                <Route index element={<UserProfile/>} />
            </Route>
        </Routes>
    );
};

export default BasicRoute;