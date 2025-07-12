import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import SideMenu from "./SideMenu";

const Layout = memo(() => {
    return (
        <div className="flex flex-col min-h-screen">
             <div className="flex flex-1">
                <SideMenu />
                
                <main className="flex-1">
                    <div>
                        <Outlet />
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
});

export default Layout;