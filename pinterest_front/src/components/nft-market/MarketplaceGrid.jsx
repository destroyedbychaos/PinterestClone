import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { useNFT } from '../../hooks/useNFT';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useNFTAuth } from '@/hooks/useNFTAuth';
import { useWeb3 } from '../../contexts/Web3Context';
import MarketplaceNFTCard from './MarketplaceNFTCard';

const MarketplaceGrid = ({ showMyNFTs = false, showFavorites = false }) => {
  const { getAllNFTs, getUserNFTs, getUserFavorites } = useNFT();
  const { getActiveListings } = useMarketplace();
  const { isAuthenticated } = useNFTAuth();
  const { account } = useWeb3();

  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const loadNFTs = async (currentPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (showMyNFTs && account) {
        response = await getUserNFTs(account, currentPage, pageSize);
      } else if (showFavorites && account) {
        response = await getUserFavorites(account, currentPage, pageSize);
      } else if (filterBy === 'marketplace') {
        response = await getActiveListings(currentPage, pageSize);
      } else {
        response = await getAllNFTs(currentPage, pageSize);
      }

      if (response) {
        const items = response.items || response.data || [];
        const withImages = items.filter(i => !!i.imageUrl && String(i.imageUrl).trim() !== '');
        setNFTs(withImages);
        setTotalPages(Math.ceil((response.total || response.totalCount || withImages.length) / pageSize));
      }
    } catch (err) {
      console.error('Error loading NFTs:', err);
      setError(err.message || 'Помилка завантаження NFT');
      setNFTs([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadNFTs(page);
  }, [page, showMyNFTs, showFavorites, filterBy, account]);


  const filteredAndSortedNFTs = React.useMemo(() => {
    let filtered = [...nfts];


    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }


    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(nft => {
        const price = parseFloat(nft.price || 0);
        const min = parseFloat(priceRange.min || 0);
        const max = parseFloat(priceRange.max || Infinity);
        return price >= min && price <= max;
      });
    }


    if (filterBy !== 'marketplace') {
      filtered = filtered.filter(nft => {
        const listed = nft?.isForSale === true || nft?.IsForSale === true || nft?.isActive === true || nft?.IsActive === true;
        return listed;
      });
    }

    if (showMyNFTs && account) {
      filtered = filtered.filter(nft => nft.ownerWalletAddress?.toLowerCase() === account.toLowerCase() || nft.creatorWalletAddress?.toLowerCase() === account.toLowerCase());
    }


    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => (parseFloat(a.price || 0) - parseFloat(b.price || 0)));
        break;
      case 'price-high':
        filtered.sort((a, b) => (parseFloat(b.price || 0) - parseFloat(a.price || 0)));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }

    return filtered;
  }, [nfts, searchTerm, sortBy, priceRange]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNFTUpdate = () => {
    loadNFTs(page);
  };

  const getTitle = () => {
    if (showMyNFTs) return 'Мої NFT';
    if (showFavorites) return 'Улюблені NFT';
    if (filterBy === 'marketplace') return 'Маркетплейс';
    return 'Всі NFT';
  };

  const getEmptyMessage = () => {
    if (showMyNFTs) return 'У вас ще немає NFT';
    if (showFavorites) return 'У вас ще немає улюблених NFT';
    if (filterBy === 'marketplace') return 'На маркетплейсі поки немає NFT';
    return 'NFT не знайдено';
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {getTitle()}
        </Typography>
        
        <Chip 
          label={`${filteredAndSortedNFTs.length} NFT`} 
          color="primary" 
          variant="outlined" 
        />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Пошук NFT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>


            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Сортування</InputLabel>
                <Select
                  value={sortBy}
                  label="Сортування"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">Найновіші</MenuItem>
                  <MenuItem value="oldest">Найстаріші</MenuItem>
                  <MenuItem value="price-low">Ціна: низька → висока</MenuItem>
                  <MenuItem value="price-high">Ціна: висока → низька</MenuItem>
                  <MenuItem value="name">За назвою</MenuItem>
                </Select>
              </FormControl>
            </Grid>


            {!showMyNFTs && !showFavorites && (
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Фільтр</InputLabel>
                  <Select
                    value={filterBy}
                    label="Фільтр"
                    onChange={(e) => setFilterBy(e.target.value)}
                  >
                    <MenuItem value="all">Всі NFT</MenuItem>
                    <MenuItem value="marketplace">Тільки на продажі</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}


            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Мін. ціна"
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">MATIC</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Макс. ціна"
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">MATIC</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredAndSortedNFTs.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {getEmptyMessage()}
          </Typography>
          {searchTerm && (
            <Typography variant="body2" color="text.secondary">
              Спробуйте змінити пошуковий запит або фільтри
            </Typography>
          )}
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredAndSortedNFTs.map((nft) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={nft.id}>
                <MarketplaceNFTCard
                  nft={nft}
                  isOwner={account && nft.ownerWalletAddress?.toLowerCase() === account.toLowerCase()}
                  onUpdate={handleNFTUpdate}
                />
              </Grid>
            ))}
          </Grid>


          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MarketplaceGrid;