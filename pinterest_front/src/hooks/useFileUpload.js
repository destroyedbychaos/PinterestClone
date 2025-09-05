import { useState, useRef } from 'react';

export const useFileUpload = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverAnimation, setDragOverAnimation] = useState(false);
  const dragCountRef = useRef(0);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const processFiles = async (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    return await Promise.all(
      imageFiles.map(async (file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        preview: await fileToBase64(file),
        title: '',
        description: '',
        link: '',
        hashtags: ''
      }))
    );
  };

  return {
    isDragOver,
    setIsDragOver,
    dragOverAnimation,
    setDragOverAnimation,
    dragCountRef,
    processFiles
  };
};