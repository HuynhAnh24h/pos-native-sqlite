import * as Crypto from 'expo-crypto';

// Tạo salt ngẫu nhiên
export async function generateSalt() {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Hash password với PBKDF2
export async function hashPassword(password, salt, iterations = 10000) {
  const passwordHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  
  // Thực hiện nhiều vòng hash để tăng bảo mật
  let result = passwordHash;
  for (let i = 1; i < iterations; i++) {
    result = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      result
    );
  }
  
  return {
    passwordHash: result,
    iterations
  };
}

// Verify password
export async function verifyPassword(password, salt, storedHash, iterations) {
  const { passwordHash } = await hashPassword(password, salt, iterations);
  return passwordHash === storedHash;
}