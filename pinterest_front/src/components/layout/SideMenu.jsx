import { Box } from "@mui/material";
import { memo, useState, useEffect } from "react";
import { useTheme } from '@mui/material/styles';
import { Link, useLocation } from "react-router-dom";
import { Icon as Iconify } from '@iconify/react';
import icon from '../../assets/images/logo.png';

const SideMenu = memo(({ isUnverified = false, flush = false }) => {
    const theme = useTheme();
    const location = useLocation();
    const [activeIcon, setActiveIcon] = useState('');

    useEffect(() => {
        const path = location.pathname;
        if (path === '/') {
            setActiveIcon('home');
        } else if (path === '/create-aest') {
            setActiveIcon('add');
        } else if (path === '/notifications') {
            setActiveIcon('notifications');
        } else if (path === '/comments') {
            setActiveIcon('comments');
        } else if (path === '/profile-boards') {
            setActiveIcon('profile');
        } else if (path === '/history') {
            setActiveIcon('history');
        } else if (path === '/settings') {
            setActiveIcon('settings');
        } else if (path === '/info') {
            setActiveIcon('info');
        } else {
            setActiveIcon('');
        }
    }, [location.pathname]);

    const getIconColor = (iconName) => {
        return activeIcon === iconName ? theme.palette.primary.main : theme.palette.dark[500];
    };

    const getIconName = (iconType, isActive) => {
        const iconMap = {
            home: isActive ? 'octicon:home-fill-24' : 'octicon:home-24',
            add: isActive ? 'akar-icons:circle-plus-fill' : 'octicon:plus-circle-24',
            notifications: isActive ? 'octicon:bell-fill-24' : 'octicon:bell-24',
            comments: isActive ? 'octicon:comment-discussion-24' : 'octicon:comment-discussion-24',
            profile: isActive ? 'octicon:person-fill-24' : 'octicon:person-24',
            history: isActive ? 'octicon:clock-fill-24' : 'octicon:clock-24',
            settings: isActive ? 'octicon:gear-24' : 'octicon:gear-24',
            info: isActive ? 'octicon:unverified-24' : 'octicon:unverified-24'
        };
        return iconMap[iconType] || iconMap[iconType];
    };

    return (
        <Box sx={{ 
            width: '144px',
            minHeight: '100vh',
            height: '100vh',
            backgroundColor: theme.palette.blue?.[50],
            display: 'flex', 
            padding: flush ? 0 : '44px 0',
            alignItems: 'flex-start',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000
        }}>
            <Box sx={{
                width: '108px',
                minHeight: '100vh', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', 
                gap: '44px',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '46px' }}>
                    <Box sx={{ 
                        width: 56, 
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'relative'
                    }}>
                        <img 
                            src={icon}
                            alt="Logo"
                            style={{
                                width: 35,
                                height: 35,
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 1
                            }}
                        />
                    </Box>

                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '25px'
                    }}>
                        {isUnverified ? (
                            <Link 
                                to="/info"
                                className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12 hover:!bg-blue-500/10 active:!bg-blue-500/20"
                            >
                                <Iconify 
                                    icon={getIconName('info', activeIcon === 'info')} 
                                    width={35}
                                    height={35}
                                    color={getIconColor('info')}
                                />
                            </Link>
                        ) : (
                            <>
                                <Link 
                                    to="/"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12 hover:!bg-blue-500/10 active:!bg-blue-500/20"
                                    style={{
                                        backgroundColor: activeIcon === 'home' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                                    }}
                                >
                                    <Iconify 
                                        icon={getIconName('home', activeIcon === 'home')} 
                                        width={35} 
                                        height={35} 
                                        color={getIconColor('home')} 
                                    />
                                </Link>
                                <Link 
                                    to="/create-aest"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12 hover:!bg-blue-500/10 active:!bg-blue-500/20"
                                    style={{
                                        backgroundColor: activeIcon === 'add' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                                    }}
                                >
                                    <Iconify 
                                        icon={getIconName('add', activeIcon === 'add')} 
                                        width={35} 
                                        height={35} 
                                        color={getIconColor('add')} 
                                    />
                                </Link>
                                <Link 
                                    to="/notifications"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12 hover:!bg-blue-500/10 active:!bg-blue-500/20"
                                    style={{
                                        backgroundColor: activeIcon === 'notifications' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                                    }}
                                >
                                    <Iconify 
                                        icon={getIconName('notifications', activeIcon === 'notifications')} 
                                        width={35} 
                                        height={35} 
                                        color={getIconColor('notifications')} 
                                    />
                                </Link>
                                <Link 
                                    to="/comments"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12 hover:!bg-blue-500/10 active:!bg-blue-500/20"
                                    style={{
                                        backgroundColor: activeIcon === 'comments' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                                    }}
                                >
                                    <Iconify 
                                        icon={getIconName('comments', activeIcon === 'comments')} 
                                        width={35} 
                                        height={35} 
                                        color={getIconColor('comments')} 
                                    />
                                </Link>
                                <Link 
                                    to="/profile-boards"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12 hover:!bg-blue-500/10 active:!bg-blue-500/20"
                                    style={{
                                        backgroundColor: activeIcon === 'profile' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                                    }}
                                >
                                    <Iconify 
                                        icon={getIconName('profile', activeIcon === 'profile')} 
                                        width={35} 
                                        height={35} 
                                        color={getIconColor('profile')} 
                                    />
                                </Link>
                                <Link 
                                    to="/history"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12 hover:!bg-blue-500/10 active:!bg-blue-500/20"
                                    style={{
                                        backgroundColor: activeIcon === 'history' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                                    }}
                                >
                                    <Iconify 
                                        icon={getIconName('history', activeIcon === 'history')} 
                                        width={35} 
                                        height={35} 
                                        color={getIconColor('history')} 
                                    />
                                </Link>
                            </>
                        )}
                    </Box>
                </Box>
                
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginBottom: '230px'
                }}>
                    {!isUnverified && (
                        <Link 
                            to="/settings"
                            className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12 hover:!bg-blue-500/10 active:!bg-blue-500/20"
                            style={{
                                backgroundColor: activeIcon === 'settings' ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                            }}
                        >
                            <Iconify 
                                icon={getIconName('settings', activeIcon === 'settings')}
                                width={35}
                                height={35}
                                color={getIconColor('settings')}
                            />
                        </Link>
                    )}
                </Box>
            </Box>
            
            <Box sx={{
                width: '36px', 
                minHeight: '100vh',
                backgroundColor: 'white',
                position: 'absolute',
                top: 0,
                right: 0,
                borderRadius: isUnverified ? '40px 0 0 40px' : '40px 0 0 0'
            }} />
        </Box>
    );
});

export default SideMenu;