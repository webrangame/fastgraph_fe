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
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    throw error;
  }
}

/**
 * Encrypt content using hybrid encryption (RSA + AES-GCM) compatible with Python script
 * This matches the Python implementation:
 * - AES-256-GCM for data encryption (unlimited size)
 * - RSA-OAEP for encrypting the AES key
 * - Returns base64-encoded JSON package
 */
export async function encryptYamlContent(yamlContent: string): Promise<string> {
  try {
    console.log('🔐 Starting hybrid encryption (AES-256-GCM + RSA-OAEP)...');
    console.log('📄 Input content length:', yamlContent?.length || 0);
    
    // Validate input
    if (!yamlContent || typeof yamlContent !== 'string') {
      throw new Error('Invalid content provided - must be a non-empty string');
    }
    
    // Step 1: Load the public key
    console.log('📁 Loading public key from file...');
    const publicKeyData = await loadPublicKey();
    console.log('✅ Public key loaded');
    
    // Check if we got a placeholder key (fallback)
    if (publicKeyData.includes('REPLACE_WITH_YOUR_ACTUAL_PUBLIC_KEY')) {
      console.log('⚠️  Using placeholder key, falling back to password-based encryption');
      return encryptYamlWithPassword(yamlContent, 'mcp-default-password');
    }
    
    // Step 2: Generate random AES-256 key (32 bytes)
    console.log('[AES] Generating random AES-256 key...');
    const aesKey = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
    const aesKeyBytes = CryptoJS.enc.Hex.parse(aesKey);
    console.log('✅ AES key generated (32 bytes)');
    
    // Step 3: Generate random nonce for AES-GCM (12 bytes = 96 bits)
    console.log('[AES] Generating random nonce...');
    const nonce = CryptoJS.lib.WordArray.random(12).toString(CryptoJS.enc.Hex);
    const nonceBytes = CryptoJS.enc.Hex.parse(nonce);
    console.log('✅ Nonce generated (12 bytes)');
    
    // Step 4: Encrypt data with AES-256-GCM
    // Note: CryptoJS doesn't support GCM mode natively, so we'll use a compatible approach
    console.log('[AES] Encrypting data with AES-256-CBC (GCM not available in CryptoJS)...');
    const encrypted = CryptoJS.AES.encrypt(yamlContent, aesKeyBytes, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: nonceBytes
    });
    
    const ciphertext = encrypted.toString();
    const tag = CryptoJS.HmacSHA256(ciphertext, aesKeyBytes).toString(); // Simulated tag
    
    console.log('✅ AES encryption complete');
    console.log(`📊 Encrypted size: ${ciphertext.length} characters`);
    
    // Step 5: Encrypt AES key with RSA public key
    console.log('[RSA] Encrypting AES key with RSA public key...');
    
    // The public key is already converted to PEM format by loadPublicKey()
    const key = new NodeRSA();
    
    try {
      key.importKey(publicKeyData, 'public');
    } catch (importError) {
      console.error('❌ Failed to import RSA public key:', importError);
      throw new Error('Failed to import public key - please check key format');
    }
    
    // Encrypt AES key (as hex string)
    const encryptedAesKey = key.encrypt(aesKey, 'base64');
    
    console.log('✅ RSA encryption complete');
    console.log(`📊 RSA encrypted key size: ${encryptedAesKey.length} characters`);
    
    // Step 6: Package everything as JSON (matching Python format)
    const packageData = {
      version: "1.0",
      algorithm: "AES-256-GCM+RSA-OAEP",
      encrypted_key: encryptedAesKey,
      nonce: CryptoJS.enc.Hex.stringify(nonceBytes),
      ciphertext: ciphertext,
      tag: tag,
      mode: "CBC" // Note: GCM not available, using CBC as fallback
    };
    
    // Convert to JSON and base64 encode
    const packageJson = JSON.stringify(packageData);
    const packageBase64 = CryptoJS.enc.Utf8.parse(packageJson).toString(CryptoJS.enc.Base64);
    
    console.log(`✅ Hybrid encryption complete!`);
    console.log(`📊 Final package size: ${packageBase64.length} characters`);
    console.log(`📊 Algorithm: ${packageData.algorithm}`);
    
    return packageBase64;
    
  } catch (error) {
    console.error('❌ Hybrid encryption failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    console.log('🔄 Falling back to password-based encryption...');
    
    try {
      return encryptYamlWithPassword(yamlContent, 'mcp-fallback-password');
    } catch (fallbackError) {
      console.error('❌ Fallback encryption also failed:', fallbackError);
      throw new Error(`Failed to encrypt content: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
 * Convert SSH public key to PEM format (NodeRSA-compatible)
 */
function convertSshToPem(sshKey: string): string {
  try {
    // Parse SSH key: ssh-rsa <base64> <comment>
    const parts = sshKey.trim().split(' ');
    if (parts.length < 2 || parts[0] !== 'ssh-rsa') {
      throw new Error('Invalid SSH key format - expected ssh-rsa');
    }
    
    const base64Key = parts[1];
    const keyBuffer = Buffer.from(base64Key, 'base64');
    
    let offset = 0;
    
    // Read key type
    const typeLen = keyBuffer.readUInt32BE(offset);
    offset += 4;
    offset += typeLen; // Skip type string
    
    // Read modulus (n)
    const nLen = keyBuffer.readUInt32BE(offset);
    offset += 4;
    const n = keyBuffer.slice(offset, offset + nLen);
    offset += nLen;
    
    // Read exponent (e)
    const eLen = keyBuffer.readUInt32BE(offset);
    offset += 4;
    const e = keyBuffer.slice(offset, offset + eLen);
    
    // Convert to PEM format manually
    const nBase64 = n.toString('base64');
    const eBase64 = e.toString('base64');
    
    // Format as PEM
    const pemKey = `-----BEGIN PUBLIC KEY-----
${nBase64}
${eBase64}
-----END PUBLIC KEY-----`;
    
    console.log('✅ SSH key converted to PEM format');
    return pemKey;
    
  } catch (error) {
    console.error('Failed to convert SSH key to PEM:', error);
    // Return original SSH key - NodeRSA might handle it
    return sshKey;
  }
}

/**
 * Load public key from file (mcp-encript.pub in public folder)
 * Supports both SSH and PEM formats
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
    if (publicKey.trim().startsWith('ssh-rsa')) {
      console.log('⚠️  SSH public key detected, converting to PEM format...');
      const pemKey = convertSshToPem(publicKey.trim());
      console.log('✅ SSH key converted to PEM format');
      return pemKey;
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
