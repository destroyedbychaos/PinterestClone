using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

namespace PinterestClone.API
{
    public class FileUploadOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var hasFileParameters = context.MethodInfo.GetParameters()
                .Any(p => p.ParameterType == typeof(IFormFile) || 
                         p.ParameterType == typeof(IFormFile[]));

            if (!hasFileParameters)
                return;

            
            var queryParameters = operation.Parameters?
                .Where(p => p.In == ParameterLocation.Query)
                .ToList() ?? new List<OpenApiParameter>();

            operation.RequestBody = new OpenApiRequestBody
            {
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["multipart/form-data"] = new OpenApiMediaType
                    {
                        Schema = new OpenApiSchema
                        {
                            Type = "object",
                            Properties = new Dictionary<string, OpenApiSchema>(),
                            Required = new HashSet<string>()
                        }
                    }
                }
            };

            var formDataSchema = operation.RequestBody.Content["multipart/form-data"].Schema;

        
            foreach (var parameter in context.MethodInfo.GetParameters())
            {
                var fromFormAttribute = parameter.GetCustomAttribute<Microsoft.AspNetCore.Mvc.FromFormAttribute>();
                var fromQueryAttribute = parameter.GetCustomAttribute<Microsoft.AspNetCore.Mvc.FromQueryAttribute>();
                
                
                if (fromFormAttribute != null || 
                    (parameter.ParameterType == typeof(IFormFile) && fromQueryAttribute == null))
                {
                    if (parameter.ParameterType == typeof(IFormFile))
                    {
                        formDataSchema.Properties[parameter.Name!] = new OpenApiSchema
                        {
                            Type = "string",
                            Format = "binary"
                        };
                        
                        
                        if (!parameter.HasDefaultValue)
                        {
                            formDataSchema.Required.Add(parameter.Name!);
                        }
                    }
                }
            }

            operation.Parameters = queryParameters;
        }
    }
} 