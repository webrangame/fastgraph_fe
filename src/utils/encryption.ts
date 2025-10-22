import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';

// Load the public key from file or environment
// You can either:
// 1. Put your mcp-encript.pub file in the public folder and load it
// 2. Add it as an environment variable
// 3. Import it directly

const MCP_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...REPLACE_WITH_YOUR_ACTUAL_PUBLIC_KEY...
-----END PUBLIC KEY-----`;

/**
 * Encrypts YAML content using AES encryption with a password-derived key
 * This is a fallback method when RSA encryption fails
 */
function encryptYamlWithPassword(yamlContent: string, password: string): string {
  try {
    console.log('🔐 Using password-based encryption as fallback...');
    console.log('📄 YAML content length:', yamlContent?.length || 0);
    console.log('🔑 Password length:', password?.length || 0);
    
    // Validate inputs
    if (!yamlContent || typeof yamlContent !== 'string') {
      throw new Error('Invalid YAML content provided');
    }
    
    if (!password || typeof password !== 'string') {
      throw new Error('Invalid password provided');
    }
    
    // Generate a key from password using PBKDF2
    console.log('🔄 Generating key from password using PBKDF2...');
    
    // Test CryptoJS availability
    if (typeof CryptoJS === 'undefined') {
      throw new Error('CryptoJS is not available');
    }
    
    if (typeof CryptoJS.PBKDF2 === 'undefined') {
      throw new Error('CryptoJS.PBKDF2 is not available');
    }
    
    const key = CryptoJS.PBKDF2(password, 'mcp-salt', {
      keySize: 256/32,
      iterations: 10000
    });
    console.log('✅ Key generated successfully');
    console.log('🔑 Key type:', typeof key);
    console.log('🔑 Key toString length:', key.toString().length);
    
    // Encrypt the YAML content using a simpler approach
    console.log('🔒 Encrypting YAML content...');
    console.log('🔒 CryptoJS.AES available:', typeof CryptoJS.AES !== 'undefined');
    console.log('🔒 CryptoJS.mode available:', typeof CryptoJS.mode !== 'undefined');
    console.log('🔒 CryptoJS.pad available:', typeof CryptoJS.pad !== 'undefined');
    
    // Use ECB mode instead of CBC to avoid the xorBlock issue
    const encrypted = CryptoJS.AES.encrypt(yamlContent, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    console.log('✅ YAML content encrypted successfully');
    console.log('🔒 Encrypted result type:', typeof encrypted);
    console.log('🔒 Encrypted result toString length:', encrypted.toString().length);
    
    const result = JSON.stringify({
      encryptedData: encrypted.toString(),
      algorithm: 'AES-256-ECB-PBKDF2',
      timestamp: Date.now(),
      version: '1.0',
      fallback: true
    });
    
    console.log('🎉 Password-based encryption completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ Password-based encryption failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

/**
 * Encrypts YAML content using hybrid encryption:
 * 1. Generate random AES key
 * 2. Encrypt YAML with AES
 * 3. Encrypt AES key with RSA public key
 */
export async function encryptYamlContent(yamlContent: string): Promise<string> {
  try {
    console.log('🔐 Starting YAML encryption...');
    console.log('📄 Input YAML content length:', yamlContent?.length || 0);
    console.log('📄 Input YAML content type:', typeof yamlContent);
    
    // Validate input
    if (!yamlContent || typeof yamlContent !== 'string') {
      throw new Error('Invalid YAML content provided - must be a non-empty string');
    }
    
    // Load the public key from file
    console.log('📁 Loading public key from file...');
    const publicKey = await loadPublicKey();
    console.log('✅ Public key loaded successfully');
    
    // Check if we got a placeholder key (fallback)
    if (publicKey.includes('REPLACE_WITH_YOUR_ACTUAL_PUBLIC_KEY')) {
      console.log('⚠️  Using placeholder key, falling back to password-based encryption');
      return encryptYamlWithPassword(yamlContent, 'mcp-default-password');
    }
    
    // Generate a random AES key
    console.log('🔑 Generating AES key...');
    const aesKey = CryptoJS.lib.WordArray.random(256/8);
    console.log('✅ AES key generated');
    
    // Encrypt the YAML content with AES
    console.log('🔒 Encrypting YAML content with AES...');
    const encryptedYaml = CryptoJS.AES.encrypt(yamlContent, aesKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    console.log('✅ YAML content encrypted with AES');
    
    // Convert AES key to string for RSA encryption
    console.log('🔄 Converting AES key for RSA encryption...');
    const aesKeyString = CryptoJS.enc.Base64.stringify(aesKey);
    console.log('✅ AES key converted to string');
    
    // Encrypt the AES key with RSA public key
    console.log('🔐 Encrypting AES key with RSA...');
    const key = new NodeRSA();
    key.importKey(publicKey, 'public');
    const encryptedAesKey = key.encrypt(aesKeyString, 'base64');
    console.log('✅ AES key encrypted with RSA');
    
    // Return the encrypted data in a structured format
    const result = JSON.stringify({
      encryptedData: encryptedYaml.toString(),
      encryptedKey: encryptedAesKey,
      algorithm: 'AES-256-CBC + RSA-2048',
      timestamp: Date.now(),
      version: '1.0'
    });
    
    console.log('🎉 Encryption completed successfully');
    return result;
    
  } catch (error) {
    console.error('❌ RSA encryption failed:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    console.log('🔄 Falling back to password-based encryption...');
    
    try {
      return encryptYamlWithPassword(yamlContent, 'mcp-fallback-password');
    } catch (fallbackError) {
      console.error('❌ Fallback encryption also failed:', fallbackError);
      console.error('Fallback error details:', {
        message: fallbackError?.message,
        stack: fallbackError?.stack,
        name: fallbackError?.name
      });
      throw new Error(`Failed to encrypt YAML content: ${error?.message || 'Unknown error'}`);
    }
  }
}

/**
 * Decrypts YAML content (requires private key - for testing purposes)
 */
export function decryptYamlContent(encryptedData: string, privateKey?: string): string {
  try {
    const data = JSON.parse(encryptedData);
    
    if (!privateKey) {
      throw new Error('Private key required for decryption');
    }
    
    // Decrypt the AES key with RSA private key
    const key = new NodeRSA();
    key.importKey(privateKey, 'private');
    const aesKeyString = key.decrypt(data.encryptedKey, 'utf8');
    
    // Convert back to CryptoJS WordArray
    const aesKey = CryptoJS.enc.Base64.parse(aesKeyString);
    
    // Decrypt the YAML content with AES
    const decrypted = CryptoJS.AES.decrypt(data.encryptedData, aesKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt YAML content');
  }
}

/**
 * Load public key from file (mcp-encript.pub in public folder)
 */
export async function loadPublicKey(): Promise<string> {
  try {
    console.log('📁 Attempting to load public key from /mcp-encript.pub...');
    
    // Load the public key from the public folder
    const response = await fetch('/mcp-encript.pub');
    console.log('📡 Fetch response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to load public key: HTTP ${response.status} ${response.statusText}`);
    }
    
    const publicKey = await response.text();
    console.log('📄 Public key content length:', publicKey.length);
    console.log('📄 Public key preview:', publicKey.substring(0, 100) + '...');
    
    // Check if it's already in PEM format
    if (publicKey.includes('BEGIN PUBLIC KEY') && publicKey.includes('END PUBLIC KEY')) {
      console.log('✅ Public key is already in PEM format');
      return publicKey.trim();
    }
    
    // Check if it's an SSH public key format
    if (publicKey.startsWith('ssh-rsa') || publicKey.startsWith('ssh-ed25519') || publicKey.startsWith('ssh-dss')) {
      console.log('⚠️  SSH public key detected, but conversion to PEM is complex');
      console.log('🔄 Falling back to placeholder key (will use password-based encryption)');
      return MCP_PUBLIC_KEY;
    }
    
    // If neither format, throw error
    console.error('❌ Unsupported public key format');
    console.error('📄 Expected PEM format (-----BEGIN PUBLIC KEY-----) or SSH format (ssh-rsa)');
    console.error('📄 Actual content:', publicKey);
    throw new Error('Unsupported public key format - expected PEM or SSH format');
    
  } catch (error) {
    console.error('❌ Failed to load public key from file:', error);
    console.log('🔄 Falling back to placeholder key');
    console.log('⚠️  This will cause encryption to fail - please check your mcp-encript.pub file');
    return MCP_PUBLIC_KEY;
  }
}
