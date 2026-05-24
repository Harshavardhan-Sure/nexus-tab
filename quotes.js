/* ============================================
   Nexus Tab — Daily Quotes Collection
   ============================================ */

const QUOTES = [
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
  { text: "The most powerful tool we have as developers is automation.", author: "Scott Hanselman" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", author: "Bill Gates" },
  { text: "Everybody should learn to program a computer, because it teaches you how to think.", author: "Steve Jobs" },
  { text: "The advance of technology is based on making it fit in so that you don't really even notice it.", author: "Bill Gates" },
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
  { text: "Don't worry about what anybody else is going to do. The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Programming isn't about what you know; it's about what you can figure out.", author: "Chris Pine" },
  { text: "Delete more code than you write.", author: "Unknown" },
  { text: "The art of debugging is figuring out what you really told your program to do rather than what you thought you told it to do.", author: "Andrew Singer" },
  { text: "A user interface is like a joke. If you have to explain it, it's not that good.", author: "Martin LeBlanc" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "One machine can do the work of fifty ordinary men. No machine can do the work of one extraordinary man.", author: "Elbert Hubbard" },
  { text: "If you think good architecture is expensive, try bad architecture.", author: "Brian Foote" },
  { text: "Software is a great combination between artistry and engineering.", author: "Bill Gates" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "Vision without execution is hallucination.", author: "Thomas Edison" },
  { text: "What we know is a drop, what we don't know is an ocean.", author: "Isaac Newton" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Focus is saying no to the hundred other good ideas.", author: "Steve Jobs" },
  { text: "Shipping is a feature. A really important feature.", author: "Joel Spolsky" },
];

function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
