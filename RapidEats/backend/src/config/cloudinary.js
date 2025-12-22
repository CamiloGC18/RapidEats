const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { ValidationError } = require('../utils/errors');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Only JPEG, PNG and WebP images are allowed'), false);
    }
  },
});

/**
 * Transformaciones optimizadas de Cloudinary para diferentes casos de uso
 */
const imageTransformations = {
  // Avatar de usuario - pequeño, circular
  avatar: {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto',
    radius: 'max'
  },

  // Thumbnail - para listas y previews
  thumbnail: {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto'
  },

  // Imagen de producto - mediana, optimizada
  product: {
    width: 600,
    height: 600,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto'
  },

  // Cover de restaurante - wide format
  restaurantCover: {
    width: 1200,
    height: 400,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto'
  },

  // Logo de restaurante
  restaurantLogo: {
    width: 400,
    height: 400,
    crop: 'fit',
    quality: 'auto:best',
    fetch_format: 'auto',
    background: 'white'
  },

  // Banner promocional
  banner: {
    width: 1920,
    height: 600,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto'
  },

  // Responsive - genera múltiples tamaños
  responsive: [
    { width: 400, suffix: 'small' },
    { width: 800, suffix: 'medium' },
    { width: 1200, suffix: 'large' }
  ]
};

/**
 * Generar URL optimizada de Cloudinary
 * @param {String} publicId - Public ID de la imagen en Cloudinary
 * @param {String} transformation - Tipo de transformación ('avatar', 'product', etc)
 * @returns {String} - URL optimizada
 */
const getOptimizedImageUrl = (publicId, transformation = 'product') => {
  if (!publicId) return null;

  const transforms = imageTransformations[transformation];
  if (!transforms) {
    return cloudinary.url(publicId);
  }

  return cloudinary.url(publicId, transforms);
};

/**
 * Generar múltiples URLs responsive
 * @param {String} publicId - Public ID de la imagen
 * @returns {Object} - {small, medium, large}
 */
const getResponsiveImageUrls = (publicId) => {
  if (!publicId) return null;

  const urls = {};
  imageTransformations.responsive.forEach(({ width, suffix }) => {
    urls[suffix] = cloudinary.url(publicId, {
      width,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    });
  });

  return urls;
};

/**
 * Upload imagen a Cloudinary con transformación
 * @param {Buffer} fileBuffer - Buffer del archivo
 * @param {String} folder - Carpeta en Cloudinary
 * @param {String} transformation - Transformación a aplicar
 * @returns {Promise<Object>} - {url, publicId, secureUrl}
 */
const uploadImage = (fileBuffer, folder = 'rapideats', transformation = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto'
    };

    if (transformation && imageTransformations[transformation]) {
      uploadOptions.transformation = imageTransformations[transformation];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Eliminar imagen de Cloudinary
 * @param {String} publicId - Public ID de la imagen
 * @returns {Promise<Object>}
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload múltiples imágenes
 * @param {Array} files - Array de file buffers
 * @param {String} folder - Carpeta en Cloudinary
 * @returns {Promise<Array>} - Array de resultados
 */
const uploadMultipleImages = async (files, folder = 'rapideats') => {
  const uploadPromises = files.map(file => uploadImage(file.buffer, folder));
  return Promise.all(uploadPromises);
};

module.exports = { 
  cloudinary, 
  upload,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  uploadImage,
  deleteImage,
  uploadMultipleImages,
  imageTransformations
};
