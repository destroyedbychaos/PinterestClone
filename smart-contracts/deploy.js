// Скрипт для деплою NFT Marketplace контракту
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Деплой NFT Marketplace контракту...");

  // Отримання деплоєра
  const [deployer] = await hre.ethers.getSigners();
  console.log("Деплой з акаунту:", deployer.address);

  // Перевірка балансу
  const balance = await deployer.getBalance();
  console.log("Баланс акаунту:", hre.ethers.utils.formatEther(balance), "MATIC");

  // Деплой контракту
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy();

  await marketplace.deployed();

  console.log("✅ NFT Marketplace задеплоєно за адресою:", marketplace.address);

  // Налаштування базових параметрів
  console.log("⚙️ Налаштування параметрів контракту...");

  // Встановлення комісії за лістинг (0.001 MATIC)
  const listingPrice = hre.ethers.utils.parseEther("0.001");
  await marketplace.setListingPrice(listingPrice);
  console.log("Комісія за лістинг встановлена:", hre.ethers.utils.formatEther(listingPrice), "MATIC");

  // Встановлення комісії маркетплейсу (2.5%)
  await marketplace.setMarketplaceFee(250); // 2.5% у базисних пунктах
  console.log("Комісія маркетплейсу встановлена: 2.5%");

  // Виведення інформації про контракт
  console.log("\n📋 Інформація про контракт:");
  console.log("Адреса контракту:", marketplace.address);
  console.log("Власник контракту:", await marketplace.owner());
  console.log("Комісія за лістинг:", hre.ethers.utils.formatEther(await marketplace.getListingPrice()), "MATIC");
  console.log("Комісія маркетплейсу:", (await marketplace.getMarketplaceFee()) / 100, "%");

  // Збереження адреси контракту
  const fs = require('fs');
  const contractInfo = {
    address: marketplace.address,
    network: hre.network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    listingPrice: hre.ethers.utils.formatEther(listingPrice),
    marketplaceFee: "2.5%"
  };

  fs.writeFileSync(
    './deployed-contracts.json',
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("\n💾 Інформація про контракт збережена в deployed-contracts.json");

  // Верифікація контракту (якщо потрібно)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔍 Очікування блоків для верифікації...");
    await marketplace.deployTransaction.wait(5);

    try {
      await hre.run("verify:verify", {
        address: marketplace.address,
        constructorArguments: [],
      });
      console.log("✅ Контракт успішно верифіковано!");
    } catch (error) {
      console.log("❌ Помилка верифікації:", error.message);
    }
  }

  console.log("\n🎉 Деплой завершено успішно!");
  console.log("\n📝 Наступні кроки:");
  console.log("1. Оновіть адресу контракту в конфігурації фронтенду");
  console.log("2. Оновіть адресу в backend конфігурації");
  console.log("3. Протестуйте основні функції маркетплейсу");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Помилка деплою:", error);
    process.exit(1);
  });