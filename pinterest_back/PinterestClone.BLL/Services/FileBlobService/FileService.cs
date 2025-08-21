using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azure;
using Azure.Storage;
using Azure.Storage.Blobs;
using DocumentFormat.OpenXml.Drawing.Charts;
using Microsoft.AspNetCore.Http;
using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.FileBlobService
{
    public class FileService : IFileService
    {
        private readonly string _storageAccount = "pinterstclone2025";
        private readonly string _key = "KeyHere";
        private readonly BlobContainerClient _filesContainer;

        public FileService()
        {
            var credential = new StorageSharedKeyCredential(_storageAccount, _key);
            var blobUrl = $"https://{_storageAccount}.blob.core.windows.net";
            var blobServiceClient = new BlobServiceClient(new Uri(blobUrl), credential);
            _filesContainer = blobServiceClient.GetBlobContainerClient("files");
        }

        public async Task<List<BlobDto?>> GetAllBlobsAsync()
        {
            List<BlobDto> files = new List<BlobDto>();

            await foreach (var file in _filesContainer.GetBlobsAsync())
            {
                string uri = _filesContainer.Uri.ToString();
                var name = file.Name;
                var fullUri = $"{uri}/{name}";

                files.Add(new BlobDto
                {
                    Uri = fullUri,
                    Name = name,
                    ContentType = file.Properties.ContentType
                });
            }

            return files;
        }

        public async Task<BlobResponseDto> UploadAsync(IFormFile blob)
        {
            BlobResponseDto response = new BlobResponseDto();
            BlobClient client = _filesContainer.GetBlobClient(blob.FileName);

            await using (Stream? data = blob.OpenReadStream())
            {
                await client.UploadAsync(data);
            }

            response.Status = $"File {blob.FileName} uploaded successfully.";
            response.Error = false;
            response.Blob.Uri = client.Uri.AbsoluteUri;
            response.Blob.Name = client.Name;

            return response;
        }

        public async Task<BlobDto?> DownloadAsync(string blobFilename)
        {
            BlobClient file = _filesContainer.GetBlobClient(blobFilename);

            if (await file.ExistsAsync())
            {
                var data = await file.OpenReadAsync();
                Stream blobContent = data;

                var content = await file.DownloadContentAsync();

                string name = blobFilename;
                string contentType = content.Value.Details.ContentType;

                return new BlobDto { Content = blobContent, Name = name, ContentType = contentType };
            }

            return null;
        }

        public async Task<BlobResponseDto> DeleteAsync(string blobFilename)
        {
            BlobClient file = _filesContainer.GetBlobClient(blobFilename);

            await file.DeleteAsync();

            return new BlobResponseDto { Error = false, Status = $"File {blobFilename} has been successfully deleted." };
        }
    }
}