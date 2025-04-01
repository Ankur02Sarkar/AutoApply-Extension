/**
 * Checks if the current domain is a supported job application site
 * Currently supports Greenhouse and Lever domains
 * 
 * For testing purposes, can be set to accept all domains
 */

// Set this to true for testing on any site
const TESTING_MODE = false;

export const isSupportedDomain = (url: string): boolean => {
  // Allow all domains in testing mode
  if (TESTING_MODE) return true;
  
  if (!url) return false;
  
  // Convert URL to lowercase for case-insensitive matching
  const lowerCaseUrl = url.toLowerCase();
  
  // Check for Greenhouse domains
  const isGreenhouse = 
    lowerCaseUrl.includes('greenhouse.io') || 
    lowerCaseUrl.includes('boards.greenhouse.io');
  
  // Check for Lever domains
  const isLever = 
    lowerCaseUrl.includes('jobs.lever.co') || 
    lowerCaseUrl.includes('lever.co/jobs');
  
  return isGreenhouse || isLever;
}; 