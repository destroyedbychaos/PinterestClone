import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import SideMenu from "./SideMenu";

const LayoutWithoutFooter = memo(() => {
    return (
        <div className="flex flex-col min-h-screen">
             <div className="flex flex-1">
                <SideMenu />
                
                <main className="flex-1 min-h-screen ml-36">
                    <div>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
});

export default LayoutWithoutFooter;
