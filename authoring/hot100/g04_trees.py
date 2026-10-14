"""Hot 100 group 二叉树 (problems not shipped before)."""

ORIGINAL = ("（本课程原创简述，完整题面见 LeetCode 官方页面。）", " (Original summary written for Learn; see LeetCode for the official statement.)")


def summary(zh, en):
    return (zh + ORIGINAL[0], en + ORIGINAL[1])


# Shared generator helpers: a random tree shape filled in-order with given values, serialized level by level.
SHAPE = '''
def _shape(n, rng):
    if n == 0:
        return None
    nodes = [[None, None] for _ in range(n)]
    order = list(range(n))
    root = 0
    for i in range(1, n):
        cur = root
        while True:
            side = rng.randint(0, 1)
            if nodes[cur][side] is None:
                nodes[cur][side] = i
                break
            cur = nodes[cur][side]
    return nodes, root

def _inorder_ids(nodes, root):
    out = []
    stack = []
    cur = root
    while stack or cur is not None:
        while cur is not None:
            stack.append(cur)
            cur = nodes[cur][0]
        cur = stack.pop()
        out.append(cur)
        cur = nodes[cur][1]
    return out

def _level(nodes, root, value):
    if root is None:
        return []
    out = []
    queue = [root]
    head = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        if node is None:
            out.append(None)
            continue
        out.append(value[node])
        queue.append(nodes[node][0])
        queue.append(nodes[node][1])
    while out and out[-1] is None:
        out.pop()
    return out

def _bst(values, rng):
    built = _shape(len(values), rng)
    if built is None:
        return []
    nodes, root = built
    ids = _inorder_ids(nodes, root)
    value = {}
    for node, v in zip(ids, sorted(values)):
        value[node] = v
    return _level(nodes, root, value)

def _distinct_tree(n, low, high, rng):
    built = _shape(n, rng)
    if built is None:
        return []
    nodes, root = built
    vals = rng.sample(range(low, high + 1), n)
    return _level(nodes, root, dict(enumerate(vals)))
'''

TREE = '''
def _tree(values):
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue = [root]
    i = 1
    head = 0
    while head < len(queue) and i < len(values):
        node = queue[head]
        head += 1
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root
'''

