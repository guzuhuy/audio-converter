const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Uploads an audio file to Roblox Open Cloud Assets API.
 * @param {string} filePath - Absolute path to the OGG/MP3 file.
 * @param {string} displayName - Name of the asset as it will appear in Roblox.
 * @param {string} creatorId - User ID or Group ID.
 * @param {string} creatorType - 'user' or 'group'.
 * @param {string} apiKey - Roblox Open Cloud API Key.
 * @returns {Promise<{success: boolean, operationPath?: string, error?: string}>}
 */
async function uploadAudio(filePath, displayName, creatorId, creatorType, apiKey) {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File audio tidak ditemukan di server.' };
    }

    const form = new FormData();

    // 1. Prepare the metadata JSON
    const metadata = {
      assetType: 'Audio',
      displayName: displayName.substring(0, 50), // Roblox limits name length
      description: 'Dikonversi otomatis melalui V STUDIO',
      creationContext: {
        creator: {}
      }
    };

    if (creatorType === 'group') {
      metadata.creationContext.creator.groupId = String(creatorId);
    } else {
      metadata.creationContext.creator.userId = String(creatorId);
    }

    // 2. Append metadata and file content to form-data
    form.append('request', JSON.stringify(metadata));
    
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    form.append('fileContent', fileStream, {
      filename: fileName,
      contentType: 'audio/ogg' // Roblox audio converter outputs .ogg files
    });

    console.log(`Initiating Roblox Asset API upload for: ${displayName} (Creator: ${creatorType} ${creatorId})`);
    
    // 3. Make POST request to Roblox Assets API
    const response = await axios.post('https://apis.roblox.com/assets/v1/assets', form, {
      headers: {
        ...form.getHeaders(),
        'x-api-key': apiKey
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (response.data && response.data.path) {
      console.log(`Roblox upload initiated successfully. Operation Path: ${response.data.path}`);
      return { success: true, operationPath: response.data.path };
    } else {
      return { success: false, error: 'Respon dari Roblox tidak valid.' };
    }
  } catch (error) {
    console.error('Error uploading to Roblox:', error.response ? error.response.data : error.message);
    let errorMessage = 'Gagal menghubungi server Roblox.';
    if (error.response && error.response.data) {
      const data = error.response.data;
      errorMessage = data.message || (data.error && data.error.message) || errorMessage;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Checks the status of a long-running Roblox asset creation operation.
 * @param {string} operationPath - Path returned by the upload request (e.g. 'operations/...').
 * @param {string} apiKey - Roblox Open Cloud API Key.
 * @returns {Promise<{success: boolean, done?: boolean, response?: any, error?: string}>}
 */
async function checkOperationStatus(operationPath, apiKey) {
  try {
    const cleanPath = operationPath.startsWith('operations/') ? operationPath : `operations/${operationPath}`;
    const url = `https://apis.roblox.com/assets/v1/${cleanPath}`;

    const response = await axios.get(url, {
      headers: {
        'x-api-key': apiKey
      }
    });

    if (response.data) {
      return {
        success: true,
        done: !!response.data.done,
        response: response.data.response || null,
        error: response.data.error || null
      };
    } else {
      return { success: false, error: 'Respon status operasi tidak valid.' };
    }
  } catch (error) {
    console.error('Error checking Roblox operation status:', error.response ? error.response.data : error.message);
    let errorMessage = 'Gagal memeriksa status moderasi Roblox.';
    if (error.response && error.response.data) {
      const data = error.response.data;
      errorMessage = data.message || (data.error && data.error.message) || errorMessage;
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Check the detail of a completed Roblox asset (e.g. to poll moderationState when Reviewing).
 * @param {string} assetId - The Roblox Asset ID.
 * @param {string} apiKey - Roblox Open Cloud API Key.
 * @returns {Promise<{success: boolean, asset?: any, error?: string}>}
 */
async function getAssetDetails(assetId, apiKey) {
  try {
    const url = `https://apis.roblox.com/assets/v1/assets/${assetId}`;
    const response = await axios.get(url, {
      headers: {
        'x-api-key': apiKey
      }
    });

    if (response.data) {
      return {
        success: true,
        asset: response.data
      };
    } else {
      return { success: false, error: 'Respon detail aset tidak valid.' };
    }
  } catch (error) {
    console.error('Error checking Roblox asset details:', error.response ? error.response.data : error.message);
    let errorMessage = 'Gagal memeriksa detail aset Roblox.';
    if (error.response && error.response.data) {
      const data = error.response.data;
      errorMessage = data.message || (data.error && data.error.message) || errorMessage;
    }
    return { success: false, error: errorMessage };
  }
}

module.exports = {
  uploadAudio,
  checkOperationStatus,
  getAssetDetails
};
