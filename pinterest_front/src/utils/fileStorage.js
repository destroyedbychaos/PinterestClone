// utils/fileStorage.js
export class FileStorage {
    constructor() {
      this.dbName = 'CreateAestDB';
      this.version = 1;
      this.storeName = 'files';
    }
  
    async openDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName, { keyPath: 'id' });
          }
        };
      });
    }
  
    async saveFile(id, file, preview) {
      try {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        await new Promise((resolve, reject) => {
          const request = store.put({
            id: id,
            file: file,
            preview: preview,
            name: file.name,
            size: file.size,
            type: file.type,
            timestamp: Date.now()
          });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        db.close();
      } catch (error) {
        console.error('Error saving file to IndexedDB:', error);
      }
    }
  
    async getFile(id) {
      try {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        const result = await new Promise((resolve, reject) => {
          const request = store.get(id);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        db.close();
        return result;
      } catch (error) {
        console.error('Error getting file from IndexedDB:', error);
        return null;
      }
    }
  
    async deleteFile(id) {
      try {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        await new Promise((resolve, reject) => {
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        db.close();
      } catch (error) {
        console.error('Error deleting file from IndexedDB:', error);
      }
    }
  
    async getAllFiles() {
      try {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        
        const result = await new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        
        db.close();
        return result;
      } catch (error) {
        console.error('Error getting all files from IndexedDB:', error);
        return [];
      }
    }
  
    async clearAll() {
      try {
        const db = await this.openDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        await new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        db.close();
      } catch (error) {
        console.error('Error clearing IndexedDB:', error);
      }
    }
  }
  
  export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };