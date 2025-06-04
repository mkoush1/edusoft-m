import axios from 'axios';
// Using the built-in Node.js crypto module
import * as crypto from 'crypto';
import { LeetCode } from 'leetcode-query';

// LeetCode GraphQL API endpoint
const LEETCODE_API_URL = 'https://leetcode.com/graphql';
// LeetScan API endpoints
const LEETSCAN_API_BASE = 'https://leetscan.vercel.app/api';

/**
 * Service to interact with LeetCode API
 */
class LeetCodeService {
  /**
   * Check if a LeetCode username exists
   * @param {string} username - LeetCode username to check
   * @returns {Promise<boolean>} - True if the username exists, false otherwise
   */
  async checkUsernameExists(username) {
    try {
      console.log(`Checking if LeetCode username '${username}' exists...`);
      
      // First try using LeetScan API
      try {
        const leetScanResponse = await axios.get(`${LEETSCAN_API_BASE}/user`, {
          params: { username },
          timeout: 5000 // 5 second timeout
        });
        
        // If we get a valid response with the username, the user exists
        if (leetScanResponse.data && leetScanResponse.data.username) {
          console.log(`Username '${username}' exists according to LeetScan API`);
          return true;
        }
      } catch (leetScanError) {
        console.log('LeetScan API failed, falling back to LeetCode GraphQL API', leetScanError.message);
      }
      
      // Fallback to LeetCode's GraphQL API
      const query = `
        query userPublicProfile($username: String!) {
          matchedUser(username: $username) {
            username
          }
        }
      `;

      const response = await axios.post(LEETCODE_API_URL, {
        query,
        variables: { username }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000 // 5 second timeout
      });

      // Check if we got a valid user response
      const userExists = response.data && 
                        response.data.data && 
                        response.data.data.matchedUser && 
                        response.data.data.matchedUser.username;
      
      console.log(`Username '${username}' exists: ${userExists}`);
      return userExists;
    } catch (error) {
      console.error(`Error checking if username '${username}' exists:`, error.message);
      return false; // Assume username doesn't exist if there's an error
    }
  }

