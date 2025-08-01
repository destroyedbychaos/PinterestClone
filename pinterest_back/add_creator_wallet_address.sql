-- Оновлюємо існуючі записи: встановлюємо CreatorWalletAddress = OwnerWalletAddress
UPDATE "NFTs" 
SET "CreatorWalletAddress" = "OwnerWalletAddress" 
WHERE "CreatorWalletAddress" = '' OR "CreatorWalletAddress" IS NULL;

-- Перевіряємо результат
SELECT "Id", "Name", "OwnerWalletAddress", "CreatorWalletAddress" 
FROM "NFTs" 
LIMIT 5;