// backend/tests/scoring/scoringAlgorithm.test.js

const scoringAlgorithm = require('../../../modules/scoring/services/scoringAlgorithm');
const logger = require('../../../utils/logger');

// Mock logger to suppress logs during tests
jest.mock('../../../utils/logger');

describe('Scoring Algorithm', () => {
    describe('Individual Score Calculations', () => {
        test('calculateDemandScore should correctly calculate the Demand Score', () => {
            const searchVolume = 1500;
            const salesRank = 30;
            const maxSearchVolume = 2000;
            const maxSalesRank = 100;

            const expectedNormalizedSearchVolume = 1500 / 2000; // 0.75
            const expectedNormalizedSalesRank = 1 - (30 / 100); // 0.7
            const expectedDemandScore = (0.75 + 0.7) / 2; // 0.725

            const demandScore = scoringAlgorithm.calculateDemandScore(
                searchVolume,
                salesRank,
                maxSearchVolume,
                maxSalesRank
            );

            expect(demandScore).toBeCloseTo(expectedDemandScore, 5);
        });

        test('calculateCompetitionScore should correctly calculate the Competition Score', () => {
            const competitorCount = 5;
            const maxCompetitorCount = 10;

            const expectedCompetitionScore = 1 - (5 / 10); // 0.5

            const competitionScore = scoringAlgorithm.calculateCompetitionScore(
                competitorCount,
                maxCompetitorCount
            );

            expect(competitionScore).toBeCloseTo(expectedCompetitionScore, 5);
        });

        test('calculateProfitMarginScore should correctly calculate the Profit Margin Score', () => {
            const sellingPrice = 50.00;
            const productCost = 20.00;
            const fees = 5.00;

            const expectedProfitMargin = (50.00 - 20.00 - 5.00) / 50.00; // 0.5

            const profitMarginScore = scoringAlgorithm.calculateProfitMarginScore(
                sellingPrice,
                productCost,
                fees
            );

            expect(profitMarginScore).toBeCloseTo(expectedProfitMargin, 5);
        });

        test('calculateSupplierReliabilityScore should correctly calculate the Supplier Reliability Score', () => {
            const supplierRating = 4.5;

            const expectedSupplierReliabilityScore = 4.5 / 5; // 0.9

            const supplierReliabilityScore = scoringAlgorithm.calculateSupplierReliabilityScore(supplierRating);

            expect(supplierReliabilityScore).toBeCloseTo(expectedSupplierReliabilityScore, 5);
        });

        test('calculateShippingHandlingScore should correctly calculate the Shipping/Handling Score', () => {
            const shippingCost = 5.00;
            const maxShippingCost = 10.00;

            const expectedShippingHandlingScore = 1 - (5.00 / 10.00); // 0.5

            const shippingHandlingScore = scoringAlgorithm.calculateShippingHandlingScore(
                shippingCost,
                maxShippingCost
            );

            expect(shippingHandlingScore).toBeCloseTo(expectedShippingHandlingScore, 5);
        });

        test('calculateReturnRateScore should correctly calculate the Return Rate Score', () => {
            const returnRate = 0.02;
            const maxReturnRate = 0.05;

            const expectedReturnRateScore = 1 - (0.02 / 0.05); // 0.6

            const returnRateScore = scoringAlgorithm.calculateReturnRateScore(
                returnRate,
                maxReturnRate
            );

            expect(returnRateScore).toBeCloseTo(expectedReturnRateScore, 5);
        });

        test('calculateSeasonalityScore should correctly calculate the Seasonality Score', () => {
            const seasonalityVariation = 0.15;
            const maxSeasonalityVariation = 0.2;

            const expectedSeasonalityScore = 1 - (0.15 / 0.2); // 0.25

            const seasonalityScore = scoringAlgorithm.calculateSeasonalityScore(
                seasonalityVariation,
                maxSeasonalityVariation
            );

            expect(seasonalityScore).toBeCloseTo(expectedSeasonalityScore, 5);
        });

        test('calculateProductRestrictionsScore should return 1 if no restrictions', () => {
            const hasRestrictions = false;

            const expectedScore = 1;

            const score = scoringAlgorithm.calculateProductRestrictionsScore(hasRestrictions);

            expect(score).toBe(expectedScore);
        });

        test('calculateProductRestrictionsScore should return 0 if there are restrictions', () => {
            const hasRestrictions = true;

            const expectedScore = 0;

            const score = scoringAlgorithm.calculateProductRestrictionsScore(hasRestrictions);

            expect(score).toBe(expectedScore);
        });
    });

    describe('Final Score Calculation', () => {
        test('calculateFinalScore should correctly calculate the Final Score with weighted criteria', () => {
            const scores = {
                demand: 0.8,
                competition: 0.6,
                profitMargin: 0.5,
                supplierReliability: 0.9,
                shippingHandling: 0.7,
                returnRate: 0.6,
                seasonality: 0.4,
                productRestrictions: 1,
            };

            const weights = {
                demand: 2,
                competition: 1.5,
                profitMargin: 2,
                supplierReliability: 1,
                shippingHandling: 1,
                returnRate: 1,
                seasonality: 0.5,
                productRestrictions: 1,
            };

            // Calculate expected final score
            const weightedSum =
                (0.8 * 2) +
                (0.6 * 1.5) +
                (0.5 * 2) +
                (0.9 * 1) +
                (0.7 * 1) +
                (0.6 * 1) +
                (0.4 * 0.5) +
                (1 * 1); // = 1.6 + 0.9 + 1 + 0.9 + 0.7 + 0.6 + 0.2 + 1 = 6.0

            const totalWeight = 2 + 1.5 + 2 + 1 + 1 + 1 + 0.5 + 1; // = 10

            const expectedFinalScore = weightedSum / totalWeight; // 6 / 10 = 0.6

            const finalScore = scoringAlgorithm.calculateFinalScore(scores, weights);

            expect(finalScore).toBeCloseTo(expectedFinalScore, 5);
        });

        test('calculateFinalScore should handle missing weights by assigning default weight of 1', () => {
            const scores = {
                demand: 0.8,
                competition: 0.6,
                profitMargin: 0.5,
            };

            const weights = {
                demand: 2,
                competition: 1.5,
                // profitMargin weight is missing, should default to 1
            };

            const weightedSum =
                (0.8 * 2) +
                (0.6 * 1.5) +
                (0.5 * 1); // = 1.6 + 0.9 + 0.5 = 3

            const totalWeight = 2 + 1.5 + 1; // = 4.5

            const expectedFinalScore = weightedSum / totalWeight; // 3 / 4.5 = 0.666...

            const finalScore = scoringAlgorithm.calculateFinalScore(scores, weights);

            expect(finalScore).toBeCloseTo(0.6666667, 5);
        });

        test('calculateFinalScore should return 0 if totalWeight is 0', () => {
            const scores = {
                demand: 0.8,
            };

            const weights = {
                demand: 0,
            };

            const expectedFinalScore = 0;

            const finalScore = scoringAlgorithm.calculateFinalScore(scores, weights);

            expect(finalScore).toBe(expectedFinalScore);
        });
    });

    describe('scoreProduct', () => {
        test('should perform complete scoring process and return scores and finalScore', () => {
            const productData = {
                search_volume: 1500,
                sales_rank: 30,
                competitor_count: 5,
                shipping_cost: 5.00,
                return_rate: 0.02,
                seasonality_variation: 0.15,
                has_restrictions: false,
                selling_price: 50.00,
                product_cost: 20.00,
                fees: 5.00,
                supplier_rating: 4.5,
            };

            const datasetStats = {
                maxSearchVolume: 2000,
                maxSalesRank: 100,
                maxCompetitorCount: 10,
                maxShippingCost: 10.00,
                maxReturnRate: 0.05,
                maxSeasonalityVariation: 0.2,
            };

            const weights = {
                demand: 2,
                competition: 1.5,
                profitMargin: 2,
                supplierReliability: 1,
                shippingHandling: 1,
                returnRate: 1,
                seasonality: 0.5,
                productRestrictions: 1,
            };

            const expectedScores = {
                demand: (1500 / 2000 + (1 - (30 / 100))) / 2, // (0.75 + 0.7) / 2 = 0.725
                competition: 1 - (5 / 10), // 0.5
                profitMargin: (50 - 20 - 5) / 50, // 0.5
                supplierReliability: 4.5 / 5, // 0.9
                shippingHandling: 1 - (5 / 10), // 0.5
                returnRate: 1 - (0.02 / 0.05), // 0.6
                seasonality: 1 - (0.15 / 0.2), // 0.25
                productRestrictions: 1, // No restrictions
            };

            const weightedSum =
                (expectedScores.demand * weights.demand) +
                (expectedScores.competition * weights.competition) +
                (expectedScores.profitMargin * weights.profitMargin) +
                (expectedScores.supplierReliability * weights.supplierReliability) +
                (expectedScores.shippingHandling * weights.shippingHandling) +
                (expectedScores.returnRate * weights.returnRate) +
                (expectedScores.seasonality * weights.seasonality) +
                (expectedScores.productRestrictions * weights.productRestrictions); // 0.725*2 + 0.5*1.5 + 0.5*2 + 0.9*1 + 0.5*1 + 0.6*1 + 0.25*0.5 + 1*1 = 1.45 + 0.75 + 1 + 0.9 + 0.5 + 0.6 + 0.125 + 1 = 6.325

            const totalWeight = Object.values(weights).reduce((acc, curr) => acc + curr, 0); // 10

            const expectedFinalScore = weightedSum / totalWeight; // 6.325 / 10 = 0.6325

            const result = scoringAlgorithm.scoreProduct(productData, datasetStats, weights);

            expect(result).toEqual({
                scores: expectedScores,
                finalScore: expectedFinalScore,
            });
        });

        test('scoreProduct should handle missing max values gracefully', () => {
            const productData = {
                search_volume: 1500,
                sales_rank: 30,
                competitor_count: 5,
                shipping_cost: 5.00,
                return_rate: 0.02,
                seasonality_variation: 0.15,
                has_restrictions: false,
                selling_price: 50.00,
                product_cost: 20.00,
                fees: 5.00,
                supplier_rating: 4.5,
            };

            const datasetStats = {
                // Missing maxSearchVolume, maxSalesRank, etc.
            };

            const weights = {
                demand: 2,
                competition: 1.5,
                profitMargin: 2,
                supplierReliability: 1,
                shippingHandling: 1,
                returnRate: 1,
                seasonality: 0.5,
                productRestrictions: 1,
            };

            const expectedScores = {
                demand: (0 / undefined + (1 - (30 / undefined))) / 2, // NaN
                competition: 1 - (5 / undefined), // NaN
                profitMargin: (50 - 20 - 5) / 50, // 0.5
                supplierReliability: 4.5 / 5, // 0.9
                shippingHandling: 1 - (5 / undefined), // NaN
                returnRate: 1 - (0.02 / undefined), // NaN
                seasonality: 1 - (0.15 / undefined), // NaN
                productRestrictions: 1, // No restrictions
            };

            // Expected scores with undefined max values would be NaN except for those not dependent on max values
            // However, the implementation should handle undefined max values, possibly setting normalized scores to 0

            // Adjusted expectedScores based on implementation handling undefined
            const adjustedExpectedScores = {
                demand: 0, // Since maxSearchVolume is undefined
                competition: 0, // Since maxCompetitorCount is undefined
                profitMargin: 0.5,
                supplierReliability: 0.9,
                shippingHandling: 0, // Since maxShippingCost is undefined
                returnRate: 0, // Since maxReturnRate is undefined
                seasonality: 0, // Since maxSeasonalityVariation is undefined
                productRestrictions: 1,
            };

            const weightedSum =
                (adjustedExpectedScores.demand * weights.demand) +
                (adjustedExpectedScores.competition * weights.competition) +
                (adjustedExpectedScores.profitMargin * weights.profitMargin) +
                (adjustedExpectedScores.supplierReliability * weights.supplierReliability) +
                (adjustedExpectedScores.shippingHandling * weights.shippingHandling) +
                (adjustedExpectedScores.returnRate * weights.returnRate) +
                (adjustedExpectedScores.seasonality * weights.seasonality) +
                (adjustedExpectedScores.productRestrictions * weights.productRestrictions); // 0 + 0 + 1 + 0.9 + 0 + 0 + 0 + 1 = 2.9

            const totalWeight = Object.values(weights).reduce((acc, curr) => acc + curr, 0); // 10

            const expectedFinalScore = weightedSum / totalWeight; // 2.9 / 10 = 0.29

            const result = scoringAlgorithm.scoreProduct(productData, datasetStats, weights);

            expect(result).toEqual({
                scores: adjustedExpectedScores,
                finalScore: expectedFinalScore,
            });
        });

        test('scoreProduct should handle errors gracefully', () => {
            const productData = null; // Invalid product data
            const datasetStats = {};
            const weights = {};

            // Modify the scoringAlgorithm to throw an error when productData is invalid
            // Assuming it checks for required fields and throws an error if missing

            expect(() => scoringAlgorithm.scoreProduct(productData, datasetStats, weights)).toThrow();
            expect(logger.error).toHaveBeenCalled();
        });
    });
});
