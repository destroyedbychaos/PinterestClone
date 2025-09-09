using PinterestClone.BLL.Services;
using Microsoft.AspNetCore.Mvc;

namespace PinterestClone.API.Controllers
{
    /// <summary>
    /// Базовий контролер для наслідування.
    /// </summary>
    public abstract class BaseController : ControllerBase
    {
        protected IActionResult GetResult(ServiceResponse serviseResponse)
        {
            return StatusCode((int)serviseResponse.StatusCode, serviseResponse);
        }
    }
}



