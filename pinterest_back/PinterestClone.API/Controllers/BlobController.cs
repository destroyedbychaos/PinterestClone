using Emgu.CV;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PinterestClone.BLL.DTOs;
using PinterestClone.BLL.Services.FileBlobService;

namespace PinterestClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlobController : BaseController
    {
        private readonly IFileService _fileService;
        public BlobController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpGet]
        public async Task<IActionResult> ListAllBlobs()
        {
            var result = await _fileService.GetAllBlobsAsync();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null)
            {
                return BadRequest("Invalid request.");
            }

            BlobResponseDto result = await _fileService.UploadAsync(file);

            if (result.Error == true)
            {
                return BadRequest(result.Status);
            }

            return Ok(result);
        }

        [HttpGet]
        [Route("filename")]
        public async Task<IActionResult> Download(string filename)
        {
            if (filename == null)
            {
                return BadRequest("Invalid request.");
            }

            BlobDto result = await _fileService.DownloadAsync(filename);

            if (result == null)
            {
                return BadRequest("Error downloading file. File does not exist.");
            }

            return File(result.Content, result.ContentType, result.Name);
        }

        [HttpDelete]
        [Route("filename")]
        public async Task<IActionResult> Delete(string filename)
        {
            if (filename == null)
            {
                return BadRequest("Invalid request.");
            }

            BlobResponseDto result = await _fileService.DeleteAsync(filename);

            if (result.Error == true)
            {
                return BadRequest(result.Status);
            }

            return Ok(result.Status);
        }
    }
}