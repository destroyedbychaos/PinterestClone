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

        public async Task<ServiceResponse<NFTMintResponseDto>> MintNFTAsync(string nftId, string walletAddress)
        {
            try
            {
                var maticBalanceResponse = await GetMATICBalanceAsync(walletAddress);
                if (!maticBalanceResponse.IsSuccess)
                {
                    return ServiceResponse<NFTMintResponseDto>.ErrorResponse("Failed to get MATIC balance");
                }

                var gasPriceResponse = await GetGasPriceAsync();
                if (!gasPriceResponse.IsSuccess)
                {
                    return ServiceResponse<NFTMintResponseDto>.ErrorResponse("Failed to get gas price");
                }

                var estimatedGasResponse = await EstimateGasForMintAsync(walletAddress);
                if (!estimatedGasResponse.IsSuccess)
                {
                    return ServiceResponse<NFTMintResponseDto>.ErrorResponse("Failed to estimate gas");
                }

                var hasEnoughResponse = await HasEnoughMATICForTransactionAsync(walletAddress, estimatedGasResponse.Data.EstimatedGas);
                if (!hasEnoughResponse.IsSuccess || !hasEnoughResponse.Data)
                {
                    return ServiceResponse<NFTMintResponseDto>.ErrorResponse($"Insufficient MATIC balance. Required: {estimatedGasResponse.Data.TotalCost} MATIC, Available: {maticBalanceResponse.Data.Balance} MATIC");
                }

                var mintFunction = _contract.GetFunction("mint");
                var tokenUri = $"ipfs://metadata/{nftId}";
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

                var transactionFeeResponse = await GetTransactionFeeAsync(transaction);
                var transactionFee = transactionFeeResponse.IsSuccess ? transactionFeeResponse.Data.TransactionFee : 0m;

                var response = new NFTMintResponseDto
                {
                    NFTId = nftId,
                    TokenId = tokenId.ToString(),
                    ContractAddress = _contractAddress,
                    TransactionHash = transaction,
                    IPFSMetadataHash = tokenUri,
                    IPFSImageHash = "", 
                    IsSuccess = true,
                    GasUsed = estimatedGasResponse.Data.EstimatedGas,
                    GasPrice = gasPriceResponse.Data,
                    TransactionFee = transactionFee
                };

                return ServiceResponse<NFTMintResponseDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<NFTMintResponseDto>.ErrorResponse($"Error minting NFT: {ex.Message}");
            }
        }

        private BigInteger GenerateTokenId(string nftId)
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var nftIdHash = nftId.GetHashCode();
            return new BigInteger(timestamp) * 1000000 + new BigInteger(nftIdHash);
        }

        public async Task<ServiceResponse<NFTBurnResponseDto>> BurnNFTAsync(string nftId, string walletAddress)
        {
            try
            {
                var maticBalanceResponse = await GetMATICBalanceAsync(walletAddress);
                if (!maticBalanceResponse.IsSuccess)
                {
                    return ServiceResponse<NFTBurnResponseDto>.ErrorResponse("Failed to get MATIC balance");
                }

                var gasPriceResponse = await GetGasPriceAsync();
                if (!gasPriceResponse.IsSuccess)
                {
                    return ServiceResponse<NFTBurnResponseDto>.ErrorResponse("Failed to get gas price");
                }

                var estimatedGasResponse = await EstimateGasForBurnAsync(nftId);
                if (!estimatedGasResponse.IsSuccess)
                {
                    return ServiceResponse<NFTBurnResponseDto>.ErrorResponse("Failed to estimate gas");
                }

                var hasEnoughResponse = await HasEnoughMATICForTransactionAsync(walletAddress, estimatedGasResponse.Data.EstimatedGas);
                if (!hasEnoughResponse.IsSuccess || !hasEnoughResponse.Data)
                {
                    return ServiceResponse<NFTBurnResponseDto>.ErrorResponse($"Insufficient MATIC balance. Required: {estimatedGasResponse.Data.TotalCost} MATIC, Available: {maticBalanceResponse.Data.Balance} MATIC");
                }

                var burnFunction = _contract.GetFunction("burn");
                var gas = await burnFunction.EstimateGasAsync(new BigInteger(long.Parse(nftId)));

                var transaction = await burnFunction.SendTransactionAsync(
                    from: walletAddress,
                    gas: gas,
                    value: new HexBigInteger(0),
                    new BigInteger(long.Parse(nftId))
                );

                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transaction);
                
                var transactionFeeResponse = await GetTransactionFeeAsync(transaction);
                var transactionFee = transactionFeeResponse.IsSuccess ? transactionFeeResponse.Data.TransactionFee : 0m;

                var response = new NFTBurnResponseDto
                {
                    TokenId = nftId,
                    ContractAddress = _contractAddress,
                    TransactionHash = transaction,
                    IsSuccess = true,
                    GasUsed = estimatedGasResponse.Data.EstimatedGas,
                    GasPrice = gasPriceResponse.Data,
                    TransactionFee = transactionFee
                };

                return ServiceResponse<NFTBurnResponseDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<NFTBurnResponseDto>.ErrorResponse($"Error burning NFT: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<string>> GetTokenURIAsync(string tokenId, string contractAddress)
        {
            try
            {
                var tokenURIFunction = _contract.GetFunction("tokenURI");
                var result = await tokenURIFunction.CallAsync<string>(new BigInteger(long.Parse(tokenId)));
                return ServiceResponse<string>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ServiceResponse<string>.ErrorResponse($"Error getting token URI: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<string>> GetOwnerAsync(string tokenId, string contractAddress)
        {
            try
            {
                var ownerOfFunction = _contract.GetFunction("ownerOf");
                var result = await ownerOfFunction.CallAsync<string>(new BigInteger(long.Parse(tokenId)));
                return ServiceResponse<string>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ServiceResponse<string>.ErrorResponse($"Error getting owner: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> IsApprovedForAllAsync(string owner, string operatorAddress, string contractAddress)
        {
            try
            {
                var isApprovedForAllFunction = _contract.GetFunction("isApprovedForAll");
                var result = await isApprovedForAllFunction.CallAsync<bool>(owner, operatorAddress);
                return ServiceResponse<bool>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Error checking approval: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<string>> ApproveAsync(string to, string tokenId, string contractAddress, string walletAddress)
        {
            try
            {
                var approveFunction = _contract.GetFunction("approve");
                var gas = await approveFunction.EstimateGasAsync(to, new BigInteger(long.Parse(tokenId)));
                
                var transaction = await approveFunction.SendTransactionAsync(
                    from: walletAddress,
                    gas: gas,
                    value: new HexBigInteger(0),
                    to,
                    new BigInteger(long.Parse(tokenId))
                );
                
                return ServiceResponse<string>.SuccessResponse(transaction);
            }
            catch (Exception ex)
            {
                return ServiceResponse<string>.ErrorResponse($"Error approving NFT: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<string>> TransferFromAsync(string from, string to, string tokenId, string contractAddress, string walletAddress)
        {
            try
            {
                var transferFromFunction = _contract.GetFunction("transferFrom");
                var gas = await transferFromFunction.EstimateGasAsync(from, to, new BigInteger(long.Parse(tokenId)));
                
                var transaction = await transferFromFunction.SendTransactionAsync(
                    from: walletAddress,
                    gas: gas,
                    value: new HexBigInteger(0),
                    from,
                    to,
                    new BigInteger(long.Parse(tokenId))
                );
                
                return ServiceResponse<string>.SuccessResponse(transaction);
            }
            catch (Exception ex)
            {
                return ServiceResponse<string>.ErrorResponse($"Error transferring NFT: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<MATICBalanceDto>> GetMATICBalanceAsync(string walletAddress)
        {
            try
            {
                var balance = await _web3.Eth.GetBalance.SendRequestAsync(walletAddress);
                var balanceInMatic = Web3.Convert.FromWei(balance.Value);
                
                var response = new MATICBalanceDto
                {
                    WalletAddress = walletAddress,
                    Balance = balanceInMatic,
                    FormattedBalance = $"{balanceInMatic:F6} MATIC"
                };
                
                return ServiceResponse<MATICBalanceDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<MATICBalanceDto>.ErrorResponse($"Error getting MATIC balance: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<decimal>> GetGasPriceAsync()
        {
            try
            {
                var gasPrice = await _web3.Eth.GasPrice.SendRequestAsync();
                var gasPriceInMatic = Web3.Convert.FromWei(gasPrice.Value);
                return ServiceResponse<decimal>.SuccessResponse(gasPriceInMatic);
            }
            catch (Exception ex)
            {
                return ServiceResponse<decimal>.ErrorResponse($"Error getting gas price: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<GasEstimateDto>> EstimateGasForMintAsync(string walletAddress)
        {
            try
            {
                var mintFunction = _contract.GetFunction("mint");
                var tokenUri = "ipfs://metadata/placeholder";
                var gas = await mintFunction.EstimateGasAsync(walletAddress, tokenUri);
                var gasPriceResponse = await GetGasPriceAsync();
                
                var response = new GasEstimateDto
                {
                    OperationType = "mint",
                    EstimatedGas = (decimal)gas.Value,
                    GasPrice = gasPriceResponse.IsSuccess ? gasPriceResponse.Data : 0,
                    TotalCost = (decimal)gas.Value * (gasPriceResponse.IsSuccess ? gasPriceResponse.Data : 0),
                    Currency = "MATIC"
                };
                
                return ServiceResponse<GasEstimateDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<GasEstimateDto>.ErrorResponse($"Error estimating gas for mint: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<GasEstimateDto>> EstimateGasForBurnAsync(string tokenId)
        {
            try
            {
                var burnFunction = _contract.GetFunction("burn");
                var gas = await burnFunction.EstimateGasAsync(new BigInteger(long.Parse(tokenId)));
                var gasPriceResponse = await GetGasPriceAsync();
                
                var response = new GasEstimateDto
                {
                    OperationType = "burn",
                    TokenId = tokenId,
                    EstimatedGas = (decimal)gas.Value,
                    GasPrice = gasPriceResponse.IsSuccess ? gasPriceResponse.Data : 0,
                    TotalCost = (decimal)gas.Value * (gasPriceResponse.IsSuccess ? gasPriceResponse.Data : 0),
                    Currency = "MATIC"
                };
                
                return ServiceResponse<GasEstimateDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<GasEstimateDto>.ErrorResponse($"Error estimating gas for burn: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> HasEnoughMATICForTransactionAsync(string walletAddress, decimal gasEstimate)
        {
            try
            {
                var maticBalanceResponse = await GetMATICBalanceAsync(walletAddress);
                if (!maticBalanceResponse.IsSuccess)
                {
                    return ServiceResponse<bool>.ErrorResponse("Failed to get MATIC balance");
                }

                var gasPriceResponse = await GetGasPriceAsync();
                if (!gasPriceResponse.IsSuccess)
                {
                    return ServiceResponse<bool>.ErrorResponse("Failed to get gas price");
                }

                var requiredMATIC = gasEstimate * gasPriceResponse.Data;
                var hasEnough = maticBalanceResponse.Data.Balance >= requiredMATIC;
                
                return ServiceResponse<bool>.SuccessResponse(hasEnough);
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Error checking MATIC balance: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<TransactionInfoDto>> TransferMATICAsync(string fromAddress, string toAddress, decimal amount)
        {
            try
            {
                var weiAmount = Web3.Convert.ToWei(amount);
                var transaction = await _web3.Eth.GetEtherTransferService()
                    .TransferEtherAndWaitForReceiptAsync(toAddress, amount);
                
                var response = new TransactionInfoDto
                {
                    TransactionHash = transaction.TransactionHash,
                    FromAddress = fromAddress,
                    ToAddress = toAddress,
                    Amount = amount,
                    IsSuccess = true,
                    Timestamp = DateTime.UtcNow
                };
                
                return ServiceResponse<TransactionInfoDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<TransactionInfoDto>.ErrorResponse($"Error transferring MATIC: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<TransactionInfoDto>> ValidateTransactionAsync(string transactionHash)
        {
            try
            {
                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash);
                var isValid = receipt != null && receipt.Status.Value == 1;
                
                var response = new TransactionInfoDto
                {
                    TransactionHash = transactionHash,
                    IsSuccess = isValid,
                    Timestamp = DateTime.UtcNow
                };
                
                return ServiceResponse<TransactionInfoDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<TransactionInfoDto>.ErrorResponse($"Error validating transaction: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<TransactionInfoDto>> GetTransactionFeeAsync(string transactionHash)
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
                    var feeInMatic = Web3.Convert.FromWei(feeInWei);
                    
                    var response = new TransactionInfoDto
                    {
                        TransactionHash = transactionHash,
                        GasUsed = gasUsed.ToString(),
                        GasPrice = gasPrice.ToString(),
                        TransactionFee = feeInMatic,
                        IsSuccess = receipt.Status.Value == 1,
                        Timestamp = DateTime.UtcNow
                    };
                    
                    return ServiceResponse<TransactionInfoDto>.SuccessResponse(response);
                }
                
                return ServiceResponse<TransactionInfoDto>.NotFoundResponse("Transaction not found");
            }
            catch (Exception ex)
            {
                return ServiceResponse<TransactionInfoDto>.ErrorResponse($"Error getting transaction fee: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<TransactionInfoDto>> GetTransactionStatusAsync(string transactionHash)
        {
            try
            {
                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash);
                if (receipt == null)
                {
                    var failedResponse = new TransactionInfoDto
                    {
                        TransactionHash = transactionHash,
                        IsSuccess = false,
                        Timestamp = DateTime.UtcNow
                    };
                    return ServiceResponse<TransactionInfoDto>.SuccessResponse(failedResponse);
                }
                
                var successResponse = new TransactionInfoDto
                {
                    TransactionHash = transactionHash,
                    IsSuccess = receipt.Status.Value == 1,
                    Timestamp = DateTime.UtcNow
                };
                
                return ServiceResponse<TransactionInfoDto>.SuccessResponse(successResponse);
            }
            catch (Exception ex)
            {
                return ServiceResponse<TransactionInfoDto>.ErrorResponse($"Error getting transaction status: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<TransactionDataDto>> PreparePurchaseTransactionAsync(string nftId, string buyerAddress, decimal price)
        {
            try
            {
                var transferFunction = _contract.GetFunction("transferFrom");
                var nonce = await _web3.Eth.Transactions.GetTransactionCount.SendRequestAsync(buyerAddress);
                var weiAmount = Web3.Convert.ToWei(price);

                var transactionData = transferFunction.GetData(buyerAddress, buyerAddress, new BigInteger(long.Parse(nftId)));

                var response = new TransactionDataDto
                {
                    TransactionData = transactionData,
                    ToAddress = _contractAddress,
                    Value = weiAmount.ToString(),
                    Nonce = nonce.Value.ToString()
                };

                return ServiceResponse<TransactionDataDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<TransactionDataDto>.ErrorResponse($"Error preparing purchase transaction: {ex.Message}");
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

        // Payment operations
        public async Task<ServiceResponse<GasEstimateDto>> EstimateGasForOperationAsync(string operationType, string walletAddress, string? contractAddress = null, string? tokenId = null, string? toAddress = null, decimal? amount = null)
        {
            try
            {
                var gasPriceResponse = await GetGasPriceAsync();
                if (!gasPriceResponse.IsSuccess)
                {
                    return ServiceResponse<GasEstimateDto>.ErrorResponse("Failed to get gas price");
                }
                var gasPrice = gasPriceResponse.Data;
                decimal estimatedGas = 0;

                switch (operationType.ToLower())
                {
                    case "mint":
                        var mintResponse = await EstimateGasForMintAsync(walletAddress);
                        if (mintResponse.IsSuccess)
                            estimatedGas = mintResponse.Data.EstimatedGas;
                        break;
                    case "burn":
                        if (!string.IsNullOrEmpty(tokenId))
                        {
                            var burnResponse = await EstimateGasForBurnAsync(tokenId);
                            if (burnResponse.IsSuccess)
                                estimatedGas = burnResponse.Data.EstimatedGas;
                        }
                        break;
                    case "transfer":
                        if (!string.IsNullOrEmpty(toAddress) && amount.HasValue)
                            estimatedGas = 21000; 
                        break;
                    case "approve":
                        estimatedGas = 46000; 
                        break;
                    case "transferfrom":
                        estimatedGas = 65000; 
                        break;
                    default:
                        return ServiceResponse<GasEstimateDto>.ErrorResponse($"Unknown operation type: {operationType}");
                }

                var totalCost = estimatedGas * gasPrice;

                var response = new GasEstimateDto
                {
                    OperationType = operationType,
                    ContractAddress = contractAddress,
                    TokenId = tokenId,
                    ToAddress = toAddress,
                    Amount = amount,
                    EstimatedGas = estimatedGas,
                    GasPrice = gasPrice,
                    TotalCost = totalCost,
                    Currency = "MATIC"
                };

                return ServiceResponse<GasEstimateDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<GasEstimateDto>.ErrorResponse($"Error estimating gas: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<PaymentResponseDto>> ConfirmTransactionAsync(string transactionHash, string walletAddress)
        {
            try
            {
                var isValid = await ValidateTransactionAsync(transactionHash);
                if (!isValid.IsSuccess)
                {
                    return ServiceResponse<PaymentResponseDto>.ErrorResponse("Invalid transaction hash");
                }

                var transactionInfo = await GetTransactionInfoAsync(transactionHash);
                if (!transactionInfo.IsSuccess)
                {
                    return ServiceResponse<PaymentResponseDto>.ErrorResponse("Failed to get transaction info");
                }

                var response = new PaymentResponseDto
                {
                    Success = transactionInfo.Data.IsSuccess,
                    Message = transactionInfo.Data.IsSuccess ? "Transaction confirmed successfully" : "Transaction failed",
                    TransactionHash = transactionHash,
                    GasUsed = decimal.TryParse(transactionInfo.Data.GasUsed, out var gasUsed) ? gasUsed : null,
                    GasPrice = decimal.TryParse(transactionInfo.Data.GasPrice, out var gasPrice) ? gasPrice : null,
                    TransactionFee = transactionInfo.Data.TransactionFee,
                    ErrorCode = transactionInfo.Data.IsSuccess ? null : "TRANSACTION_FAILED"
                };

                return ServiceResponse<PaymentResponseDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<PaymentResponseDto>.ErrorResponse($"Error confirming transaction: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<PaymentResponseDto>> ProcessWebhookAsync(WebhookDto webhookDto)
        {
            try
            {
                if (string.IsNullOrEmpty(webhookDto.TransactionHash))
                {
                    return ServiceResponse<PaymentResponseDto>.ErrorResponse("Invalid webhook data: missing transaction hash");
                }

                var response = new PaymentResponseDto
                {
                    Success = webhookDto.IsSuccess,
                    Message = webhookDto.IsSuccess ? "Webhook processed successfully" : $"Webhook failed: {webhookDto.ErrorMessage}",
                    TransactionHash = webhookDto.TransactionHash,
                    GasUsed = decimal.TryParse(webhookDto.GasUsed, out var gasUsed) ? gasUsed : null,
                    GasPrice = decimal.TryParse(webhookDto.GasPrice, out var gasPrice) ? gasPrice : null,
                    TransactionFee = decimal.TryParse(webhookDto.GasUsed, out var used) && decimal.TryParse(webhookDto.GasPrice, out var price) ? used * price : null,
                    ErrorCode = webhookDto.IsSuccess ? null : "WEBHOOK_FAILED"
                };

                return ServiceResponse<PaymentResponseDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<PaymentResponseDto>.ErrorResponse($"Error processing webhook: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<TransactionInfoDto>> GetTransactionInfoAsync(string hash)
        {
            try
            {
                var transaction = await _web3.Eth.Transactions.GetTransactionByHash.SendRequestAsync(hash);
                if (transaction == null)
                {
                    return ServiceResponse<TransactionInfoDto>.NotFoundResponse("Transaction not found");
                }

                var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(hash);
                var gasUsed = receipt?.GasUsed?.Value ?? 0;
                var gasPrice = transaction.GasPrice?.Value ?? 0;
                var transactionFee = (decimal)(gasUsed * gasPrice);

                var response = new TransactionInfoDto
                {
                    TransactionHash = hash,
                    FromAddress = transaction.From,
                    ToAddress = transaction.To,
                    Amount = transaction.Value?.Value != null ? (decimal)transaction.Value.Value : 0m,
                    BlockNumber = transaction.BlockNumber?.Value.ToString() ?? "",
                    GasUsed = gasUsed.ToString(),
                    GasPrice = gasPrice.ToString(),
                    TransactionFee = transactionFee,
                    IsSuccess = receipt?.Status?.Value == 1,
                    Timestamp = DateTime.UtcNow, 
                    Confirmations = 0 
                };

                return ServiceResponse<TransactionInfoDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<TransactionInfoDto>.ErrorResponse($"Error getting transaction info: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<BalanceDto>> GetBalanceAsync(string walletAddress, string? tokenAddress = null)
        {
            try
            {
                if (string.IsNullOrEmpty(tokenAddress))
                {
                    var balanceResponse = await GetMATICBalanceAsync(walletAddress);
                    if (!balanceResponse.IsSuccess)
                    {
                        return ServiceResponse<BalanceDto>.ErrorResponse("Failed to get MATIC balance");
                    }
                    
                    var response = new BalanceDto
                    {
                        WalletAddress = walletAddress,
                        TokenSymbol = "MATIC",
                        Balance = balanceResponse.Data.Balance,
                        Decimals = 18,
                        FormattedBalance = balanceResponse.Data.FormattedBalance
                    };

                    return ServiceResponse<BalanceDto>.SuccessResponse(response);
                }
                else
                {
                    var tokenContract = _web3.Eth.GetContract(ERC20ABI, tokenAddress);
                    var balanceOfFunction = tokenContract.GetFunction("balanceOf");
                    var balance = await balanceOfFunction.CallAsync<BigInteger>(walletAddress);
                    
                    var symbolFunction = tokenContract.GetFunction("symbol");
                    var symbol = await symbolFunction.CallAsync<string>();
                    
                    var decimalsFunction = tokenContract.GetFunction("decimals");
                    var decimals = await decimalsFunction.CallAsync<byte>();

                    var formattedBalance = (decimal)(balance / BigInteger.Pow(10, decimals));

                    var response = new BalanceDto
                    {
                        WalletAddress = walletAddress,
                        TokenAddress = tokenAddress,
                        TokenSymbol = symbol,
                        Balance = formattedBalance,
                        Decimals = decimals,
                        FormattedBalance = $"{formattedBalance} {symbol}"
                    };

                    return ServiceResponse<BalanceDto>.SuccessResponse(response);
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse<BalanceDto>.ErrorResponse($"Error getting balance: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<PaymentResponseDto>> TransferAsync(string fromAddress, string toAddress, decimal amount, string? tokenAddress = null)
        {
            try
            {
                if (string.IsNullOrEmpty(tokenAddress))
                {

                    var transferResponse = await TransferMATICAsync(fromAddress, toAddress, amount);
                    if (!transferResponse.IsSuccess)
                    {
                        return ServiceResponse<PaymentResponseDto>.ErrorResponse("Failed to transfer MATIC");
                    }
                    
                    var response = new PaymentResponseDto
                    {
                        Success = transferResponse.Data.IsSuccess,
                        Message = transferResponse.Data.IsSuccess ? "MATIC transfer successful" : "MATIC transfer failed",
                        TransactionHash = transferResponse.Data.TransactionHash,
                        GasUsed = decimal.TryParse(transferResponse.Data.GasUsed, out var gasUsed) ? gasUsed : null,
                        GasPrice = decimal.TryParse(transferResponse.Data.GasPrice, out var gasPrice) ? gasPrice : null,
                        TransactionFee = transferResponse.Data.TransactionFee
                    };

                    return ServiceResponse<PaymentResponseDto>.SuccessResponse(response);
                }
                else
                {
                    var tokenContract = _web3.Eth.GetContract(ERC20ABI, tokenAddress);
                    var transferFunction = tokenContract.GetFunction("transfer");
                    
                    var decimalsFunction = tokenContract.GetFunction("decimals");
                    var decimals = await decimalsFunction.CallAsync<byte>();
                    var amountInWei = new BigInteger((long)(amount * (decimal)Math.Pow(10, decimals)));
                    
                    var gas = await transferFunction.EstimateGasAsync(fromAddress, toAddress, amountInWei);
                    var transaction = await transferFunction.SendTransactionAsync(fromAddress, gas, null, toAddress, amountInWei);
                    
                    var response = new PaymentResponseDto
                    {
                        Success = true,
                        Message = "Token transfer initiated",
                        TransactionHash = transaction
                    };

                    return ServiceResponse<PaymentResponseDto>.SuccessResponse(response);
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse<PaymentResponseDto>.ErrorResponse($"Error transferring: {ex.Message}");
            }
        }

        private const string ERC20ABI = @"[
            {
                ""constant"": true,
                ""inputs"": [],
                ""name"": ""name"",
                ""outputs"": [{""name"": """", ""type"": ""string""}],
                ""type"": ""function""
            },
            {
                ""constant"": true,
                ""inputs"": [],
                ""name"": ""symbol"",
                ""outputs"": [{""name"": """", ""type"": ""string""}],
                ""type"": ""function""
            },
            {
                ""constant"": true,
                ""inputs"": [],
                ""name"": ""decimals"",
                ""outputs"": [{""name"": """", ""type"": ""uint8""}],
                ""type"": ""function""
            },
            {
                ""constant"": true,
                ""inputs"": [{""name"": ""_owner"", ""type"": ""address""}],
                ""name"": ""balanceOf"",
                ""outputs"": [{""name"": ""balance"", ""type"": ""uint256""}],
                ""type"": ""function""
            },
            {
                ""constant"": false,
                ""inputs"": [{""name"": ""_to"", ""type"": ""address""}, {""name"": ""_value"", ""type"": ""uint256""}],
                ""name"": ""transfer"",
                ""outputs"": [{""name"": """", ""type"": ""bool""}],
                ""type"": ""function""
            }
        ]";
    }
} 