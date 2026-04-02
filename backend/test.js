const axios = require('axios');
const code = `function isAnagram(s, t) {
  // If lengths differ, they can't be anagrams
  if (s.length !== t.length) {
    return false;
  }
  
  const charCount = {};
  
  // Track frequency. +1 for elements in s, -1 for elements in t.
  for (let i = 0; i < s.length; i++) {
    charCount[s[i]] = (charCount[s[i]] || 0) + 1;
    charCount[t[i]] = (charCount[t[i]] || 0) - 1;
  }
  
  // If all characters perfectly cancel out, the map values will all be 0
  for (let char in charCount) {
    if (charCount[char] !== 0) {
      return false;
    }
  }
  
  return true;
}`;

axios.post('http://localhost:5000/api/submissions/evaluate', {
    userId: 'test',
    questionId: '11',
    submittedCode: code
}).then(res => console.log(JSON.stringify(res.data, null, 2))).catch(e => console.error(e.response ? e.response.data : e.message));