  /**
   * Get user profile information
   * @param {string} username - LeetCode username
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(username) {
    try {
      console.log(`Fetching LeetCode profile for ${username}...`);
      
      // First try using LeetScan API as it's more reliable
      try {
        const leetScanResponse = await axios.get(`${LEETSCAN_API_BASE}/user`, {
          params: { username },
          timeout: 5000 // 5 second timeout
        });
        console.log('LeetScan API response:', leetScanResponse.data);
        
        // Check if we got a valid user response
        if (leetScanResponse.data && leetScanResponse.data.username) {
          return leetScanResponse.data;
        } else {
          console.log(`No valid user data found for '${username}' in LeetScan API response`);
        }
      } catch (leetScanError) {
        console.log('LeetScan API failed, falling back to LeetCode GraphQL API', leetScanError.message);
      }
      
      // Fallback to LeetCode's GraphQL API
      const query = `
        query userPublicProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              aboutMe
              userAvatar
              ranking
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
            }
          }
        }
      `;

      const response = await axios.post(LEETCODE_API_URL, {
        query,
        variables: { username }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000 // 5 second timeout
      });

      // Check if we got a valid user response
      if (response.data && 
          response.data.data && 
          response.data.data.matchedUser) {
        return response.data.data.matchedUser;
      } else {
        console.log(`No valid user data found for '${username}' in LeetCode GraphQL API response`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching LeetCode user profile:', error.message);
      return null; // Return null instead of throwing
    }
  }

  /**
   * Get user's recent submissions
   * @param {string} username - LeetCode username
   * @returns {Promise<Array>} Recent submissions
   */
  async getRecentSubmissions(username) {
    try {
      const query = `
        query recentSubmissions($username: String!) {
          recentSubmissionList(username: $username, limit: 20) {
            id
            title
            titleSlug
            status
            statusDisplay
            lang
            timestamp
            url
            isPending
            memory
            runtime
          }
        }
      `;

      const response = await axios.post(LEETCODE_API_URL, {
        query,
        variables: { username }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      return response.data.data.recentSubmissionList;
    } catch (error) {
      console.error('Error fetching LeetCode recent submissions:', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Check if a user has solved a specific problem on LeetCode
   * @param {string} username - LeetCode username
   * @param {string} problemSlug - Problem title slug (e.g., 'two-sum')
   * @returns {Promise<boolean>} - True if the problem is solved, false otherwise
   */
  async hasSolvedProblem(username, problemSlug) {
    try {
      const leetcode = new LeetCode();
      // Use the user() method to get recent submissions
      const user = await leetcode.user(username);
      console.log('[DEBUG] leetcode.user() result:', user);
      // Check both recentSubmissionList and recentAcceptedSubmissionList
      const allSubs = [
        ...(user?.recentSubmissionList || []),
        ...(user?.recentAcceptedSubmissionList || [])
      ];
      if (!Array.isArray(allSubs) || allSubs.length === 0) {
        console.log('No recent submissions found in user profile');
        return false;
      }
      // Check if any accepted submission matches the problem slug
      const solved = allSubs.some(sub => sub.titleSlug === problemSlug && sub.statusDisplay === 'Accepted');
      console.log(`[leetcode-query] User ${username} solved ${problemSlug}?`, solved);
      return solved;
    } catch (error) {
      console.error('Error using leetcode-query user():', error);
      return false;
    }
  }

  /**
   * Verify a LeetCode account by checking if the verification code is in the user's bio
   * @param {string} username - LeetCode username
   * @param {string} verificationCode - The verification code to check for
   * @returns {Promise<boolean>} - True if verified, false otherwise
   */
  async verifyAccountByBio(username, verificationCode) {
    try {
      console.log(`Verifying LeetCode account for ${username} with code ${verificationCode}...`);
      
      // Validation
      if (!username || !verificationCode) {
        console.log('Missing username or verification code');
        return false;
      }

      // First verify that the username exists
      const usernameExists = await this.checkUsernameExists(username);
      if (!usernameExists) {
        console.log(`Username ${username} does not exist on LeetCode`);
        return false;
      }

      // Make sure we're working with a valid verification code format
      if (!verificationCode.startsWith('edusoft-') || verificationCode.length < 12) {
        console.log(`Invalid verification code format: ${verificationCode}`);
        return false;
      }
      
      // Try to get the user profile
      const userProfile = await this.getUserProfile(username);
      
      if (!userProfile) {
        console.log(`User profile not found for ${username}`);
        return false;
      }

      // Check if the profile has the necessary fields
      if (!userProfile.profile) {
        console.log(`User profile data structure is invalid for ${username}`);
        return false;
      }
      
      // Check if the verification code is in the user's bio
      const aboutMe = userProfile.profile?.aboutMe || '';
      console.log(`User bio: ${aboutMe}`);
      
      // Check for exact match of the verification code (case sensitive)
      if (aboutMe.includes(verificationCode)) {
        console.log(`Found exact verification code in bio`);
        return true;
      }
      
      // Also check other profile fields
      const realName = userProfile.profile?.realName || '';
      console.log(`User real name: ${realName}`);
      
      if (realName.includes(verificationCode)) {
        console.log(`Found verification code in real name`);
        return true;
      }

      // Check for any other fields that might contain the verification code
      const profileFields = userProfile.profile;
      for (const field in profileFields) {
        if (typeof profileFields[field] === 'string' && profileFields[field].includes(verificationCode)) {
          console.log(`Found verification code in profile field: ${field}`);
          return true;
        }
      }
      
      console.log(`Verification failed for ${username} - code not found in any profile fields`);
      return false;
    } catch (error) {
      console.error(`Error verifying LeetCode account for ${username}:`, error.message);
      return false;
    }
  }

  /**
   * Generate a random verification code
   * @returns {string} A random verification code
   */
  generateVerificationCode() {
    return `edusoft-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Get a list of easy problems for assessment
   * @returns {Promise<Array>} List of easy problems
   */
  async getEasyProblems() {
    try {
      console.log('Fetching easy problems from LeetCode API...');
      const query = `
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
          ) {
            total: totalNum
            questions: data {
              questionId
              questionFrontendId
              title
              titleSlug
              difficulty
              acRate
              topicTags {
                name
                slug
              }
            }
          }
        }
      `;

      const variables = {
        categorySlug: "",
        skip: 0,
        limit: 15,
        filters: { difficulty: "EASY" }
      };

      const response = await axios.post(LEETCODE_API_URL, {
        query,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000 // 5 second timeout
      });

      if (response.data && response.data.data && response.data.data.problemsetQuestionList && 
          Array.isArray(response.data.data.problemsetQuestionList.questions)) {
        console.log(`Successfully fetched ${response.data.data.problemsetQuestionList.questions.length} problems from LeetCode API`);
        return response.data.data.problemsetQuestionList.questions;
      } else {
        console.log('Invalid response format from LeetCode API, using fallback problems');
        return [];
      }
    } catch (error) {
      console.error('Error fetching easy problems:', error.message);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Select random problems for assessment
   * @param {number} count - Number of problems to select
   * @returns {Promise<Array>} Selected problems
   */
  async selectRandomProblems(count = 3) {
    try {
      console.log(`Selecting ${count} random problems for assessment...`);
      
      // Common well-known LeetCode problems that are guaranteed to exist
      const commonProblems = [
        {
          questionId: '13',
          questionFrontendId: '13',
          title: 'Roman to Integer',
          titleSlug: 'roman-to-integer',
          difficulty: 'EASY'
        },
        {
          questionId: '9',
          questionFrontendId: '9',
          title: 'Palindrome Number',
          titleSlug: 'palindrome-number',
          difficulty: 'EASY'
        },
        {
          questionId: '66',
          questionFrontendId: '66',
          title: 'Plus One',
          titleSlug: 'plus-one',
          difficulty: 'EASY'
        },
        {
          questionId: '1',
          questionFrontendId: '1',
          title: 'Two Sum',
          titleSlug: 'two-sum',
          difficulty: 'EASY'
        },
        {
          questionId: '20',
          questionFrontendId: '20',
          title: 'Valid Parentheses',
          titleSlug: 'valid-parentheses',
          difficulty: 'EASY'
        },
        {
          questionId: '21',
          questionFrontendId: '21',
          title: 'Merge Two Sorted Lists',
          titleSlug: 'merge-two-sorted-lists',
          difficulty: 'EASY'
        }
      ];
      
      // Always ensure we have enough problems to return
      if (count > commonProblems.length) {
        count = commonProblems.length;
        console.log(`Adjusted count to ${count} due to available problems`);
      }
      
      // Try to get problems from API first
      let apiProblems = [];
      try {
        apiProblems = await this.getEasyProblems();
        console.log(`Retrieved ${apiProblems.length} problems from API`);
      } catch (apiError) {
        console.error('Error fetching problems from API:', apiError.message);
      }
      
      // If we got enough problems from the API, use those
      if (apiProblems && apiProblems.length >= count) {
        console.log('Using problems from LeetCode API');
        const shuffled = [...apiProblems].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      }
      
      // Otherwise, use our common problems
      console.log('Using fallback common problems');
      const shuffled = [...commonProblems].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Error selecting random problems:', error.message);
      // Instead of throwing, return a subset of common problems as a last resort
      const fallbackProblems = [
        {
          questionId: '1',
          questionFrontendId: '1',
          title: 'Two Sum',
          titleSlug: 'two-sum',
          difficulty: 'EASY'
        },
        {
          questionId: '9',
          questionFrontendId: '9',
          title: 'Palindrome Number',
          titleSlug: 'palindrome-number',
          difficulty: 'EASY'
        },
        {
          questionId: '13',
          questionFrontendId: '13',
          title: 'Roman to Integer',
          titleSlug: 'roman-to-integer',
          difficulty: 'EASY'
        }
      ];
      console.log('Returning fallback problems due to error');
      return fallbackProblems.slice(0, count);
    }
  }
}

// Export a singleton instance
const leetcodeService = new LeetCodeService();
export default leetcodeService;
