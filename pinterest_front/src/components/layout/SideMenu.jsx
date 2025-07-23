import { Box } from "@mui/material";
import { memo } from "react";
import { useTheme } from '@mui/material/styles';
import { Link } from "react-router-dom";
import { Icon as Iconify } from '@iconify/react';
import icon from '../../assets/images/logo.png';

const SideMenu = memo(({ isUnverified = true }) => {
    const theme = useTheme();

    return (
        <Box sx={{ 
            width: '144px',
            minHeight: '100vh',
            height: '100vh',
            backgroundColor: theme.palette.blue?.[50],
            display: 'flex', 
            padding: '44px 0',
            alignItems: 'flex-start',
            position: 'relative'
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
                                    icon="octicon:unverified-24" 
                                    width={35}
                                    height={35}
                                    color={theme.palette.dark[500]}
                                />
                            </Link>
                        ) : (
                            <>
                                <Link 
                                    to="/"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-blue-500/10 active:bg-blue-500/20 hover:scale-110 active:scale-95"
                                >
                                    <Iconify icon="octicon:home-fill-24" width={35} height={35} color={theme.palette.primary.main} />
                                </Link>
                                <Link 
                                    to="/add"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12"
                                >
                                    <Iconify icon="octicon:plus-circle-24" width={35} height={35} color={theme.palette.dark[500]} />
                                </Link>
                                <Link 
                                    to="/notifications"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12"
                                >
                                    <Iconify icon="octicon:bell-24" width={35} height={35} color={theme.palette.dark[500]} />
                                </Link>
                                <Link 
                                    to="/comments"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12"
                                >
                                    <Iconify icon="octicon:comment-discussion-24" width={35} height={35} color={theme.palette.dark[500]} />
                                </Link>
                                <Link 
                                    to="/profile"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12"
                                >
                                    <Iconify icon="octicon:person-24" width={35} height={35} color={theme.palette.dark[500]} />
                                </Link>
                                <Link 
                                    to="/history"
                                    className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12"
                                >
                                    <Iconify icon="octicon:clock-24" width={35} height={35} color={theme.palette.dark[500]} />
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
                            className="flex items-center justify-center w-12 h-12 rounded-[30%] transition-all duration-200 ease-out relative overflow-hidden hover:bg-black/6 hover:scale-110 active:scale-95 active:bg-black/12"
                        >
                            <Iconify 
                                icon="octicon:gear-24" 
                                width={35}
                                height={35}
                                color={theme.palette.dark[500]}
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

