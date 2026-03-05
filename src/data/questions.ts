export type QuestionType = "debugging" | "dsa" | "output-prediction" | "code-completion" | "edge-case";
export type Difficulty = "easy" | "medium" | "hard";

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  type: QuestionType;
  difficulty: Difficulty;
  starterCode: string;
  testCases: TestCase[];
  hints?: string[];
}

export const questionTypeLabels: Record<QuestionType, string> = {
  debugging: "Debugging",
  dsa: "DSA",
  "output-prediction": "Output Prediction",
  "code-completion": "Code Completion",
  "edge-case": "Edge Case Detection",
};

export const questionTypeColors: Record<QuestionType, string> = {
  debugging: "neon-red",
  dsa: "neon-blue",
  "output-prediction": "neon-orange",
  "code-completion": "neon-green",
  "edge-case": "neon-purple",
};

export const questions: Question[] = [
  {
    id: "1",
    title: "Fix the Array Reversal",
    description: "The following function is supposed to reverse an array in-place, but it has a bug. Find and fix it.\n\nThe function should modify the original array and return it reversed.",
    type: "debugging",
    difficulty: "easy",
    starterCode: `function reverseArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    let temp = arr[i];
    arr[i] = arr[arr.length - i];
    arr[arr.length - i] = temp;
  }
  return arr;
}`,
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
    starterCode: `function binarySearch(arr, target) {
  // Your implementation here
  
}`,
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
    starterCode: `for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);
  }, 100);
}
// What will be printed?
// Write your answer as the output:`,
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
    starterCode: `class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertAtEnd(value) {
    // Complete this method
    
  }
}`,
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
    starterCode: `function calculateAverage(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum / numbers.length;
}

// Fix this function to handle all edge cases`,
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
    starterCode: `function fibonacci(n) {
  if (n == 0) return 1;
  if (n == 1) return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
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
    starterCode: `class Stack {
  constructor() {
    // Initialize
  }

  push(element) {
    // Add element
  }

  pop() {
    // Remove and return top
  }

  peek() {
    // Return top without removing
  }

  isEmpty() {
    // Check if empty
  }
}`,
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
    starterCode: `function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return this.name + ' makes a sound';
};

function Dog(name) {
  Animal.call(this, name);
}
Dog.prototype = Object.create(Animal.prototype);

const dog = new Dog('Rex');
console.log(dog.speak());
console.log(dog instanceof Animal);
console.log(dog.constructor === Dog);`,
    testCases: [
      { id: "8a", input: "", expectedOutput: "Rex makes a sound\ntrue\nfalse" },
    ],
  },
];
