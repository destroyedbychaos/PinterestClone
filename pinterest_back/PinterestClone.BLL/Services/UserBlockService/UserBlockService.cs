using PinterestClone.BLL.Services.UserBlockService;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Repositories.UserBlockRepository;
using PinterestClone.DAL.Repositories.UserRepository;

namespace PinterestClone.BLL.Services.UserBlockService
{
    /// <summary>
    /// Сервіс відповідальний за блокування користувачів.
    /// -------------------------------------------------
    /// Методи:
    ///     -- Заблокувати користувача
    ///     -- Розблокувати користувача
    ///     -- Отримати заблокованих користувачів для певного користувача
    ///     -- Отримати ким заблокований певний користувач
    ///     -- Перевірити чи користувач заблокований
    /// </summary>
    public class UserBlockService : IUserBlockService
    {
        private readonly IUserBlockRepository _userBlockRepository;
        private readonly IUserRepository _userRepository;

        public UserBlockService(IUserBlockRepository userBlockRepository, IUserRepository userRepository)
        {
            _userBlockRepository = userBlockRepository;
            _userRepository = userRepository;
        }

        /// <summary>
        /// Заблокувати користувача.
        /// </summary>
        /// <param name="blockerId">ID користувача, який блокує.</param>
        /// <param name="blockedUserId">ID користувача, якого потрібно заблокувати.</param>
        /// <param name="reason">Причина блокування (необов’язково).</param>
        /// <returns><see cref="ServiceResponse"/> з результатом операції.</returns>
        public async Task<ServiceResponse> BlockUserAsync(string blockerId, string blockedUserId, string? reason = null)
        {
            try
            {
                if (blockerId == blockedUserId)
                {
                    return ServiceResponse.BadRequestResponse("You cannot block yourself");
                }

                var blocker = await _userRepository.GetByIdAsync(blockerId);
                if (blocker == null)
                {
                    return ServiceResponse.BadRequestResponse("Blocker user not found");
                }

                var blockedUser = await _userRepository.GetByIdAsync(blockedUserId);
                if (blockedUser == null)
                {
                    return ServiceResponse.BadRequestResponse("User to block not found");
                }

                var existingBlock = await _userBlockRepository.GetByBlockerAndBlockedAsync(blockerId, blockedUserId);
                if (existingBlock != null)
                {
                    return ServiceResponse.BadRequestResponse("User is already blocked");
                }

                var userBlock = new UserBlock
                {
                    BlockerId = blockerId,
                    BlockedUserId = blockedUserId,
                    Reason = reason,
                    BlockedAt = DateTime.UtcNow
                };

                var createdBlock = await _userBlockRepository.CreateAsync(userBlock);

                return ServiceResponse.OkResponse("User blocked successfully", createdBlock);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error blocking user: {ex.Message}");
            }
        }

        /// <summary>
        /// Розблокувати користувача.
        /// </summary>
        /// <param name="blockerId">ID користувача, який розблокує.</param>
        /// <param name="blockedUserId">ID користувача, якого потрібно розблокувати.</param>
        /// <returns><see cref="ServiceResponse"/> з результатом операції.</returns>
        public async Task<ServiceResponse> UnblockUserAsync(string blockerId, string blockedUserId)
        {
            try
            {
                var result = await _userBlockRepository.UnblockUserAsync(blockerId, blockedUserId);
                if (!result)
                {
                    return ServiceResponse.BadRequestResponse("User is not blocked");
                }

                return ServiceResponse.OkResponse("User unblocked successfully");
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error unblocking user: {ex.Message}");
            }
        }

        /// <summary>
        /// Отримати список користувачів заблокованих певним користувачем.
        /// </summary>
        /// <param name="blockerId">ID користувача, який заблокував інших.</param>
        /// <returns><see cref="ServiceResponse"/> зі списком заблокованих користувачів.</returns>
        public async Task<ServiceResponse> GetBlockedUsersAsync(string blockerId)
        {
            try
            {
                var blockedUsers = await _userBlockRepository.GetBlockedUsersAsync(blockerId);
                return ServiceResponse.OkResponse("Blocked users retrieved successfully", blockedUsers);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error getting blocked users: {ex.Message}");
            }
        }

        /// <summary>
        /// Отримати список користувачів які заблокували певного користувача.
        /// </summary>
        /// <param name="blockedUserId">ID користувача, який може бути заблокованим іншими.</param>
        /// <returns><see cref="ServiceResponse"/> зі списком користувачів, які його заблокували.</returns>
        public async Task<ServiceResponse> GetBlockedByUsersAsync(string blockedUserId)
        {
            try
            {
                var blockedByUsers = await _userBlockRepository.GetBlockedByUsersAsync(blockedUserId);
                return ServiceResponse.OkResponse("Users who blocked this user retrieved successfully", blockedByUsers);
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error getting users who blocked this user: {ex.Message}");
            }
        }

        /// <summary>
        /// Перевірити, чи певний користувач заблокований іншим користувачем.
        /// </summary>
        /// <param name="blockerId">ID користувача, який можливо заблокував.</param>
        /// <param name="blockedUserId">ID користувача, який можливо заблокований.</param>
        /// <returns><see cref="ServiceResponse"/> з інформацією про статус блокування.</returns>
        public async Task<ServiceResponse> IsBlockedAsync(string blockerId, string blockedUserId)
        {
            try
            {
                var isBlocked = await _userBlockRepository.IsBlockedAsync(blockerId, blockedUserId);
                return ServiceResponse.OkResponse("Block status retrieved successfully", new { IsBlocked = isBlocked });
            }
            catch (Exception ex)
            {
                return ServiceResponse.InternalServerErrorResponse($"Error checking block status: {ex.Message}");
            }
        }
    }
}
