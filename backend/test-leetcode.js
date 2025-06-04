// Test script for LeetCode verification
import axios from 'axios';
import leetcodeService from './services/leetcodeService.js';

// Test usernames and problems - using multiple usernames increases chances of finding a valid test case
const TEST_USERNAMES = [
  'siddanth6365',  // First test username
  'leetcode',      // Official LeetCode account
  'jeantimex'      // Active LeetCode user
];

const TEST_PROBLEMS = [
  'two-sum',           // Very common problem, likely solved by many
  'palindrome-number', // Another common problem
  'random-nonexistent-problem-123456' // Should return false
];

const LEETSCAN_API_URL = 'https://leetscan.vercel.app';

async function testDirectApi(username) {
  console.log(`\n==== Testing Direct API Calls for ${username} ====`);
  
  // Test profile fetch
  console.log('\n1. Testing profile fetch:');
  try {
    console.log(`GET ${LEETSCAN_API_URL}/profile with params: { username: ${username} }`);
    const profileResponse = await axios.get(`${LEETSCAN_API_URL}/profile`, {
      params: { username }
    });
    
    const profile = profileResponse.data;
    console.log('✅ Profile fetch successful');
    console.log('Response data:', JSON.stringify(profile, null, 2).substring(0, 500) + '...');
    
    const totalSolved = profile.submitStatsGlobal?.acSubmissionNum.find(stat => stat.difficulty === 'All')?.count || 0;
    console.log(`Total solved problems: ${totalSolved}`);
    return { success: true, totalSolved };
  } catch (error) {
    console.log('❌ Profile fetch failed:', error.message);
    console.log('Error details:', error.response?.data || 'No response data');
    return { success: false, error };
  }
}

async function testSubmissionsApi(username) {
  console.log('\n2. Testing submissions fetch:');
  try {
    console.log(`GET ${LEETSCAN_API_URL}/submissions with params: { username: ${username} }`);
    const submissionsResponse = await axios.get(`${LEETSCAN_API_URL}/submissions`, {
      params: { username }
    });
    
    const submissions = submissionsResponse.data;
    console.log('✅ Submissions fetch successful');
    console.log(`Found ${submissions.length} submissions`);
    
    if (submissions.length > 0) {
      console.log('Sample submission:', JSON.stringify(submissions[0], null, 2));
    }
    return { success: true, submissions };
  } catch (error) {
    console.log('❌ Submissions fetch failed:', error.message);
    console.log('Error details:', error.response?.data || 'No response data');
    return { success: false, error };
  }
}

async function testProblemVerification(username, problems) {
  console.log(`\n3. Testing problem verification for ${username}:`);
  const results = [];
  
  for (const problem of problems) {
    console.log(`\nChecking problem: ${problem}`);
    try {
      console.time(`verify-${problem}`);
      const isSolved = await leetcodeService.hasSolvedProblem(username, problem);
      console.timeEnd(`verify-${problem}`);
      
      console.log(`Problem "${problem}" solved: ${isSolved ? '✅ YES' : '❌ NO'}`);
      results.push({ problem, isSolved });
    } catch (error) {
      console.log(`❌ Error checking problem ${problem}:`, error.message);
      results.push({ problem, error: error.message });
    }
  }
  
  return results;
}

async function testLeetCodeVerification() {
  console.log('=== LeetCode Verification Test ===');
  
  for (const username of TEST_USERNAMES) {
    console.log(`\n\n============================================`);
    console.log(`TESTING WITH USERNAME: ${username}`);
    console.log(`============================================`);
    
    // Test direct API calls
    const profileResult = await testDirectApi(username);
    
    if (profileResult.success && profileResult.totalSolved > 0) {
      // Only test submissions if profile was successful
      const submissionsResult = await testSubmissionsApi(username);
      
      // Test problem verification with our service
      if (submissionsResult.success && submissionsResult.submissions.length > 0) {
        await testProblemVerification(username, TEST_PROBLEMS);
      }
    }
  }
}

// Run the test
testLeetCodeVerification().then(() => {
  console.log('\n\nTest completed');
  process.exit(0);
}).catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
