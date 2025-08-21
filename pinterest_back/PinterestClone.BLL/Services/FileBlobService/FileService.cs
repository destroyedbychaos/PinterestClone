using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using PinterestClone.BLL.DTOs;

namespace PinterestClone.BLL.Services.FileBlobService
{
    public class FileService : IFileService
    {
        private readonly BlobContainerClient _filesContainer;

        public FileService(IConfiguration configuration)
        {
            string connectionString = configuration.GetConnectionString("AzureStorage");
            var blobServiceClient = new BlobServiceClient(connectionString);
            _filesContainer = blobServiceClient.GetBlobContainerClient("files");

            _filesContainer.CreateIfNotExists(Azure.Storage.Blobs.Models.PublicAccessType.None);
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

            if (await client.ExistsAsync())
            {
                response.Status = $"File {blob.FileName} already exists.";
                response.Error = true;
                response.Blob.Uri = client.Uri.AbsoluteUri;
                response.Blob.Name = client.Name;

                return response;
            }

            await using (Stream? data = blob.OpenReadStream())
            {
                await client.UploadAsync(data, overwrite: true);
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
                var content = await file.DownloadContentAsync();

                return new BlobDto { Content = data, Name = blobFilename, ContentType = content.Value.Details.ContentType };
            }

            return null;
        }

        public async Task<BlobResponseDto> DeleteAsync(string blobFilename)
        {
            BlobClient file = _filesContainer.GetBlobClient(blobFilename);

            if (await file.ExistsAsync())
            {
                await file.DeleteIfExistsAsync();

                return new BlobResponseDto { Error = false, Status = $"File {blobFilename} has been successfully deleted." };
            }

            return new BlobResponseDto { Error = true, Status = $"File {blobFilename} does not exist." };
        }
    }
}