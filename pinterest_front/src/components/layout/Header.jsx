import { Link, useNavigate } from "react-router-dom";
import { memo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Badge } from "@mui/material";
import { Search, Notifications, BookmarkBorder, ExpandMore } from "@mui/icons-material";
import { logout } from "../../../store/slices/AuthSlice.js";

const adminPages = [
    { title: "Boards", path: "/boards" },
    { title: "Creators", path: "/creators" },
    { title: "Users", path: "/users" },
    { title: "Pins", path: "/pins" },
];

const Header = memo(() => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    
    const isAdmin = user?.role === 'Admin';
    const isLoggedIn = isAuthenticated;

    const [adminMenuOpen, setAdminMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const toggleAdminMenu = () => {
        setAdminMenuOpen(!adminMenuOpen);
        if (userMenuOpen) setUserMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setUserMenuOpen(!userMenuOpen);
        if (adminMenuOpen) setAdminMenuOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        setUserMenuOpen(false);
    };
    
    const handleNFTMarketClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('NFT Market button clicked!', e);
        console.log('Attempting to navigate to /nft-market');
        try {
            navigate('/nft-market');
            console.log('Navigation successful');
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback
            window.location.href = '/nft-market';
        }
    };
    
    const closeMenus = () => {
        setAdminMenuOpen(false);
        setUserMenuOpen(false);
    };

    return (
        <>
            {(adminMenuOpen || userMenuOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={closeMenus}
                ></div>
            )}

            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center">
                            <span className="text-red-600 font-bold text-2xl">Clone Pinterest</span>
                        </Link>

                        <nav className="hidden md:flex space-x-4">
                            <Link to="/" className="text-gray-700 hover:text-red-600 font-medium px-3 py-2 rounded-full hover:bg-gray-100">
                                Home
                            </Link>
                            <Link to="/explore" className="text-gray-700 hover:text-red-600 font-medium px-3 py-2 rounded-full hover:bg-gray-100">
                                Explore
                            </Link>
                            <Link to="/pins" className="text-gray-700 hover:text-red-600 font-medium px-3 py-2 rounded-full hover:bg-gray-100">
                                Pins
                            </Link>
                            <div 
                                onClick={handleNFTMarketClick}
                                className="text-gray-700 hover:text-red-600 font-medium px-3 py-2 rounded-full hover:bg-gray-100 flex items-center cursor-pointer"
                                style={{ 
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    MozUserSelect: 'none',
                                    msUserSelect: 'none'
                                }}
                            >
                                <div className="w-5 h-5 mr-1 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-current rounded-sm relative">
                                        <div className="absolute inset-1 bg-current opacity-20"></div>
                                        <div className="absolute inset-2 bg-current"></div>
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-current rounded-full"></div>
                                    </div>
                                </div>
                                <span>NFT Market</span>
                            </div>
                        </nav>

                        <div className="hidden md:flex flex-1 max-w-xl mx-4">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="bg-gray-100 text-gray-900 w-full pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Search for ideas..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {isLoggedIn && (
                                <>
                                    <Link to="/saved" className="p-2 text-gray-700 hover:bg-gray-100 rounded-full">
                                        <Badge color="error">
                                            <BookmarkBorder />
                                        </Badge>
                                    </Link>

                                    <Link to="/notifications" className="p-2 text-gray-700 hover:bg-gray-100 rounded-full">
                                        <Badge color="error">
                                            <Notifications />
                                        </Badge>
                                    </Link>
                                </>
                            )}

                            {isAdmin && (
                                <div className="relative">
                                    <button
                                        className="p-2 text-gray-700 hover:bg-gray-100 rounded-full flex items-center"
                                        onClick={toggleAdminMenu}
                                    >
                                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                            Admin
                                        </span>
                                        <ExpandMore className="text-gray-500 ml-1" fontSize="small" />
                                    </button>
                                    {adminMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                            {adminPages.map((page) => (
                                                <Link
                                                    key={page.path}
                                                    to={page.path}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={closeMenus}
                                                >
                                                    {page.title}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {isLoggedIn ? (
                                <div className="relative">
                                    <button
                                        className="p-1 rounded-full flex items-center focus:outline-none hover:bg-gray-100"
                                        onClick={toggleUserMenu}
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <ExpandMore className="text-gray-500 ml-1" fontSize="small" />
                                    </button>
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                            <div className="px-4 py-2 text-sm text-gray-500 border-b">
                                                {user?.email || user?.Email}
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={closeMenus}
                                            >
                                                My Profile
                                            </Link>
                                            <Link
                                                to="/settings"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={closeMenus}
                                            >
                                                Settings
                                            </Link>
                                            <Link
                                                to="/my-pins"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={closeMenus}
                                            >
                                                My Pins
                                            </Link>
                                            <hr className="my-1" />
                                            <button
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={handleLogout}
                                            >
                                                Log Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Link to="/login" className="px-4 py-2 text-red-600 font-medium hover:bg-gray-100 rounded-full">
                                        Log in
                                    </Link>
                                    <Link to="/register" className="px-4 py-2 bg-red-600 text-white font-medium rounded-full hover:bg-red-700">
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
});

export default Header;