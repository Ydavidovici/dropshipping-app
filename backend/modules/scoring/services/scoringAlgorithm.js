// backend/modules/scoring/services/scoringAlgorithm.js

const logger = require('../../../utils/logger');

const ScoringAlgorithm = {
  /**
   * Calculate the Demand Score (D)
   * @param {number} searchVolume - Monthly search volume for the product.
   * @param {number} salesRank - Sales rank from Amazon.
   * @param {number} maxSearchVolume - Maximum search volume in the dataset.
   * @param {number} maxSalesRank - Maximum sales rank in the dataset.
   * @returns {number} - Normalized Demand Score between 0 and 1.
   */
  calculateDemandScore: (searchVolume, salesRank, maxSearchVolume, maxSalesRank) => {
    const normalizedSearchVolume = maxSearchVolume ? searchVolume / maxSearchVolume : 0;
    const normalizedSalesRank = maxSalesRank ? 1 - (salesRank / maxSalesRank) : 0;
    const demandScore = (normalizedSearchVolume + normalizedSalesRank) / 2;
    return demandScore;
  },

  /**
   * Calculate the Competition Score (C)
   * @param {number} competitorCount - Number of competitors.
   * @param {number} maxCompetitorCount - Maximum number of competitors in the dataset.
   * @returns {number} - Normalized Competition Score between 0 and 1.
   */
  calculateCompetitionScore: (competitorCount, maxCompetitorCount) => {
    const normalizedCompetition = maxCompetitorCount ? 1 - (competitorCount / maxCompetitorCount) : 0;
    return normalizedCompetition;
  },

  /**
   * Calculate the Profit Margin Score (P)
   * @param {number} sellingPrice - Selling price of the product.
   * @param {number} productCost - Cost to source the product.
   * @param {number} fees - Total fees associated with selling the product.
   * @returns {number} - Profit Margin Score.
   */
  calculateProfitMarginScore: (sellingPrice, productCost, fees) => {
    const profitMargin = sellingPrice - productCost - fees;
    const profitMarginScore = sellingPrice ? profitMargin / sellingPrice : 0;
    return profitMarginScore;
  },

  /**
   * Calculate the Supplier Reliability Score (S)
   * @param {number} supplierRating - Supplier's rating out of 5.
   * @returns {number} - Supplier Reliability Score between 0 and 1.
   */
  calculateSupplierReliabilityScore: (supplierRating) => {
    const maxRating = 5;
    const supplierReliabilityScore = supplierRating / maxRating;
    return supplierReliabilityScore;
  },

  /**
   * Calculate the Shipping/Handling Costs Score (SH)
   * @param {number} shippingCost - Shipping cost for the product.
   * @param {number} maxShippingCost - Maximum shipping cost in the dataset.
   * @returns {number} - Normalized Shipping/Handling Costs Score between 0 and 1.
   */
  calculateShippingHandlingScore: (shippingCost, maxShippingCost) => {
    const normalizedSH = maxShippingCost ? 1 - (shippingCost / maxShippingCost) : 0;
    return normalizedSH;
  },

  /**
   * Calculate the Return Rate Score (R)
   * @param {number} returnRate - Return rate for the product (0 to 1).
   * @param {number} maxReturnRate - Maximum return rate in the dataset.
   * @returns {number} - Normalized Return Rate Score between 0 and 1.
   */
  calculateReturnRateScore: (returnRate, maxReturnRate) => {
    const normalizedReturnRate = maxReturnRate ? 1 - (returnRate / maxReturnRate) : 0;
    return normalizedReturnRate;
  },

  /**
   * Calculate the Seasonality Score (SE)
   * @param {number} seasonalityVariation - Measured by fluctuations in sales or search volume.
   * @param {number} maxSeasonalityVariation - Maximum seasonality variation in the dataset.
   * @returns {number} - Normalized Seasonality Score between 0 and 1.
   */
  calculateSeasonalityScore: (seasonalityVariation, maxSeasonalityVariation) => {
    const normalizedSE = maxSeasonalityVariation ? 1 - (seasonalityVariation / maxSeasonalityVariation) : 0;
    return normalizedSE;
  },

  /**
   * Calculate the Product Restrictions Score (PR)
   * @param {boolean} hasRestrictions - Whether the product has restrictions.
   * @returns {number} - Product Restrictions Score (1 if no restrictions, 0 otherwise).
   */
  calculateProductRestrictionsScore: (hasRestrictions) => {
    return hasRestrictions ? 0 : 1;
  },

  /**
   * Calculate the Final Score
   * @param {object} scores - Object containing all individual scores.
   * @param {object} weights - Object containing weights for each criterion.
   * @returns {number} - Final aggregated score.
   */
  calculateFinalScore: (scores, weights) => {
    let finalScore = 0;
    let totalWeight = 0;

    for (const [criterion, score] of Object.entries(scores)) {
      const weight = weights[criterion] || 1; // Default weight is 1 if not specified
      finalScore += score * weight;
      totalWeight += weight;
    }

    // Normalize final score if weights don't sum to 1
    finalScore = totalWeight ? finalScore / totalWeight : finalScore;
    return finalScore;
  },

  /**
   * Perform the complete scoring process for a product
   * @param {object} productData - Data related to the product.
   * @param {object} datasetStats - Statistics of the dataset (e.g., max values).
   * @param {object} weights - Weights for each scoring criterion.
   * @returns {object} - Detailed score breakdown and final score.
   */
  scoreProduct: (productData, datasetStats, weights) => {
    try {
      const {
        search_volume,
        sales_rank,
        competitor_count,
        shipping_cost,
        return_rate,
        seasonality_variation,
        has_restrictions,
        selling_price,
        product_cost,
        fees,
        supplier_rating,
      } = productData;

      // Calculate individual scores
      const demandScore = this.calculateDemandScore(
        search_volume,
        sales_rank,
        datasetStats.maxSearchVolume,
        datasetStats.maxSalesRank
      );

      const competitionScore = this.calculateCompetitionScore(
        competitor_count,
        datasetStats.maxCompetitorCount
      );

      const profitMarginScore = this.calculateProfitMarginScore(
        selling_price,
        product_cost,
        fees
      );

      const supplierReliabilityScore = this.calculateSupplierReliabilityScore(
        supplier_rating
      );

      const shippingHandlingScore = this.calculateShippingHandlingScore(
        shipping_cost,
        datasetStats.maxShippingCost
      );

      const returnRateScore = this.calculateReturnRateScore(
        return_rate,
        datasetStats.maxReturnRate
      );

      const seasonalityScore = this.calculateSeasonalityScore(
        seasonality_variation,
        datasetStats.maxSeasonalityVariation
      );

      const productRestrictionsScore = this.calculateProductRestrictionsScore(
        has_restrictions
      );

      const scores = {
        demand: demandScore,
        competition: competitionScore,
        profitMargin: profitMarginScore,
        supplierReliability: supplierReliabilityScore,
        shippingHandling: shippingHandlingScore,
        returnRate: returnRateScore,
        seasonality: seasonalityScore,
        productRestrictions: productRestrictionsScore,
      };

      const finalScore = this.calculateFinalScore(scores, weights);

      return { scores, finalScore };
    } catch (error) {
      logger.error(`Error in scoring algorithm: ${error.message}`);
      throw error;
    }
  },
};

module.exports = ScoringAlgorithm;
