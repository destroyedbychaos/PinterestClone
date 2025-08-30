import React from 'react';
import { Box, Typography } from '@mui/material';
import { Icon as Iconify } from '@iconify/react';
import { useTheme } from '@mui/material';

const BoardList = ({ boards, selectedBoard, onBoardSelect }) => {
  const theme = useTheme();

  const BoardItem = ({ board, isSelected, onClick }) => (
    <Box 
      onClick={() => onClick(board)}
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '16px',
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        border: isSelected ? '2px solid #3B82F6' : '2px solid transparent',
        '&:hover': {
          backgroundColor: 'rgba(59, 130, 246, 0.05)'
        }
      }}
    >
      <Box
        sx={{
          width: 54,
          height: 54,
          borderRadius: '16px',
          overflow: board.image ? 'hidden' : 'visible',
          backgroundColor: !board.image ? '#EAEFF9' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mr: 1,
        }}
      >
        {board.image ? (
          <Box
            component="img"
            src={board.image}
            alt={board.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Iconify 
            color={theme.palette.dark[500]} 
            icon={board.isProfile ? "octicon:person-24" : "octicon:plus-24"} 
            width={32} 
            height={32} 
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontWeight: 600,
            color: theme.palette.dark[500],
            fontSize: '18px',
            fontStyle: 'semibold',
            lineHeight: 1.2,
          }}
        >
          {board.name}
        </Typography>
        {board.count && (
          <Typography
            sx={{
              fontWeight: 400,
              color: theme.palette.text.secondary,
              fontSize: '14px',
              lineHeight: 1.2,
            }}
          >
            {board.count}
          </Typography>
        )}
      </Box>
      {board.isPrivate && (
        <Box sx={{ ml: 'auto' }}>
          <Iconify color={theme.palette.text.secondary} icon="material-symbols:lock" width={20} height={20} />
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        px: 1,
        pr: 2,
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#C4C4C4",
          borderRadius: "3px",
          "&:hover": {
            backgroundColor: "#A0A0A0",
          },
        },
      }}
    >
      <BoardItem 
        board={{ name: "Create new board", isNew: true }}
        isSelected={selectedBoard?.isNew}
        onClick={onBoardSelect}
      />
      
      <BoardItem 
        board={{ name: "Save to profile", isProfile: true }}
        isSelected={selectedBoard?.isProfile}
        onClick={onBoardSelect}
      />
      
      <Box
        component="hr"
        sx={{
          mt: 1,
          border: 'none',
          borderTop: `1px solid ${theme.palette.blue[50]}`,
        }}
      />

      {boards.map((board, index) => (
        <BoardItem
          key={index}
          board={board}
          isSelected={selectedBoard?.name === board.name}
          onClick={onBoardSelect}
        />
      ))}
    </Box>
  );
};

export default BoardList;