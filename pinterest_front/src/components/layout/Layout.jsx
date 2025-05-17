import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = memo(() => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
                <div className="max-w-screen-xl mx-auto">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
});

export default Layout;