// utils/helpers.js

/**
 * Formats a date to a readable string.
 * @param {Date} date - Date object.
 * @returns {string} - Formatted date string.
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0]; // Example: "2024-09-23"
};

/**
 * Generates a random number within a specified range.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} - Random number.
 */
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - Input string.
 * @returns {string} - Capitalized string.
 */
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = {
  formatDate,
  getRandomNumber,
  capitalizeFirstLetter,
};
