function isAnagram(s, t) {
    if (s.length !== t.length) {
        return false;
    }

    const charCount = {};

    for (let i = 0; i < s.length; i++) {
        charCount[s[i]] = (charCount[s[i]] || 0) + 1;
        charCount[t[i]] = (charCount[t[i]] || 0) - 1;
    }

    for (let char in charCount) {
        if (charCount[char] !== 0) {
            return false;
        }
    }

    return true;
}

const input = '"anagram", "nagaram"'; // This is tc.input from the DB
// The wrapper does:
const wrappedCode = `
try {
  const result = isAnagram(${input});
  if (Array.isArray(result)) {
    console.log("[" + result.join(", ") + "]");
  } else if (typeof result === "object" && result !== null) {
    console.log(JSON.stringify(result).replace(/,/g, ", "));
  } else {
    console.log(result);
  }
} catch (e) {
  console.log(e.toString());
}`;

console.log("EXECUTING WRAPPED CODE:");
eval(wrappedCode);
