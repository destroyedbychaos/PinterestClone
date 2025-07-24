import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const LayoutWithoutFooter = memo(() => {
    return (
        <div className="flex flex-col min-h-screen">
            <main>
                <div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
});

export default LayoutWithoutFooter; 