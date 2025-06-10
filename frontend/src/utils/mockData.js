import mockUserData from './mockPortfolioData.json';

/**
 * Get mock data for template previews when user data is incomplete
 * @returns {Object} Complete user data with mock fallbacks
 */
export const getMockUserData = () => {
  return mockUserData;
};


export default {
  getMockUserData
};