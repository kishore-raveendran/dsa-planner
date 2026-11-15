const raw = `Arrays & Hashing|Scan an array once in O(n). A set answers “have I seen this?” and a map stores information per key. A frequency map for [4,1,4] stores 4→2 and 1→1.|What counts would you store for [2,5,2,5,5]?|2→2 and 5→3.
Contains Duplicate|E|duplicate-integer
Valid Anagram|E|is-anagram
Two Sum|E|two-integer-sum
Group Anagrams|M|anagram-groups
Top K Frequent Elements|M|top-k-elements-in-list
Encode and Decode Strings|M|string-encode-and-decode
Product of Array Except Self|M|products-of-array-discluding-self
Valid Sudoku|M|valid-sudoku
Longest Consecutive Sequence|M|longest-consecutive-sequence
Two Pointers|Use two indexes to narrow a search or maintain a boundary. Decide which pointer can move without losing a valid answer.|With sorted [1,3,6,9] and target 7, which end moves first?|Move the right pointer left because 1+9 is too large.
Valid Palindrome|E
Two Sum II Input Array Is Sorted|M
3Sum|M
Container With Most Water|M
Trapping Rain Water|H
Sliding Window|Maintain state for a contiguous range as its endpoints move. Expand to include a new item and shrink while a constraint is broken.|What changes when [2,4,1] becomes [4,1,3]?|Subtract 2 and add 3.
Best Time to Buy and Sell Stock|E
Longest Substring Without Repeating Characters|M
Longest Repeating Character Replacement|M
Permutation in String|M
Minimum Window Substring|H
Sliding Window Maximum|H
Stack|A stack gives you the most recently pushed item first. Trace pushes and pops and check for emptiness before peeking.|What remains after push A, push B, pop, push C?|A under C.
Valid Parentheses|E
Min Stack|M
Evaluate Reverse Polish Notation|M
Daily Temperatures|M
Car Fleet|M
Largest Rectangle in Histogram|H
Binary Search|Define an ordered search space and an invariant for the remaining candidates. Each comparison discards one side.|On [1,4,7,10,13], where do you look after comparing 10 with 7?|In the right half.
Binary Search|E
Search a 2D Matrix|M
Koko Eating Bananas|M
Find Minimum in Rotated Sorted Array|M
Search in Rotated Sorted Array|M
Time Based Key Value Store|M
Median of Two Sorted Arrays|H
Linked List|A node stores a value and a next reference. Save references before rewiring edges. A dummy head can simplify updates to the first node.|What reference must you save before reversing A.next from B to null?|Save B so you can continue the traversal.
Reverse Linked List|E
Merge Two Sorted Lists|E
Reorder List|M
Remove Nth Node From End of List|M
Copy List with Random Pointer|M
Add Two Numbers|M
Linked List Cycle|E
Find the Duplicate Number|M
LRU Cache|M
Merge k Sorted Lists|H
Reverse Nodes in k Group|H
Trees|Trace recursion on a small tree. Ask what each subtree returns. Use a queue when a task needs level order.|In preorder, do you visit the root before or after its children?|Before both children.
Invert Binary Tree|E
Maximum Depth of Binary Tree|E
Diameter of Binary Tree|E
Balanced Binary Tree|E
Same Tree|E
Subtree of Another Tree|E
Lowest Common Ancestor of a Binary Search Tree|M
Binary Tree Level Order Traversal|M
Binary Tree Right Side View|M
Count Good Nodes in Binary Tree|M
Validate Binary Search Tree|M
Kth Smallest Element in a BST|M
Construct Binary Tree from Preorder and Inorder Traversal|M
Binary Tree Maximum Path Sum|H
Serialize and Deserialize Binary Tree|H
Tries|A trie shares prefixes. Store a child per character and distinguish a complete word from a prefix.|After inserting “cat”, is “ca” a word?|It is a prefix. The terminal flag distinguishes full words.
Implement Trie Prefix Tree|M
Design Add and Search Words Data Structure|M
Word Search II|H
Heap / Priority Queue|A heap retrieves the smallest or largest item without sorting everything. In a min-heap of k items, the root is the smallest item retained.|Which item would you remove to keep the largest three seen so far?|The smallest of the currently retained items plus the new candidate.
Kth Largest Element in a Stream|E
Last Stone Weight|E
K Closest Points to Origin|M
Kth Largest Element in an Array|M
Task Scheduler|M
Design Twitter|M
Find Median from Data Stream|H
Backtracking|Try a choice, recurse, then undo the choice. Define the state and base case before writing the recursion.|When building subsets, what are the two choices for each item?|Include the item or skip it.
Subsets|M
Combination Sum|M
Permutations|M
Subsets II|M
Combination Sum II|M
Word Search|M
Palindrome Partitioning|M
Letter Combinations of a Phone Number|M
N-Queens|H
Generate Parentheses|M
Graphs|Represent neighbors and decide when to mark a node visited. BFS explores by distance in unweighted graphs. DFS explores one branch deeply.|Why mark a BFS node when enqueuing it?|To prevent multiple neighbors from adding it again.
Number of Islands|M
Max Area of Island|M
Clone Graph|M
Walls and Gates|M
Rotting Oranges|M
Pacific Atlantic Water Flow|M
Surrounded Regions|M
Course Schedule|M
Course Schedule II|M
Graph Valid Tree|M
Number of Connected Components in an Undirected Graph|M
Redundant Connection|M
Word Ladder|H
Advanced Graphs|Distinguish weighted shortest paths, dependency ordering, and connectivity. Match each problem to its constraints before choosing an algorithm.|Which shortest-path method fits nonnegative weighted edges?|Dijkstra’s algorithm.
Reconstruct Itinerary|H
Min Cost to Connect All Points|M
Network Delay Time|M
Swim in Rising Water|H
Alien Dictionary|H
Cheapest Flights Within K Stops|M
1-D Dynamic Programming|Define what dp[i] means in one sentence. Identify the transition, base cases, and calculation order on a tiny example.|If steps are 1 or 2, how many ways reach stair i?|ways[i−1] + ways[i−2].
Climbing Stairs|E
Min Cost Climbing Stairs|E
House Robber|M
House Robber II|M
Longest Palindromic Substring|M
Palindromic Substrings|M
Decode Ways|M
Coin Change|M
Maximum Product Subarray|M
Word Break|M
Longest Increasing Subsequence|M
Partition Equal Subset Sum|M
2-D Dynamic Programming|Use two coordinates when a subproblem depends on two positions or a position and another condition. Write what one cell represents.|In a grid with only right and down moves, where can you arrive from?|The cell above or the cell to the left.
Unique Paths|M
Longest Common Subsequence|M
Best Time to Buy and Sell Stock with Cooldown|M
Coin Change II|M
Target Sum|M
Interleaving String|M
Longest Increasing Path in a Matrix|H
Distinct Subsequences|H
Edit Distance|M
Burst Balloons|H
Regular Expression Matching|H
Greedy|Pick a local choice and explain why some optimal answer can include it. Search for counterexamples before committing.|How could you test a proposed greedy rule quickly?|Compare it with brute force on small cases.
Maximum Subarray|M
Jump Game|M
Jump Game II|M
Gas Station|M
Hand of Straights|M
Merge Triplets to Form Target Triplet|M
Partition Labels|M
Valid Parenthesis String|M
Intervals|Sort by a useful endpoint. Decide whether touching endpoints overlap for the problem at hand.|Do closed intervals [1,3] and [3,5] overlap?|Yes, at 3.
Insert Interval|M
Merge Intervals|M
Non-overlapping Intervals|M
Meeting Rooms|E
Meeting Rooms II|M
Minimum Interval to Include Each Query|H
Math & Geometry|Translate the problem to coordinates, remainders, or invariants. Test the math on small input before implementing.|What is the remainder of 13 divided by 5?|3.
Rotate Image|M
Spiral Matrix|M
Set Matrix Zeroes|M
Happy Number|E
Plus One|E
Pow(x, n)|M
Multiply Strings|M
Detect Squares|M
Bit Manipulation|Use masks to inspect bits. XOR cancels matching bits and AND can test a bit position.|What is x XOR x?|0.
Single Number|E
Number of 1 Bits|E
Counting Bits|E
Reverse Bits|E
Missing Number|E
Sum of Two Integers|M
Reverse Integer|M`;
const topics = [], problems = [];
for (const line of raw.split('\n')) {
  const [name, field, third, fourth] = line.split('|');
  if (!['E','M','H'].includes(field)) topics.push({name, lesson:field, question:third, answer:fourth, problems:[]});
  else {
    const topic = topics.at(-1);
    const problem = {id:name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,''), name, level:field, slug:third, topic};
    topic.problems.push(problem);
    problems.push(problem);
  }
}
