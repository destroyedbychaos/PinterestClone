    import { Box } from "@mui/material";
import { memo, useState } from "react";
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from "react-router-dom";
import { Icon as Iconify } from '@iconify/react';
import icon from '../../assets/images/logo.png';

// SVG іконка компонент з анімацією
const CustomIcon = ({ color = "black", isHovered = false }) => (
    <svg 
        width="35" 
        height="35" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{
            transform: isHovered ? 'rotate(360deg) scale(1.2)' : 'rotate(0deg) scale(1)',
            transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            filter: isHovered ? 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))' : 'none'
        }}
    >
        <g clipPath="url(#clip0_101_24)">
            <path 
                d="M14.475 12.19V1.525H3.81V0H1.525V1.525H0V3.81H1.525V14.475H12.19V16H14.475V14.475H16V12.19H14.475ZM15.24 13.715H13.715V15.24H12.955V13.715H2.285V3.05H0.765V2.285H2.285V0.76H3.05V2.285H13.715V12.955H15.24V13.715Z" 
                fill={color}
                style={{
                    animation: isHovered ? 'rgbShift 3s infinite' : 'none'
                }}
            />
            <path 
                d="M3.05 3.05V12.955H12.955V3.05H3.05ZM12.19 7.62H9.905V8.38H12.19V12.19H9.905V11.43H9.145V12.19H3.81V11.43H4.575V10.665H3.81V3.81H12.19V7.62Z" 
                fill={color}
                style={{
                    animation: isHovered ? 'rgbShift 3s infinite 0.5s' : 'none'
                }}
            />
            <path 
                d="M9.145 8.38H9.905V9.145H9.145V8.38Z" 
                fill={color}
                style={{
                    animation: isHovered ? 'rgbShift 3s infinite 1s' : 'none'
                }}
            />
            <path 
                d="M8.38 9.145H9.145V9.905H8.38V9.145ZM8.38 10.665H9.145V11.43H8.38V10.665ZM7.62 9.905H8.38V10.665H7.62V9.905ZM5.335 7.62H6.86V6.855H7.62V5.335H6.86V4.57H5.335V5.335H4.575V6.855H5.335V7.62ZM5.335 9.145H7.62V9.905H5.335V9.145ZM4.575 9.905H5.335V10.665H4.575V9.905Z" 
                fill={color}
                style={{
                    animation: isHovered ? 'rgbShift 3s infinite 1.5s' : 'none'
                }}
            />
        </g>
        <defs>
            <clipPath id="clip0_101_24">
                <rect width="16" height="16" fill="white"/>
            </clipPath>
        </defs>
        <style>
            {`
                @keyframes rgbShift {
                    0% { fill: #3b82f6; }
                    25% { fill: #8b5cf6; }
                    50% { fill: #ec4899; }
                    75% { fill: #f59e0b; }
                    100% { fill: #3b82f6; }
                }
            `}
        </style>
    </svg>
);

const SideMenu = memo(({ isUnverified = false }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [isAnalyticsHovered, setIsAnalyticsHovered] = useState(false);

    const handleNFTMarketClick = () => {
        console.log('NFT Market clicked!');
        navigate('/nft-market');
    };

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
                                <Box
                                    onClick={handleNFTMarketClick}
                                    onMouseEnter={() => setIsAnalyticsHovered(true)}
                                    onMouseLeave={() => setIsAnalyticsHovered(false)}
                                    sx={{
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '30%',
                                        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                        cursor: 'pointer',
                                        overflow: 'visible',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        }
                                    }}
                                >
                                    {/* RGB переливаючий фоновий ефект */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: isAnalyticsHovered ? '60px' : '48px',
                                            height: isAnalyticsHovered ? '60px' : '48px',
                                            borderRadius: '30%',
                                            background: isAnalyticsHovered 
                                                ? 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #3b82f6)' 
                                                : 'transparent',
                                            backgroundSize: '400% 400%',
                                            opacity: isAnalyticsHovered ? 0.3 : 0,
                                            transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                                            animation: isAnalyticsHovered ? 'rgbGradient 2s ease infinite' : 'none'
                                        }}
                                    />
                                    
                                    {/* Додаткове RGB світіння */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: isAnalyticsHovered ? '70px' : '48px',
                                            height: isAnalyticsHovered ? '70px' : '48px',
                                            borderRadius: '30%',
                                            background: isAnalyticsHovered 
                                                ? 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 25%, rgba(236, 72, 153, 0.1) 50%, rgba(245, 158, 11, 0.1) 75%, transparent 100%)' 
                                                : 'transparent',
                                            opacity: isAnalyticsHovered ? 1 : 0,
                                            transition: 'all 0.6s ease',
                                            animation: isAnalyticsHovered ? 'rgbPulse 3s infinite' : 'none'
                                        }}
                                    />
                                    
                                    <CustomIcon 
                                        color={theme.palette.dark[500]} 
                                        isHovered={isAnalyticsHovered}
                                    />
                                    
                                    <style>
                                        {`
                                            @keyframes rgbGradient {
                                                0% { background-position: 0% 50%; }
                                                50% { background-position: 100% 50%; }
                                                100% { background-position: 0% 50%; }
                                            }
                                            @keyframes rgbPulse {
                                                0% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
                                                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                                                100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
                                            }
                                        `}
                                    </style>
                                </Box>
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

