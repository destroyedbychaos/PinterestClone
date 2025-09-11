using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.Services.FileBlobService
{
    /// <summary>
    /// Сервіс відповідальний за взаємодію з Azure Blob файловою системою.
    /// ------------------------------------------------------------------
    /// Методи:
    ///     -- Витягнути всі назви блобів
    ///     -- Зберегти файл в базі
    ///     -- Завантажити файл з бази
    ///     -- Видалити файл з бази
    /// </summary>
    public class FileService : IFileService
    {
        private readonly BlobContainerClient _filesContainer;

        public FileService(IConfiguration configuration)
        {
            string connectionString = configuration.GetConnectionString("AzureStorage")!;
            var blobServiceClient = new BlobServiceClient(connectionString);
            _filesContainer = blobServiceClient.GetBlobContainerClient("files");

            _filesContainer.CreateIfNotExists(Azure.Storage.Blobs.Models.PublicAccessType.None);
        }

        /// <summary>
        /// Отримує всі файли (блоби) з контейнера.
        /// </summary>
        /// <returns>Список об’єктів <see cref="BlobDto"/>, що містить назви, URI та типи вмісту файлів.</returns>
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

        /// <summary>
        /// Завантажує новий файл до Azure Blob Storage.
        /// </summary>
        /// <param name="blob">Файл, який потрібно завантажити.</param>
        /// <returns>Об’єкт <see cref="BlobResponseDto"/> зі статусом операції, ознакою помилки та даними про файл.</returns>
        /// <exception cref="Azure.RequestFailedException">Викидається у випадку помилки з боку Azure Storage під час завантаження.</exception>
        public async Task<BlobResponseDto> UploadAsync(IFormFile blob, string id)
        {
            BlobResponseDto response = new BlobResponseDto();

            var extension = Path.GetExtension(blob.FileName)?.ToLowerInvariant();

            var normalizedFileName = $"{id}{extension}";

            BlobClient client = _filesContainer.GetBlobClient(normalizedFileName);

            if (await client.ExistsAsync())
            {
                response.Status = $"File {normalizedFileName} already exists.";
                response.Error = true;
                response.Blob.Uri = client.Uri.AbsoluteUri;
                response.Blob.Name = client.Name;

                return response;
            }

            await using (Stream? data = blob.OpenReadStream())
            {
                await client.UploadAsync(data, overwrite: true);
            }

            response.Status = $"File {normalizedFileName} uploaded successfully.";
            response.Error = false;
            response.Blob.Uri = client.Uri.AbsoluteUri;
            response.Blob.Name = client.Name;

            return response;
        }

        /// <summary>
        /// Завантажує файл з Azure Blob Storage за його назвою.
        /// </summary>
        /// <param name="blobFilename">Назва файлу (блоба), який потрібно отримати.</param>
        /// <returns>Об’єкт <see cref="BlobDto"/>, що містить вміст, назву та тип файлу, або <c>null</c>, якщо файл не існує.</returns>
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

        /// <summary>
        /// Видаляє файл з Azure Blob Storage за його назвою.
        /// </summary>
        /// <param name="blobFilename">Назва файлу (блоба), який потрібно видалити.</param>
        /// <returns>Об’єкт <see cref="BlobResponseDto"/> з інформацією про успішність або невдачу операції.</returns>
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