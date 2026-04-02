const db = require('./db');
const crypto = require('crypto');

const questions = [
  {
    id: "1",
    title: "Fix the Array Reversal",
    description: "The following function is supposed to reverse an array in-place, but it has a bug. Find and fix it.\n\nThe function should modify the original array and return it reversed.",
    type: "debugging",
    difficulty: "easy",
    starterCode: `function reverseArray(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    let temp = arr[i];\n    arr[i] = arr[arr.length - i];\n    arr[arr.length - i] = temp;\n  }\n  return arr;\n}`,
    starterCodePython: `def reverse_array(arr):\n    for i in range(len(arr)):\n        temp = arr[i]\n        arr[i] = arr[len(arr) - i]\n        arr[len(arr) - i] = temp\n    return arr`,
    starterCodeJava: `class Solution {\n    public static int[] reverseArray(int[] arr) {\n        for (int i = 0; i < arr.length; i++) {\n            int temp = arr[i];\n            arr[i] = arr[arr.length - i];\n            arr[arr.length - i] = temp;\n        }\n        return arr;\n    }\n}`,
    functionName: "reverseArray",
    testCases: [
      { id: "1a", input: "[1, 2, 3, 4, 5]", expectedOutput: "[5, 4, 3, 2, 1]" },
      { id: "1b", input: "[10, 20]", expectedOutput: "[20, 10]" },
    ],
    hints: ["Check the index calculation — is `arr.length - i` correct?", "Should the loop run through the entire array?"],
  },
  {
    id: "2",
    title: "Binary Search Implementation",
    description: "Implement a binary search algorithm that returns the index of a target value in a sorted array. Return -1 if the target is not found.",
    type: "dsa",
    difficulty: "medium",
    starterCode: `function binarySearch(arr, target) {\n  // Your implementation here\n  \n}`,
    starterCodePython: `def binary_search(arr, target):\n    # Your implementation here\n    pass`,
    starterCodeJava: `class Solution {\n    public static int binarySearch(int[] arr, int target) {\n        // Your implementation here\n        return -1;\n    }\n}`,
    functionName: "binarySearch",
    testCases: [
      { id: "2a", input: "[1, 3, 5, 7, 9], 5", expectedOutput: "2" },
      { id: "2b", input: "[2, 4, 6, 8], 3", expectedOutput: "-1" },
      { id: "2c", input: "[1], 1", expectedOutput: "0" },
    ],
  },
  {
    id: "3",
    title: "What Does This Print?",
    description: "Predict the output of the following JavaScript code. Consider variable hoisting, closures, and the event loop.",
    type: "output-prediction",
    difficulty: "medium",
    starterCode: `for (var i = 0; i < 3; i++) {\n  setTimeout(function() {\n    console.log(i);\n  }, 100);\n}\n// What will be printed?\n// Write your answer as the output:`,
    starterCodePython: null,
    starterCodeJava: null,
    testCases: [
      { id: "3a", input: "", expectedOutput: "3\n3\n3" },
    ],
    hints: ["Think about `var` vs `let` scoping", "When does the setTimeout callback execute?"],
  },
  {
    id: "4",
    title: "Complete the Linked List",
    description: "Complete the `insertAtEnd` method for the singly linked list. The method should add a new node with the given value at the end of the list.",
    type: "code-completion",
    difficulty: "easy",
    starterCode: `class Node {\n  constructor(value) {\n    this.value = value;\n    this.next = null;\n  }\n}\n\nclass LinkedList {\n  constructor() {\n    this.head = null;\n  }\n\n  insertAtEnd(value) {\n    // Complete this method\n    \n  }\n}`,
    starterCodePython: null,
    starterCodeJava: null,
    testCases: [
      { id: "4a", input: "insert 1, 2, 3", expectedOutput: "1 -> 2 -> 3" },
    ],
  },
  {
    id: "5",
    title: "Spot the Edge Cases",
    description: "The following function calculates the average of numbers in an array. Identify and handle all edge cases that could cause it to fail or produce incorrect results.",
    type: "edge-case",
    difficulty: "hard",
    starterCode: `function calculateAverage(numbers) {\n  let sum = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    sum += numbers[i];\n  }\n  return sum / numbers.length;\n}\n\n// Fix this function to handle all edge cases`,
    starterCodePython: `def calculate_average(numbers):\n    total = 0\n    for i in range(len(numbers)):\n        total += numbers[i]\n    return total / len(numbers)\n\n# Fix this function to handle all edge cases`,
    starterCodeJava: `class Solution {\n    public static double calculateAverage(int[] numbers) {\n        int sum = 0;\n        for (int i = 0; i < numbers.length; i++) {\n            sum += numbers[i];\n        }\n        return (double) sum / numbers.length;\n    }\n}\n\n// Fix this method to handle all edge cases`,
    functionName: "calculateAverage",
    testCases: [
      { id: "5a", input: "[]", expectedOutput: "0" },
      { id: "5b", input: "[1, 2, 3]", expectedOutput: "2" },
      { id: "5c", input: "null", expectedOutput: "0" },
    ],
    hints: ["What happens with an empty array?", "What if the input is null or undefined?", "What about non-numeric values in the array?"],
  },
  {
    id: "6",
    title: "Debug the Fibonacci",
    description: "This recursive Fibonacci function runs extremely slowly for large inputs and has an off-by-one error. Fix both issues.",
    type: "debugging",
    difficulty: "hard",
    starterCode: `function fibonacci(n) {\n  if (n == 0) return 1;\n  if (n == 1) return 1;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`,
    starterCodePython: `def fibonacci(n):\n    if n == 0:\n        return 1\n    if n == 1:\n        return 1\n    return fibonacci(n - 1) + fibonacci(n - 2)`,
    starterCodeJava: `class Solution {\n    public static int fibonacci(int n) {\n        if (n == 0) return 1;\n        if (n == 1) return 1;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n}`,
    functionName: "fibonacci",
    testCases: [
      { id: "6a", input: "0", expectedOutput: "0" },
      { id: "6b", input: "5", expectedOutput: "5" },
      { id: "6c", input: "10", expectedOutput: "55" },
    ],
  },
  {
    id: "7",
    title: "Stack Implementation",
    description: "Implement a Stack class with push, pop, peek, and isEmpty methods using an array.",
    type: "dsa",
    difficulty: "easy",
    starterCode: `class Stack {\n  constructor() {\n    // Initialize\n  }\n\n  push(element) {\n    // Add element\n  }\n\n  pop() {\n    // Remove and return top\n  }\n\n  peek() {\n    // Return top without removing\n  }\n\n  isEmpty() {\n    // Check if empty\n  }\n}`,
    starterCodePython: null,
    starterCodeJava: null,
    testCases: [
      { id: "7a", input: "push(1), push(2), peek()", expectedOutput: "2" },
      { id: "7b", input: "push(1), pop(), isEmpty()", expectedOutput: "true" },
    ],
  },
  {
    id: "8",
    title: "Predict the Prototype Chain",
    description: "What will each console.log statement output? Think carefully about prototypal inheritance in JavaScript.",
    type: "output-prediction",
    difficulty: "hard",
    starterCode: `function Animal(name) {\n  this.name = name;\n}\nAnimal.prototype.speak = function() {\n  return this.name + ' makes a sound';\n};\n\nfunction Dog(name) {\n  Animal.call(this, name);\n}\nDog.prototype = Object.create(Animal.prototype);\n\nconst dog = new Dog('Rex');\nconsole.log(dog.speak());\nconsole.log(dog instanceof Animal);\nconsole.log(dog.constructor === Dog);`,
    starterCodePython: null,
    starterCodeJava: null,
    testCases: [
      { id: "8a", input: "", expectedOutput: "Rex makes a sound\ntrue\nfalse" },
    ],
  },
  {
    id: "9",
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    type: "dsa",
    difficulty: "easy",
    starterCode: `function twoSum(nums, target) {\n  // Your code here\n  \n}`,
    starterCodePython: `def two_sum(nums, target):\n    # Your code here\n    pass`,
    starterCodeJava: `class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}`,
    functionName: "twoSum",
    testCases: [
      { id: "9a", input: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]" },
      { id: "9b", input: "[3, 2, 4], 6", expectedOutput: "[1, 2]" },
      { id: "9c", input: "[3, 3], 6", expectedOutput: "[0, 1]" }
    ],
    hints: ["A brute force approach uses two nested loops, but can you do it in one pass using a Hash Map?"]
  },
  {
    id: "10",
    title: "Valid Parentheses",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
    type: "dsa",
    difficulty: "medium",
    starterCode: `function isValid(s) {\n  // Your code here\n  \n}`,
    starterCodePython: `def is_valid(s):\n    # Your code here\n    pass`,
    starterCodeJava: `class Solution {\n    public static boolean isValid(String s) {\n        // Your code here\n        return false;\n    }\n}`,
    functionName: "isValid",
    testCases: [
      { id: "10a", input: "\"()\"", expectedOutput: "true" },
      { id: "10b", input: "\"()[]{}\"", expectedOutput: "true" },
      { id: "10c", input: "\"(]\"", expectedOutput: "false" }
    ],
    hints: ["Try using a Stack data structure."]
  },
  {
    id: "11",
    title: "Fix the Anagram Checker",
    description: "The following function is supposed to check if two strings are anagrams of each other (contain the exact same letters in different orders). It has a logical flaw when handling strings of different lengths or similar characters. Find and fix it.",
    type: "debugging",
    difficulty: "easy",
    starterCode: `function isAnagram(s, t) {\n  let matched = 0;\n  for (let i = 0; i < s.length; i++) {\n    if (t.includes(s[i])) {\n      matched++;\n    }\n  }\n  return matched === s.length;\n}`,
    starterCodePython: `def is_anagram(s, t):\n    matched = 0\n    for i in range(len(s)):\n        if s[i] in t:\n            matched += 1\n    return matched == len(s)`,
    starterCodeJava: `class Solution {\n    public static boolean isAnagram(String s, String t) {\n        int matched = 0;\n        for (int i = 0; i < s.length(); i++) {\n            if (t.indexOf(s.charAt(i)) >= 0) {\n                matched++;\n            }\n        }\n        return matched == s.length();\n    }\n}`,
    functionName: "isAnagram",
    testCases: [
      { id: "11a", input: "\"anagram\", \"nagaram\"", expectedOutput: "true" },
      { id: "11b", input: "\"rat\", \"car\"", expectedOutput: "false" },
      { id: "11c", input: "\"aacc\", \"ccac\"", expectedOutput: "false" }
    ],
    hints: ["What happens if `s` has duplicate characters, but `t` doesn't?", "Can you use a frequency map or sort the strings?"]
  },
  {
    id: "12",
    title: "Promises Prediction",
    description: "Predict the output of the following asynchronous JavaScript code. Pay attention to Microtasks (Promises) vs Macrotasks (setTimeout).",
    type: "output-prediction",
    difficulty: "hard",
    starterCode: `console.log('1');\n\nsetTimeout(() => {\n  console.log('2');\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log('3');\n}).then(() => {\n  console.log('4');\n});\n\nconsole.log('5');\n\n// Write the output separated by newlines:`,
    starterCodePython: null,
    starterCodeJava: null,
    testCases: [
      { id: "12a", input: "", expectedOutput: "1\n5\n3\n4\n2" },
    ],
    hints: ["Synchronous code runs first.", "Microtasks (Promises) take priority over Macrotasks (setTimeout) in the event loop hook."]
  }
];

async function seed() {
  try {
    console.log('Seeding Database...');
    // Clear existing to avoid duplicates in seed
    await db.query('DELETE FROM test_cases');
    await db.query('DELETE FROM submissions');
    await db.query('DELETE FROM questions');

    for (const q of questions) {
      await db.query(`
                INSERT INTO questions (id, title, description, type, difficulty, starter_code, starter_code_python, starter_code_java, function_name, hints) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
        q.id, q.title, q.description, q.type, q.difficulty, q.starterCode,
        q.starterCodePython || null, q.starterCodeJava || null,
        q.functionName || null,
        q.hints ? JSON.stringify(q.hints) : null
      ]);

      for (const t of q.testCases) {
        await db.query(`
                    INSERT INTO test_cases (id, question_id, input, expected_output) 
                    VALUES (?, ?, ?, ?)
                `, [t.id, q.id, t.input, t.expectedOutput]);
      }
    }
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
