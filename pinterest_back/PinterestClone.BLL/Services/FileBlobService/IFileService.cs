using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.Services.FileBlobService
{
    public interface IFileService
    {
        Task<List<BlobDto?>> GetAllBlobsAsync();
        Task<BlobResponseDto> UploadAsync(IFormFile blob, string id);
        Task<BlobDto?> DownloadAsync(string blobFilename);
        Task<BlobResponseDto> DeleteAsync(string blobFilename);
    }
}

