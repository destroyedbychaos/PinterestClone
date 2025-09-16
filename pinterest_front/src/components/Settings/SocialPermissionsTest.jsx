import React, { useState, useEffect } from 'react';
import socialPermissionsApi from '../../services/socialPermissionsApi';

const SocialPermissionsTest = () => {
  const [currentSettings, setCurrentSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      console.log('Loading social permissions...');
      const response = await socialPermissionsApi.getSocialPermissions();
      console.log('Full response:', response);
      
      let settings = null;
      if (response && response.success && response.payload) {
        settings = response.payload;
      } else if (response && response.success && response.data) {
        settings = response.data;
      } else if (response) {
        settings = response;
      }
      
      console.log('Parsed settings:', settings);
      setCurrentSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSaveSettings = async () => {
    if (!currentSettings) return;
    
    const testSettings = {
      ...currentSettings,
      mentionsSetting: 'nobody', // Змінюємо для тесту
      allowComments: false
    };

    try {
      console.log('Saving test settings:', testSettings);
      const response = await socialPermissionsApi.updateSocialPermissions(testSettings);
      console.log('Save response:', response);
      
      // Перезавантажуємо після збереження
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px', borderRadius: '8px' }}>
      <h3>Social Permissions Test</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={loadSettings} disabled={loading}>
          {loading ? 'Loading...' : 'Reload Settings'}
        </button>
        <button onClick={testSaveSettings} disabled={!currentSettings} style={{ marginLeft: '10px' }}>
          Test Save (Change to Nobody + No Comments)
        </button>
      </div>

      <div style={{ background: '#fff', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
        <strong>Current Settings:</strong>
        <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
          {currentSettings ? JSON.stringify(currentSettings, null, 2) : 'No settings loaded'}
        </pre>
      </div>

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <strong>Instructions:</strong>
        <ol>
          <li>Click "Reload Settings" to load current settings</li>
          <li>Click "Test Save" to change settings to Nobody + No Comments</li>
          <li>Refresh the page and check if settings persist</li>
          <li>Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
};

export default SocialPermissionsTest;
