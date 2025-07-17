import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = memo(() => {
    return (
        <div className="flex flex-col min-h-screen">
            {/*<Header />*/}

            <main>
                <div>
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
});

export default Layout;