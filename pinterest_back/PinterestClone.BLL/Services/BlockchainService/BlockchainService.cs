using Nethereum.Web3;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Contracts.CQS;
using Nethereum.Util;
using PinterestClone.BLL.DTOs;
using System.Numerics;
using Microsoft.Extensions.Configuration;

namespace PinterestClone.BLL.Services.BlockchainService
{
    public class BlockchainService : IBlockchainService
    {
        private readonly Web3 _web3;
        private readonly string _contractAddress;
        private readonly string _privateKey;
        private readonly Contract _contract;

        public BlockchainService(IConfiguration configuration)
        {
            var polygonRpcUrl = configuration["Blockchain:PolygonRpcUrl"] ?? "https://polygon-rpc.com";
            _contractAddress = configuration["Blockchain:NFTMarketplaceAddress"] ?? "0x4224f95D130F23b954aaC1BD2480F327C5d6122A";
            _privateKey = configuration["Blockchain:PrivateKey"] ?? "";

            _web3 = new Web3(polygonRpcUrl);
            _contract = _web3.Eth.GetContract(NFTMarketplaceABI, _contractAddress);
        }

        public async Task<NFTMintResponseDto> MintNFTAsync(string nftId, string walletAddress, string tokenUri)
        {
            try
            {
                var maticBalance = await GetMATICBalanceAsync(walletAddress);
                var gasPrice = await GetGasPriceAsync();
                var estimatedGas = await EstimateGasForMintAsync(walletAddress, tokenUri);
                
                if (!await HasEnoughMATICForTransactionAsync(walletAddress, estimatedGas, gasPrice))
                {
                    return new NFTMintResponseDto
                    {
                        NFTId = nftId,
                        IsSuccess = false,
                        ErrorMessage = $"Insufficient MATIC balance. Required: {estimatedGas * gasPrice} MATIC, Available: {maticBalance} MATIC"
                    };
                }

                var mintFunction = _contract.GetFunction("mint");
                var gas = await mintFunction.EstimateGasAsync(walletAddress, tokenUri);
                
                var transaction = await mintFunction.SendTransactionAsync(
                    from: walletAddress,
                    gas: gas,
                    value: new HexBigInteger(0),
                    walletAddress,
                    tokenUri
                );

                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transaction);
                
                var tokenId = GenerateTokenId(nftId);

                var transactionFee = await GetTransactionFeeAsync(transaction);

                return new NFTMintResponseDto
                {
                    NFTId = nftId,
                    TokenId = tokenId.ToString(),
                    ContractAddress = _contractAddress,
                    TransactionHash = transaction,
                    IPFSMetadataHash = tokenUri,
                    IPFSImageHash = "", 
                    IsSuccess = true,
                    GasUsed = estimatedGas,
                    GasPrice = gasPrice,
                    TransactionFee = transactionFee
                };
            }
            catch (Exception ex)
            {
                return new NFTMintResponseDto
                {
                    NFTId = nftId,
                    IsSuccess = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        private BigInteger GenerateTokenId(string nftId)
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var nftIdHash = nftId.GetHashCode();
            return new BigInteger(timestamp) * 1000000 + new BigInteger(nftIdHash);
        }

        public async Task<NFTBurnResponseDto> BurnNFTAsync(string tokenId, string contractAddress, string walletAddress)
        {
            try
            {

                var maticBalance = await GetMATICBalanceAsync(walletAddress);
                var gasPrice = await GetGasPriceAsync();
                var estimatedGas = await EstimateGasForBurnAsync(tokenId);
                
                if (!await HasEnoughMATICForTransactionAsync(walletAddress, estimatedGas, gasPrice))
                {
                    return new NFTBurnResponseDto
                    {
                        TokenId = tokenId,
                        IsSuccess = false,
                        ErrorMessage = $"Insufficient MATIC balance. Required: {estimatedGas * gasPrice} MATIC, Available: {maticBalance} MATIC"
                    };
                }

                var burnFunction = _contract.GetFunction("burn");
                var gas = await burnFunction.EstimateGasAsync(new BigInteger(long.Parse(tokenId)));
                

                var transaction = await burnFunction.SendTransactionAsync(
                    from: walletAddress,
                    gas: gas,
                    value: new HexBigInteger(0),
                    new BigInteger(long.Parse(tokenId))
                );

                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transaction);
                
                var transactionFee = await GetTransactionFeeAsync(transaction);

                return new NFTBurnResponseDto
                {
                    TokenId = tokenId,
                    ContractAddress = contractAddress,
                    TransactionHash = transaction,
                    IsSuccess = true,
                    GasUsed = estimatedGas,
                    GasPrice = gasPrice,
                    TransactionFee = transactionFee
                };
            }
            catch (Exception ex)
            {
                return new NFTBurnResponseDto
                {
                    TokenId = tokenId,
                    IsSuccess = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<string> GetTokenURIAsync(string tokenId, string contractAddress)
        {
            try
            {
                var tokenURIFunction = _contract.GetFunction("tokenURI");
                return await tokenURIFunction.CallAsync<string>(new BigInteger(long.Parse(tokenId)));
            }
            catch
            {
                return string.Empty;
            }
        }

        public async Task<string> GetOwnerAsync(string tokenId, string contractAddress)
        {
            try
            {
                var ownerOfFunction = _contract.GetFunction("ownerOf");
                return await ownerOfFunction.CallAsync<string>(new BigInteger(long.Parse(tokenId)));
            }
            catch
            {
                return string.Empty;
            }
        }

        public async Task<bool> IsApprovedForAllAsync(string owner, string operatorAddress, string contractAddress)
        {
            try
            {
                var isApprovedForAllFunction = _contract.GetFunction("isApprovedForAll");
                return await isApprovedForAllFunction.CallAsync<bool>(owner, operatorAddress);
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> ApproveAsync(string to, string tokenId, string contractAddress, string walletAddress)
        {
            try
            {
                var approveFunction = _contract.GetFunction("approve");
                var gas = await approveFunction.EstimateGasAsync(to, new BigInteger(long.Parse(tokenId)));
                
                return await approveFunction.SendTransactionAsync(
                    from: walletAddress,
                    gas: gas,
                    value: new HexBigInteger(0),
                    to,
                    new BigInteger(long.Parse(tokenId))
                );
            }
            catch (Exception ex)
            {
                throw new Exception($"Error approving NFT: {ex.Message}");
            }
        }

        public async Task<string> TransferFromAsync(string from, string to, string tokenId, string contractAddress, string walletAddress)
        {
            try
            {
                var transferFromFunction = _contract.GetFunction("transferFrom");
                var gas = await transferFromFunction.EstimateGasAsync(from, to, new BigInteger(long.Parse(tokenId)));
                
                return await transferFromFunction.SendTransactionAsync(
                    from: walletAddress,
                    gas: gas,
                    value: new HexBigInteger(0),
                    from,
                    to,
                    new BigInteger(long.Parse(tokenId))
                );
            }
            catch (Exception ex)
            {
                throw new Exception($"Error transferring NFT: {ex.Message}");
            }
        }

        public async Task<decimal> GetMATICBalanceAsync(string walletAddress)
        {
            try
            {
                var balance = await _web3.Eth.GetBalance.SendRequestAsync(walletAddress);
                return Web3.Convert.FromWei(balance.Value);
            }
            catch
            {
                return 0;
            }
        }

        public async Task<decimal> GetGasPriceAsync()
        {
            try
            {
                var gasPrice = await _web3.Eth.GasPrice.SendRequestAsync();
                return Web3.Convert.FromWei(gasPrice.Value);
            }
            catch
            {
                return 0;
            }
        }

        public async Task<decimal> EstimateGasForMintAsync(string walletAddress, string tokenUri)
        {
            try
            {
                var mintFunction = _contract.GetFunction("mint");
                var gas = await mintFunction.EstimateGasAsync(walletAddress, tokenUri);
                return (decimal)gas.Value;
            }
            catch
            {
                return 300000; 
            }
        }

        public async Task<decimal> EstimateGasForBurnAsync(string tokenId)
        {
            try
            {
                var burnFunction = _contract.GetFunction("burn");
                var gas = await burnFunction.EstimateGasAsync(new BigInteger(long.Parse(tokenId)));
                return (decimal)gas.Value;
            }
            catch
            {
                return 100000; 
            }
        }

        public async Task<bool> HasEnoughMATICForTransactionAsync(string walletAddress, decimal gasLimit, decimal gasPrice)
        {
            try
            {
                var maticBalance = await GetMATICBalanceAsync(walletAddress);
                var requiredMATIC = gasLimit * gasPrice;
                return maticBalance >= requiredMATIC;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> TransferMATICAsync(string from, string to, decimal amount)
        {
            try
            {
                var weiAmount = Web3.Convert.ToWei(amount);
                var transaction = await _web3.Eth.GetEtherTransferService()
                    .TransferEtherAndWaitForReceiptAsync(to, amount);
                
                return transaction.TransactionHash;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error transferring MATIC: {ex.Message}");
            }
        }

        public async Task<bool> ValidateTransactionAsync(string transactionHash)
        {
            try
            {
                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash);
                return receipt != null && receipt.Status.Value == 1;
            }
            catch
            {
                return false;
            }
        }

        public async Task<decimal> GetTransactionFeeAsync(string transactionHash)
        {
            try
            {
                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash);
                var transaction = await _web3.Eth.Transactions.GetTransactionByHash.SendRequestAsync(transactionHash);
                
                if (receipt != null && transaction != null)
                {
                    var gasUsed = receipt.GasUsed.Value;
                    var gasPrice = transaction.GasPrice.Value;
                    var feeInWei = gasUsed * gasPrice;
                    return Web3.Convert.FromWei(feeInWei);
                }
                return 0;
            }
            catch
            {
                return 0;
            }
        }

        public async Task<string> GetTransactionStatusAsync(string transactionHash)
        {
            try
            {
                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash);
                if (receipt == null)
                    return "Pending";
                
                return receipt.Status.Value == 1 ? "Success" : "Failed";
            }
            catch
            {
                return "Unknown";
            }
        }

        private async Task<BigInteger> GetTokenIdFromTransactionAsync(string transactionHash)
        {
            try
            {

                return 0;
            }
            catch
            {
                return 0;
            }
        }

        private const string NFTMarketplaceABI = @"[
            {
                ""inputs"": [
                    {
                        ""internalType"": ""address"",
                        ""name"": ""to"",
                        ""type"": ""address""
                    },
                    {
                        ""internalType"": ""string"",
                        ""name"": ""uri"",
                        ""type"": ""string""
                    }
                ],
                ""name"": ""mint"",
                ""outputs"": [
                    {
                        ""internalType"": ""uint256"",
                        ""name"": """",
                        ""type"": ""uint256""
                    }
                ],
                ""stateMutability"": ""nonpayable"",
                ""type"": ""function""
            },
            {
                ""inputs"": [
                    {
                        ""internalType"": ""uint256"",
                        ""name"": ""tokenId"",
                        ""type"": ""uint256""
                    }
                ],
                ""name"": ""burn"",
                ""outputs"": [],
                ""stateMutability"": ""nonpayable"",
                ""type"": ""function""
            },
            {
                ""inputs"": [
                    {
                        ""internalType"": ""uint256"",
                        ""name"": ""tokenId"",
                        ""type"": ""uint256""
                    }
                ],
                ""name"": ""tokenURI"",
                ""outputs"": [
                    {
                        ""internalType"": ""string"",
                        ""name"": """",
                        ""type"": ""string""
                    }
                ],
                ""stateMutability"": ""view"",
                ""type"": ""function""
            },
            {
                ""inputs"": [
                    {
                        ""internalType"": ""uint256"",
                        ""name"": ""tokenId"",
                        ""type"": ""uint256""
                    }
                ],
                ""name"": ""ownerOf"",
                ""outputs"": [
                    {
                        ""internalType"": ""address"",
                        ""name"": """",
                        ""type"": ""address""
                    }
                ],
                ""stateMutability"": ""view"",
                ""type"": ""function""
            },
            {
                ""inputs"": [
                    {
                        ""internalType"": ""address"",
                        ""name"": ""owner"",
                        ""type"": ""address""
                    },
                    {
                        ""internalType"": ""address"",
                        ""name"": ""operator"",
                        ""type"": ""address""
                    }
                ],
                ""name"": ""isApprovedForAll"",
                ""outputs"": [
                    {
                        ""internalType"": ""bool"",
                        ""name"": """",
                        ""type"": ""bool""
                    }
                ],
                ""stateMutability"": ""view"",
                ""type"": ""function""
            },
            {
                ""inputs"": [
                    {
                        ""internalType"": ""address"",
                        ""name"": ""to"",
                        ""type"": ""address""
                    },
                    {
                        ""internalType"": ""uint256"",
                        ""name"": ""tokenId"",
                        ""type"": ""uint256""
                    }
                ],
                ""name"": ""approve"",
                ""outputs"": [],
                ""stateMutability"": ""nonpayable"",
                ""type"": ""function""
            },
            {
                ""inputs"": [
                    {
                        ""internalType"": ""address"",
                        ""name"": ""from"",
                        ""type"": ""address""
                    },
                    {
                        ""internalType"": ""address"",
                        ""name"": ""to"",
                        ""type"": ""address""
                    },
                    {
                        ""internalType"": ""uint256"",
                        ""name"": ""tokenId"",
                        ""type"": ""uint256""
                    }
                ],
                ""name"": ""transferFrom"",
                ""outputs"": [],
                ""stateMutability"": ""nonpayable"",
                ""type"": ""function""
            }
        ]";
    }
} 