PROBLEMS = [
    dict(
        slug="binary-tree-inorder-traversal", topics=["trees"], entry="inorderTraversal",
        params=[("root", "tree")], returns="int[]",
        summary=summary("返回二叉树的中序遍历（左子树、根、右子树）序列。进阶：不用递归。", "Return the inorder traversal (left subtree, root, right subtree). Follow-up: do it without recursion."),
        constraints=[("0 ≤ 节点数 ≤ 100，-100 ≤ Node.val ≤ 100", "0 ≤ nodes ≤ 100, -100 ≤ Node.val ≤ 100")],
        hints=[("递归版本只有三行：遍历左子树、记录根、遍历右子树。", "The recursive version is three lines: left subtree, record the root, right subtree."),
               ("迭代版本用栈模拟递归：一路向左把节点压栈。", "The iterative version simulates recursion with a stack: push nodes while going left."),
               ("栈顶弹出时记录它的值，然后转向它的右子树，继续“一路向左”。", "When popping, record the value, then turn to its right subtree and go left again.")],
        explanation=("用显式栈模拟递归：压入左链，弹出时访问并转向右子树。时间 O(n)，空间 O(h)。",
                     "An explicit stack simulates recursion: push the left chain, visit on pop, then turn right. O(n) time, O(h) space."),
        boundary=[[[]], [[1]], [[1, None, 2]], [[1, 2]], [[2, 1, 3]]],
        inputs=[{"type": "tree", "minLength": 0, "maxLength": 100, "smallMaxLength": 8, "largeLength": 100, "min": -100, "max": 100}],
        reference='''
def inorderTraversal(root):
    out, stack, cur = [], [], root
    while stack or cur:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        out.append(cur.val)
        cur = cur.right
    return out
''',
        oracle='''
def inorderTraversal(root):
    if root is None:
        return []
    return inorderTraversal(root.left) + [root.val] + inorderTraversal(root.right)
''',
    ),
    dict(
        slug="symmetric-tree", topics=["trees"], entry="isSymmetric",
        params=[("root", "tree")], returns="bool",
        summary=summary("判断二叉树是否关于中心轴镜像对称。", "Report whether the tree is a mirror image of itself around its center."),
        constraints=[("1 ≤ 节点数 ≤ 1000，-100 ≤ Node.val ≤ 100", "1 ≤ nodes ≤ 1000, -100 ≤ Node.val ≤ 100")],
        hints=[("对称意味着左子树和右子树互为镜像。两棵树互为镜像需要满足什么？", "Symmetric means the left and right subtrees mirror each other. When are two trees mirrors?"),
               ("根值相等，且 A 的左子树与 B 的右子树互为镜像，A 的右子树与 B 的左子树互为镜像。", "Equal roots, A's left mirrors B's right, and A's right mirrors B's left."),
               ("写一个 mirror(a, b) 递归函数，或用队列成对比较节点。", "Write a recursive mirror(a, b), or compare nodes in pairs with a queue.")],
        explanation=("同时遍历两棵子树，比较外侧与外侧、内侧与内侧。时间 O(n)，空间 O(h)。",
                     "Walk both subtrees together, comparing outer with outer and inner with inner. O(n) time, O(h) space."),
        boundary=[[[1]], [[1, 2, 2]], [[1, 2]], [[1, 2, 2, None, 3, None, 3]], [[1, 2, 2, 3, 4, 4, 3]]],
        inputs=[{"type": "tree", "minLength": 1, "maxLength": 1000, "smallMaxLength": 7, "largeLength": 1000, "min": -100, "max": 100, "smallMin": 1, "smallMax": 3}],
        hooks=SHAPE + '''
def adjust(args, rng, size):
    if rng.random() < 0.4:
        return args
    half = _parse(_distinct_tree(rng.randint(0, 6 if size == "small" else 90), -100, 100, rng))
    out = _serialize([rng.randint(-100, 100), half, _flip(half)])
    if rng.random() < 0.3 and len(out) > 2:
        index = rng.randrange(1, len(out))
        if out[index] is not None:
            out[index] = out[index] + 1 if out[index] < 100 else out[index] - 1
    return [out]

def _parse(values):
    if not values:
        return None
    nodes = [None if v is None else [v, None, None] for v in values]
    queue = [nodes[0]]
    i = 1
    head = 0
    while head < len(queue) and i < len(nodes):
        node = queue[head]
        head += 1
        for side in (1, 2):
            if i < len(nodes):
                child = nodes[i]
                i += 1
                node[side] = child
                if child is not None:
                    queue.append(child)
    return nodes[0]

def _flip(node):
    if node is None:
        return None
    return [node[0], _flip(node[2]), _flip(node[1])]

def _serialize(root):
    out = []
    queue = [root]
    head = 0
    while head < len(queue):
        node = queue[head]
        head += 1
        if node is None:
            out.append(None)
            continue
        out.append(node[0])
        queue.append(node[1])
        queue.append(node[2])
    while out and out[-1] is None:
        out.pop()
    return out
''',
        reference='''
def isSymmetric(root):
    def mirror(a, b):
        if a is None or b is None:
            return a is b
        return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)
    return mirror(root.left, root.right)
''',
        oracle='''
def isSymmetric(root):
    levels = []
    layer = [root]
    while any(node is not None for node in layer):
        values = [None if node is None else node.val for node in layer]
        if values != values[::-1]:
            return False
        nxt = []
        for node in layer:
            if node is None:
                nxt.extend([None, None])
            else:
                nxt.extend([node.left, node.right])
        layer = nxt
    return True
''',
    ),
    dict(
        slug="diameter-of-binary-tree", topics=["trees"], entry="diameterOfBinaryTree",
        params=[("root", "tree")], returns="int",
        summary=summary("求二叉树的直径：任意两个节点之间最长路径上的边数（路径不一定经过根）。", "Return the tree's diameter: the number of edges on the longest path between any two nodes, which need not pass through the root."),
        constraints=[("1 ≤ 节点数 ≤ 10⁴，-100 ≤ Node.val ≤ 100", "1 ≤ nodes ≤ 10⁴, -100 ≤ Node.val ≤ 100")],
        hints=[("一条最长路径一定在某个节点“拐弯”。经过节点 x 拐弯的最长路径有多长？", "Every longest path turns at some node. How long is the longest path turning at node x?"),
               ("它等于 x 左子树的高度 + 右子树的高度。", "It equals the height of x's left subtree plus the height of its right subtree."),
               ("后序遍历计算每个节点的高度，同时用全局变量更新 左高 + 右高 的最大值。", "Compute heights in post-order and update a running maximum of left height + right height.")],
        explanation=("一次后序遍历：返回子树高度，同时在每个节点处更新经过它的最长路径。时间 O(n)，空间 O(h)。",
                     "One post-order pass returns subtree heights while updating the longest path through each node. O(n) time, O(h) space."),
        boundary=[[[1]], [[1, 2]], [[1, 2, 3]], [[1, 2, None, 3, None, 4]]],
        inputs=[{"type": "tree", "minLength": 1, "maxLength": 10000, "smallMaxLength": 9, "largeLength": 3000, "min": -100, "max": 100}],
        reference='''
def diameterOfBinaryTree(root):
    best = 0
    def height(node):
        nonlocal best
        if node is None:
            return 0
        left, right = height(node.left), height(node.right)
        best = max(best, left + right)
        return 1 + max(left, right)
    height(root)
    return best
''',
        oracle='''
def diameterOfBinaryTree(root):
    nodes, adjacency = [], {}
    stack = [(root, None)]
    while stack:
        node, parent = stack.pop()
        if node is None:
            continue
        nodes.append(node)
        adjacency.setdefault(id(node), [])
        if parent is not None:
            adjacency[id(node)].append(parent)
            adjacency[id(parent)].append(node)
        stack.append((node.left, node))
        stack.append((node.right, node))
    best = 0
    for start in nodes:
        dist = {id(start): 0}
        queue = [start]
        for cur in queue:
            for nxt in adjacency[id(cur)]:
                if id(nxt) not in dist:
                    dist[id(nxt)] = dist[id(cur)] + 1
                    queue.append(nxt)
        best = max(best, max(dist.values()))
    return best
''',
    ),
    dict(
        slug="convert-sorted-array-to-binary-search-tree", topics=["trees"], entry="sortedArrayToBST",
        params=[("nums", "int[]")], returns="tree", comparator={"kind": "validator", "name": "balanced-bst-same-inorder"},
        summary=summary("把严格递增的数组转换成一棵高度平衡的二叉搜索树（每个节点左右子树高度差不超过 1）。答案不唯一，任意满足条件的树都算正确。",
                        "Convert a strictly increasing array into a height-balanced binary search tree, where no node's subtrees differ in height by more than 1. Any valid tree is accepted."),
        constraints=[("1 ≤ n ≤ 10⁴，-10⁴ ≤ nums[i] ≤ 10⁴，严格递增", "1 ≤ n ≤ 10⁴, -10⁴ ≤ nums[i] ≤ 10⁴, strictly increasing")],
        hints=[("为了平衡，根应该选哪个元素？", "To stay balanced, which element should be the root?"),
               ("选中间元素作根，左半部分构成左子树，右半部分构成右子树。", "Pick the middle element as the root; the left half forms the left subtree and the right half the right subtree."),
               ("对两半递归同样的过程；用下标区间避免复制数组。", "Recurse on both halves, passing index ranges instead of copying.")],
        explanation=("分治：中点为根，左右两半递归建树，两侧节点数相差至多 1，高度自然平衡。时间 O(n)，空间 O(log n)。",
                     "Divide and conquer: the middle is the root and both halves recurse; the sides differ by at most one node, so the tree is balanced. O(n) time, O(log n) space."),
        boundary=[[[0]], [[1, 2]], [[-1, 0, 1]], [[-10000, 10000]]],
        inputs=[{"type": "int[]", "minLength": 1, "smallMaxLength": 9, "largeLength": 5000, "min": -10000, "max": 10000, "sorted": "asc", "distinct": True}],
        reference='''
def sortedArrayToBST(nums):
    def build(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        return TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi))
    return build(0, len(nums) - 1)
''',
        oracle='''
def sortedArrayToBST(nums):
    if not nums:
        return None
    mid = (len(nums) - 1) // 2
    root = TreeNode(nums[mid])
    root.left = sortedArrayToBST(nums[:mid])
    root.right = sortedArrayToBST(nums[mid + 1:])
    return root
''',
    ),
    dict(
        slug="validate-binary-search-tree", topics=["trees"], entry="isValidBST",
        params=[("root", "tree")], returns="bool",
        summary=summary("判断二叉树是否为有效的二叉搜索树：每个节点的左子树所有值都严格小于它，右子树所有值都严格大于它。",
                        "Report whether the tree is a valid binary search tree: every value in a node's left subtree is strictly smaller and every value in its right subtree strictly larger."),
        constraints=[("1 ≤ 节点数 ≤ 10⁴，-2³¹ ≤ Node.val ≤ 2³¹-1", "1 ≤ nodes ≤ 10⁴, -2³¹ ≤ Node.val ≤ 2³¹-1")],
        hints=[("只比较节点与它的直接孩子够吗？想一个反例。", "Is comparing each node with its children enough? Find a counterexample."),
               ("每个节点的取值都受祖先限制：它必须落在一个 (low, high) 开区间内。", "Every node is bounded by its ancestors: it must lie in an open interval (low, high)."),
               ("递归时把区间传下去；或利用“中序遍历严格递增”这一性质。", "Pass the interval down the recursion, or use the fact that an inorder traversal must be strictly increasing.")],
        explanation=("递归携带上下界，或检查中序序列严格递增。时间 O(n)，空间 O(h)。",
                     "Recurse with lower and upper bounds, or check that the inorder sequence is strictly increasing. O(n) time, O(h) space."),
        boundary=[[[1]], [[2, 1, 3]], [[1, 1]], [[5, 4, 6, None, None, 3, 7]], [[2147483647]], [[-2147483648, None, 2147483647]]],
        inputs=[{"type": "tree", "minLength": 1, "maxLength": 10000, "smallMaxLength": 8, "largeLength": 3000, "min": -1000000000, "max": 1000000000}],
        hooks=SHAPE + '''
def adjust(args, rng, size):
    n = rng.randint(1, 8) if size == "small" else 3000
    low, high = (-5, 9) if size == "small" else (-2147483648, 2147483647)
    values = rng.sample(range(low, high + 1), n) if high - low + 1 >= n else [rng.randint(low, high) for _ in range(n)]
    tree = _bst(values, rng)
    if rng.random() < 0.5 and n > 1:
        present = [i for i, v in enumerate(tree) if v is not None]
        a, b = rng.sample(present, 2)
        tree[a], tree[b] = tree[b], tree[a]
    return [tree]
''',
        reference='''
def isValidBST(root):
    stack, prev, cur = [], None, root
    while stack or cur:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        if prev is not None and cur.val <= prev:
            return False
        prev = cur.val
        cur = cur.right
    return True
''',
        oracle='''
def isValidBST(root):
    def values(node):
        return [] if node is None else values(node.left) + [node.val] + values(node.right)
    def ok(node):
        if node is None:
            return True
        return all(v < node.val for v in values(node.left)) and all(v > node.val for v in values(node.right)) and ok(node.left) and ok(node.right)
    return ok(root)
''',
    ),
    dict(
        slug="kth-smallest-element-in-a-bst", topics=["trees"], entry="kthSmallest",
        params=[("root", "tree"), ("k", "int")], returns="int",
        summary=summary("返回二叉搜索树中第 k 小的值（k 从 1 开始）。", "Return the k-th smallest value in the binary search tree (1-indexed)."),
        constraints=[("1 ≤ k ≤ n ≤ 10⁴，0 ≤ Node.val ≤ 10⁴", "1 ≤ k ≤ n ≤ 10⁴, 0 ≤ Node.val ≤ 10⁴")],
        hints=[("二叉搜索树的中序遍历有什么特点？", "What does an inorder traversal of a BST look like?"),
               ("中序遍历按升序访问所有值，第 k 个访问到的就是答案。", "It visits values in increasing order, so the k-th visit is the answer."),
               ("用迭代中序遍历，访问到第 k 个时立即返回，不必遍历整棵树。", "Use an iterative inorder walk and return as soon as the k-th node is visited.")],
        explanation=("迭代中序遍历并计数，到第 k 个即停止。时间 O(h + k)，空间 O(h)。",
                     "Count during an iterative inorder walk and stop at the k-th node. O(h + k) time, O(h) space."),
        boundary=[[[1], 1], [[2, 1, 3], 1], [[2, 1, 3], 3], [[3, 1, 4, None, 2], 2]],
        inputs=[{"type": "tree", "minLength": 1, "maxLength": 10000, "smallMaxLength": 8, "largeLength": 3000, "min": 0, "max": 10000}, {"type": "int", "min": 1, "max": 1}],
        hooks=SHAPE + '''
def adjust(args, rng, size):
    n = rng.randint(1, 8) if size == "small" else 3000
    values = rng.sample(range(0, 10001), n)
    return [_bst(values, rng), rng.randint(1, n)]
''',
        reference='''
def kthSmallest(root, k):
    stack, cur = [], root
    while True:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        k -= 1
        if k == 0:
            return cur.val
        cur = cur.right
''',
        oracle='''
def kthSmallest(root, k):
    values = []
    stack = [root]
    while stack:
        node = stack.pop()
        if node:
            values.append(node.val)
            stack.append(node.left)
            stack.append(node.right)
    return sorted(values)[k - 1]
''',
    ),
    dict(
        slug="binary-tree-right-side-view", topics=["trees"], entry="rightSideView",
        params=[("root", "tree")], returns="int[]",
        summary=summary("站在二叉树右侧，从上到下返回每一层能看到的最右边节点的值。", "Standing to the right of the tree, return the value of the rightmost node on each level, top to bottom."),
        constraints=[("0 ≤ 节点数 ≤ 100，-100 ≤ Node.val ≤ 100", "0 ≤ nodes ≤ 100, -100 ≤ Node.val ≤ 100")],
        hints=[("每一层只能看到一个节点，它是该层的哪一个？", "Each level shows one node. Which one?"),
               ("层序遍历时，每一层的最后一个节点就是答案。", "In a level-order traversal, the last node of each level is the answer."),
               ("也可以 DFS：先右后左，每到一个新深度时记录第一个遇到的节点。", "Or DFS right child first, recording the first node seen at each new depth.")],
        explanation=("BFS 按层处理，记录每层最后一个节点。时间 O(n)，空间 O(w)。", "BFS processes level by level and records each level's last node. O(n) time, O(w) space."),
        boundary=[[[]], [[1]], [[1, 2]], [[1, 2, 3, 4]], [[1, None, 3]]],
        inputs=[{"type": "tree", "minLength": 0, "maxLength": 100, "smallMaxLength": 9, "largeLength": 100, "min": -100, "max": 100}],
        reference='''
def rightSideView(root):
    out, level = [], [root] if root else []
    while level:
        out.append(level[-1].val)
        level = [child for node in level for child in (node.left, node.right) if child]
    return out
''',
        oracle='''
def rightSideView(root):
    seen = {}
    def dfs(node, depth):
        if node is None:
            return
        seen[depth] = node.val
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)
    dfs(root, 0)
    return [seen[d] for d in range(len(seen))]
''',
    ),
    dict(
        slug="flatten-binary-tree-to-linked-list", topics=["trees"], entry="flatten",
        params=[("root", "tree")], returns="tree", shape={"kind": "in-place", "param": 0},
        summary=summary("把二叉树原地展开成“链表”：按先序遍历的顺序，每个节点的左孩子为空、右孩子指向下一个节点。函数不返回值，结果按修改后的树显示。",
                        "Flatten the tree in place into a 'linked list': in preorder, every node's left child is empty and its right child is the next node. The function returns nothing; the result is shown as the modified tree."),
        constraints=[("0 ≤ 节点数 ≤ 2000，-100 ≤ Node.val ≤ 100；进阶：O(1) 额外空间", "0 ≤ nodes ≤ 2000, -100 ≤ Node.val ≤ 100; follow-up: O(1) extra space")],
        hints=[("展开后的顺序就是先序遍历顺序。", "The flattened order is the preorder sequence."),
               ("对节点 x：把左子树接到 x.right，原来的右子树接到左子树最右节点的后面。", "For node x: move the left subtree to x.right and attach the old right subtree after the left subtree's rightmost node."),
               ("从根开始沿 right 逐个处理，每处理一个节点把它的 left 设为 null，即可 O(1) 额外空间。", "Walk from the root along right, processing each node and clearing its left, for O(1) extra space.")],
        explanation=("类 Morris 方法：把左子树整体插到右边，前驱（左子树最右节点）连接原右子树。每条边处理常数次，时间 O(n)，额外空间 O(1)。",
                     "A Morris-like splice: move the left subtree to the right and link its rightmost node to the old right subtree. Each edge is handled a constant number of times, O(n) time, O(1) extra space."),
        boundary=[[[]], [[0]], [[1, 2]], [[1, None, 2]], [[1, 2, 5, 3, 4, None, 6]]],
        inputs=[{"type": "tree", "minLength": 0, "maxLength": 2000, "smallMaxLength": 9, "largeLength": 2000, "min": -100, "max": 100}],
        reference='''
def flatten(root):
    cur = root
    while cur:
        if cur.left:
            pred = cur.left
            while pred.right:
                pred = pred.right
            pred.right = cur.right
            cur.right = cur.left
            cur.left = None
        cur = cur.right
''',
        oracle='''
def flatten(root):
    order = []
    def pre(node):
        if node:
            order.append(node)
            pre(node.left)
            pre(node.right)
    pre(root)
    for a, b in zip(order, order[1:] + [None]):
        a.left = None
        a.right = b
''',
    ),
    dict(
        slug="construct-binary-tree-from-preorder-and-inorder-traversal", topics=["trees"], entry="buildTree",
        params=[("preorder", "int[]"), ("inorder", "int[]")], returns="tree",
        summary=summary("给定一棵（节点值互不相同的）二叉树的先序遍历和中序遍历，重建并返回这棵树。", "Given the preorder and inorder traversals of a tree with distinct values, rebuild and return the tree."),
        constraints=[("1 ≤ n ≤ 3000，-3000 ≤ 值 ≤ 3000，值互不相同", "1 ≤ n ≤ 3000, -3000 ≤ values ≤ 3000, all distinct")],
        hints=[("先序遍历的第一个元素是什么？", "What is the first element of the preorder traversal?"),
               ("它是根。在中序遍历中找到根的位置，左边是左子树，右边是右子树，由此知道左子树的大小。", "It is the root. Its position in the inorder sequence splits the left and right subtrees and tells you the left subtree's size."),
               ("用哈希表记录中序中每个值的下标，递归时传下标区间，O(n) 完成。", "Store each value's inorder index in a hash map and recurse on index ranges for O(n) total.")],
        explanation=("先序首元素为根，用哈希表在中序中定位根以划分左右子树并递归。时间 O(n)，空间 O(n)。",
                     "The first preorder element is the root; a hash map locates it in the inorder sequence to split the subtrees, then recurse. O(n) time and space."),
        boundary=[[[1], [1]], [[1, 2], [2, 1]], [[1, 2], [1, 2]], [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]]],
        inputs=[{"type": "int[]", "minLength": 1}, {"type": "int[]", "minLength": 1}],
        hooks=SHAPE + '''
def adjust(args, rng, size):
    n = rng.randint(1, 8) if size == "small" else 3000
    built = _shape(n, rng)
    nodes, root = built
    vals = rng.sample(range(-3000, 3001), n)
    pre = []
    stack = [root]
    while stack:
        node = stack.pop()
        if node is None:
            continue
        pre.append(vals[node])
        stack.append(nodes[node][1])
        stack.append(nodes[node][0])
    ino = [vals[i] for i in _inorder_ids(nodes, root)]
    return [pre, ino]
''',
        reference='''
def buildTree(preorder, inorder):
    index = {v: i for i, v in enumerate(inorder)}
    pos = 0
    def build(lo, hi):
        nonlocal pos
        if lo > hi:
            return None
        value = preorder[pos]
        pos += 1
        node = TreeNode(value)
        mid = index[value]
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(inorder) - 1)
''',
        oracle='''
def buildTree(preorder, inorder):
    if not preorder:
        return None
    root = TreeNode(preorder[0])
    mid = inorder.index(preorder[0])
    root.left = buildTree(preorder[1:mid + 1], inorder[:mid])
    root.right = buildTree(preorder[mid + 1:], inorder[mid + 1:])
    return root
''',
    ),
    dict(
        slug="path-sum-iii", topics=["trees"], entry="pathSum",
        params=[("root", "tree"), ("targetSum", "int")], returns="int",
        summary=summary("统计和为 targetSum 的路径条数。路径必须向下（从父到子），但不必从根开始、也不必在叶子结束。", "Count downward paths (parent to child) whose values sum to targetSum; a path need not start at the root or end at a leaf."),
        constraints=[("0 ≤ 节点数 ≤ 1000，-10⁹ ≤ Node.val ≤ 10⁹，-1000 ≤ targetSum ≤ 1000", "0 ≤ nodes ≤ 1000, -10⁹ ≤ Node.val ≤ 10⁹, -1000 ≤ targetSum ≤ 1000")],
        hints=[("从根到当前节点的路径上，任意一段向下路径的和能用前缀和表示吗？", "On the root-to-node path, can any downward segment's sum be written with prefix sums?"),
               ("与“和为 K 的子数组”相同：路径和 = 当前前缀和 − 某个祖先处的前缀和。", "Exactly like subarray sum equals k: segment sum = current prefix − some ancestor's prefix."),
               ("DFS 时用哈希表记录根到当前路径上各前缀和的次数；回溯离开节点时要把它的计数减回去。", "During DFS keep counts of prefix sums along the current root path; decrement a node's count when backtracking out of it.")],
        explanation=("树上的前缀和 + 哈希计数，回溯时撤销当前节点的贡献。时间 O(n)，空间 O(h)。",
                     "Prefix sums along tree paths with hash counts, undoing the current node's contribution on the way back. O(n) time, O(h) space."),
        boundary=[[[], 0], [[1], 1], [[1], 0], [[0, 0, 0], 0], [[1, -1, 1], 0]],
        inputs=[{"type": "tree", "minLength": 0, "maxLength": 1000, "smallMaxLength": 9, "largeLength": 1000, "min": -5, "max": 5}, {"type": "int", "min": -10, "max": 10, "smallMin": -3, "smallMax": 3}],
        reference='''
def pathSum(root, targetSum):
    counts = {0: 1}
    def dfs(node, total):
        if node is None:
            return 0
        total += node.val
        found = counts.get(total - targetSum, 0)
        counts[total] = counts.get(total, 0) + 1
        found += dfs(node.left, total) + dfs(node.right, total)
        counts[total] -= 1
        return found
    return dfs(root, 0)
''',
        oracle='''
def pathSum(root, targetSum):
    def from_here(node, need):
        if node is None:
            return 0
        need -= node.val
        return (1 if need == 0 else 0) + from_here(node.left, need) + from_here(node.right, need)
    def every(node):
        if node is None:
            return 0
        return from_here(node, targetSum) + every(node.left) + every(node.right)
    return every(root)
''',
    ),
    dict(
        slug="lowest-common-ancestor-of-a-binary-tree", topics=["trees"], entry="lowestCommonAncestor",
        params=[("root", "tree"), ("p", "int"), ("q", "int")], returns="int", shape={"kind": "harness", "name": "tree-node-refs"},
        summary=summary("给定二叉树和其中两个不同节点 p、q，返回它们的最近公共祖先（一个节点也可以是它自己的祖先）。测试输入用值标识 p 和 q，你的函数接收节点本身，结果显示为节点的值。",
                        "Given a binary tree and two distinct nodes p and q in it, return their lowest common ancestor; a node counts as its own ancestor. Tests identify p and q by value, your function receives the nodes, and the result is shown as the node's value."),
        constraints=[("2 ≤ 节点数 ≤ 10⁵，值互不相同，p ≠ q，p 和 q 都在树中", "2 ≤ nodes ≤ 10⁵, distinct values, p ≠ q, both are in the tree")],
        hints=[("对某个节点，p 和 q 可能都在左子树、都在右子树，或者分居两侧。", "For a node, p and q may both be on the left, both on the right, or split across the sides."),
               ("递归返回“在这棵子树中找到的 p 或 q（或它们的 LCA）”。", "Have the recursion return 'p or q, or their LCA, found in this subtree'."),
               ("当前节点是 p 或 q 就返回它；左右递归结果都非空说明分居两侧，当前节点就是答案；否则返回非空的那一侧。", "Return the node if it is p or q; if both sides return non-null, this node is the answer; otherwise return the non-null side.")],
        explanation=("一次后序遍历：左右子树各自报告找到的目标，第一次两侧都有结果的节点就是最近公共祖先。时间 O(n)，空间 O(h)。",
                     "One post-order pass: each subtree reports what it found, and the first node where both sides report something is the LCA. O(n) time, O(h) space."),
        boundary=[[[1, 2], 1, 2], [[1, 2], 2, 1], [[3, 5, 1, 6, 2, 0, 8, None, None, 7, 4], 7, 4], [[1, 2, 3], 2, 3]],
        inputs=[{"type": "tree", "minLength": 2}, {"type": "int"}, {"type": "int"}],
        hooks=SHAPE + '''
def adjust(args, rng, size):
    n = rng.randint(2, 9) if size == "small" else 3000
    tree = _distinct_tree(n, -1000000000 if size == "large" else -20, 1000000000 if size == "large" else 20, rng)
    present = [v for v in tree if v is not None]
    p, q = rng.sample(present, 2)
    return [tree, p, q]
''',
        reference='''
def lowestCommonAncestor(root, p, q):
    if root is None or root is p or root is q:
        return root
    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)
    if left and right:
        return root
    return left or right
''',
        oracle='''
def lowestCommonAncestor(root, p, q):
    parent = {id(root): None}
    stack = [root]
    while stack:
        node = stack.pop()
        for child in (node.left, node.right):
            if child:
                parent[id(child)] = node
                stack.append(child)
    ancestors = []
    node = p
    while node is not None:
        ancestors.append(node)
        node = parent[id(node)]
    node = q
    while node is not None:
        if any(a is node for a in ancestors):
            return node
        node = parent[id(node)]
    return None
''',
    ),
    dict(
        slug="binary-tree-maximum-path-sum", topics=["trees"], entry="maxPathSum",
        params=[("root", "tree")], returns="int",
        summary=summary("路径是沿父子边连接的节点序列，每个节点至多出现一次，至少包含一个节点，不必经过根。返回所有路径中节点值之和的最大值。",
                        "A path is a sequence of nodes joined by parent-child edges, each node used at most once, with at least one node and not necessarily through the root. Return the largest sum of node values over all paths."),
        constraints=[("1 ≤ 节点数 ≤ 3×10⁴，-1000 ≤ Node.val ≤ 1000", "1 ≤ nodes ≤ 3×10⁴, -1000 ≤ Node.val ≤ 1000")],
        hints=[("和“直径”类似：最优路径在某个节点拐弯。这时它由哪几部分组成？", "Like the diameter: the best path turns at some node. What parts make it up there?"),
               ("节点值 + 左边向下延伸的最大收益 + 右边向下延伸的最大收益；收益为负时就不要它（取 0）。", "Node value + best downward gain on the left + best downward gain on the right, dropping a negative gain (use 0)."),
               ("递归函数返回“从该节点向下的单边最大路径和”，同时用全局变量更新拐弯路径的最大值。", "The recursion returns the best one-sided downward sum from the node while a global tracks the best turning path.")],
        explanation=("后序遍历：返回单边最大贡献 max(0, …)，在每个节点用 值 + 左贡献 + 右贡献 更新答案。时间 O(n)，空间 O(h)。",
                     "Post-order: return the best one-sided contribution clipped at 0 and update the answer with value + left + right at each node. O(n) time, O(h) space."),
        boundary=[[[-3]], [[1]], [[-1, -2, -3]], [[2, -1]], [[-10, 9, 20, None, None, 15, 7]]],
        inputs=[{"type": "tree", "minLength": 1, "maxLength": 30000, "smallMaxLength": 9, "largeLength": 3000, "min": -1000, "max": 1000, "smallMin": -6, "smallMax": 6}],
        reference='''
def maxPathSum(root):
    best = root.val
    def gain(node):
        nonlocal best
        if node is None:
            return 0
        left = max(0, gain(node.left))
        right = max(0, gain(node.right))
        best = max(best, node.val + left + right)
        return node.val + max(left, right)
    gain(root)
    return best
''',
        oracle='''
def maxPathSum(root):
    adjacency = {}
    nodes = []
    stack = [(root, None)]
    while stack:
        node, parent = stack.pop()
        if node is None:
            continue
        nodes.append(node)
        adjacency.setdefault(id(node), [])
        if parent is not None:
            adjacency[id(node)].append(parent)
            adjacency[id(parent)].append(node)
        stack.append((node.left, node))
        stack.append((node.right, node))
    best = None
    for start in nodes:
        sums = {id(start): start.val}
        queue = [start]
        for cur in queue:
            for nxt in adjacency[id(cur)]:
                if id(nxt) not in sums:
                    sums[id(nxt)] = sums[id(cur)] + nxt.val
                    queue.append(nxt)
        top = max(sums.values())
        best = top if best is None else max(best, top)
    return best
''',
    ),
]
