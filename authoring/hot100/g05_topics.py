"""Topics 图论 / 数据结构设计 with lessons and seeded variants."""

PROBLEMS = []

TOPICS = [
    dict(
        id="graph", order=10,
        title=("图：网格搜索、多源 BFS 与拓扑排序", "Graphs: grid search, multi-source BFS, and topological order"),
        summary=("把网格和依赖关系看成图：用 DFS/BFS 找连通块，用多源 BFS 求同时扩散的时间，用拓扑排序检测环和安排顺序。",
                 "See grids and dependencies as graphs: DFS/BFS finds connected components, multi-source BFS measures simultaneous spreading, and topological sorting detects cycles and orders tasks."),
        prerequisites=["trees"],
        problems=["number-of-islands"],
        variants=["graph-max-island-area", "graph-minimum-semesters"],
        lesson=dict(
            motivation=("一张卫星图被切成网格，每格是陆地或水。救援队想知道这片海域有几座岛。\n\n逐格查看很容易，难的是判断两块陆地是不是同一座岛——它们可能通过一条蜿蜒的陆路相连。\n\n把每个格子看成节点、相邻的陆地之间连一条边，“岛屿”就是图的连通块。同样的视角适用于传染扩散（多源 BFS）和课程依赖（有向图的拓扑排序）。",
                        "A satellite image is cut into a grid of land and water cells, and a rescue team wants to know how many islands there are.\n\nChecking each cell is easy; deciding whether two land cells belong to the same island is not, since they may connect through a winding strip of land.\n\nTreat each cell as a node with edges between adjacent land cells, and an island becomes a connected component. The same lens covers spreading processes (multi-source BFS) and course dependencies (topological order in a directed graph)."),
            strategy=("**连通块计数**：遍历所有格子，遇到未访问的陆地就计数，并用 DFS/BFS 把整块标记为已访问。大网格用显式栈或队列，避免递归过深。\n\n**多源 BFS**：所有起点一起入队，按层扩散，层数就是时间或距离。\n\n**拓扑排序（Kahn）**：统计入度，入度为 0 的节点入队；出队时删除其出边。能处理完所有节点 ⇔ 图中无环。\n\n**复杂度**：网格 O(mn)，一般图 O(V + E)，每个节点和边处理常数次。",
                      "**Counting components**: visit every cell; each unvisited land cell starts a new component that DFS/BFS marks entirely. Use an explicit stack or queue on large grids to avoid deep recursion.\n\n**Multi-source BFS**: enqueue every source at once and expand level by level; the level is the time or distance.\n\n**Topological sort (Kahn)**: count in-degrees, enqueue nodes with in-degree 0, and remove their outgoing edges when dequeued. Processing every node ⇔ the graph has no cycle.\n\n**Complexity**: O(mn) on grids and O(V + E) on general graphs; each node and edge is handled a constant number of times."),
            example=dict(
                title=("例：课程 0→1→2，外加先修关系 [1, 0]、[2, 1]", "Example: prerequisites [1, 0] and [2, 1]"),
                body=("[a, b] 表示先学 b 再学 a，即边 b → a。", "[a, b] means b before a, an edge b → a."),
                columns=["queue", "taken", "in-degrees"],
                trace=[
                    ({"queue": "[0]", "taken": "", "in-degrees": "0:0 1:1 2:1"}, ("只有课程 0 没有先修课。", "Only course 0 has no prerequisite.")),
                    ({"queue": "[1]", "taken": "0", "in-degrees": "1:0 2:1"}, ("学完 0，课程 1 的入度降为 0。", "After 0, course 1 drops to in-degree 0.")),
                    ({"queue": "[2]", "taken": "0 1", "in-degrees": "2:0"}, ("学完 1，课程 2 可以开始。", "After 1, course 2 becomes available.")),
                    ({"queue": "[]", "taken": "0 1 2", "in-degrees": "—"}, ("三门课全部取出：无环，可以学完。", "All three courses were taken: no cycle, so all can be finished.")),
                ],
            ),
            check=[
                dict(id="cycle", prompt=("Kahn 算法结束时，取出的节点数少于总数，说明什么？", "When Kahn's algorithm ends having taken fewer nodes than exist, what does that mean?"),
                     options=[("图中存在环，剩下的节点入度永远不会降到 0", "There is a cycle; the remaining nodes never reach in-degree 0"),
                              ("图不连通", "The graph is disconnected"),
                              ("队列实现有误", "The queue is implemented wrongly")],
                     answer=0, explanation=("环上的每个节点都依赖环上的另一个节点，所以它们的入度永远不为 0。", "Every node on a cycle depends on another node of the cycle, so none reaches in-degree 0.")),
                dict(id="multi-source", prompt=("腐烂橘子问题中，为什么要把所有腐烂橘子一起放进队列，而不是逐个做 BFS？", "In the rotting-oranges problem, why enqueue all rotten oranges together instead of running a BFS from each?"),
                     options=[("它们同时扩散，同一层代表同一分钟", "They spread at the same time, so one level is one minute"),
                              ("为了节省内存", "To save memory"),
                              ("因为 BFS 只能有一个起点", "Because BFS supports only one source")],
                     answer=0, explanation=("多源 BFS 的第 k 层恰好是第 k 分钟被感染的橘子。", "Level k of the multi-source BFS is exactly the oranges infected at minute k.")),
            ],
            practice="number-of-islands",
            reflection=("解释为什么数岛屿时每个格子最多被访问常数次，以及为什么大网格上递归 DFS 可能出问题。", "Explain why each cell is visited a constant number of times when counting islands, and why recursive DFS can fail on large grids."),
        ),
    ),
    dict(
        id="design", order=11,
        title=("数据结构设计：组合基础结构满足操作的复杂度要求", "Data-structure design: combine basic structures to meet operation costs"),
        summary=("设计题先列出每个操作的复杂度要求，再把哈希表、链表、栈、堆、字典树组合起来，让每种结构负责一种能力。",
                 "In design problems, list the required cost of every operation first, then combine hash maps, linked lists, stacks, heaps, and tries so that each structure provides one ability."),
        prerequisites=["stack", "linked-list"],
        problems=["min-stack"],
        variants=["design-min-queue", "design-mru-cache"],
        lesson=dict(
            motivation=("浏览器要缓存最近访问过的 100 个网页：命中时立即返回，满了就丢掉最久没访问过的那个。\n\n只用哈希表，查找很快，但不知道谁最久没用；只用链表按时间排序，删除最旧的很快，但查找要遍历。\n\n设计题的套路就是：把需求拆成几种能力（查找、排序、取最小、前缀匹配…），每种能力交给擅长它的结构，再让这些结构互相指向，保持同步。",
                        "A browser caches the 100 most recently visited pages: hits return immediately, and when full it drops the page unused for the longest time.\n\nA hash map alone finds pages fast but cannot tell which is oldest; a list ordered by time removes the oldest fast but needs a scan to find a page.\n\nThe design recipe: split the requirements into abilities (lookup, ordering, minimum, prefix matching), give each ability to the structure that does it best, and have the structures point at each other so they stay in sync."),
            strategy=("**先写复杂度表**：每个操作需要 O(1)？O(log n)？这决定了能用哪些结构。\n\n**常见组合**：\n- 哈希表 + 双向链表 → O(1) 查找 + O(1) 按使用顺序移动/删除（LRU）。\n- 栈中每个元素附带“到此为止的最小值” → O(1) getMin。\n- 大顶堆 + 小顶堆 → 动态中位数。\n- 字典树 → 按前缀查找。\n\n**不变量**：写清楚每个结构始终保持的性质（例如“链表头是最近使用的”“两个堆大小相差 ≤ 1”），每个操作结束前恢复它。\n\n**测试**：设计题按操作序列测试，注意空结构、容量为 1、重复键等边界。",
                      "**Write the cost table first**: does each operation need O(1), O(log n)? That decides which structures qualify.\n\n**Common combinations**:\n- Hash map + doubly linked list → O(1) lookup and O(1) reordering or removal by use (LRU).\n- Stack entries carrying the minimum so far → O(1) getMin.\n- Max-heap + min-heap → running median.\n- Trie → prefix lookups.\n\n**Invariants**: state what each structure always maintains (\"the list head is the most recent\", \"heap sizes differ by at most 1\") and restore it before each operation returns.\n\n**Testing**: design problems are tested with operation sequences; watch empty structures, capacity 1, and repeated keys."),
            example=dict(
                title=("例：MinStack 依次 push(-2)、push(0)、push(-3)、pop", "Example: MinStack push(-2), push(0), push(-3), pop"),
                body=("每个元素保存 (值, 到此为止的最小值)。", "Each entry stores (value, minimum so far)."),
                columns=["operation", "stack", "getMin"],
                trace=[
                    ({"operation": "push(-2)", "stack": "(-2,-2)", "getMin": "-2"}, ("第一个元素的最小值就是自己。", "The first entry's minimum is itself.")),
                    ({"operation": "push(0)", "stack": "(-2,-2) (0,-2)", "getMin": "-2"}, ("0 不比 -2 小，记录的最小值仍是 -2。", "0 is not below -2, so the recorded minimum stays -2.")),
                    ({"operation": "push(-3)", "stack": "… (-3,-3)", "getMin": "-3"}, ("新的最小值随元素一起入栈。", "The new minimum is pushed with the element.")),
                    ({"operation": "pop()", "stack": "(-2,-2) (0,-2)", "getMin": "-2"}, ("弹出后，栈顶记录的最小值自动恢复为 -2。", "After popping, the top's recorded minimum is -2 again.")),
                ],
            ),
            check=[
                dict(id="lru-structures", prompt=("LRU 缓存中，双向链表负责什么？", "In an LRU cache, what is the doubly linked list for?"),
                     options=[("按使用时间排序，O(1) 移动和淘汰节点", "Ordering by use, moving and evicting nodes in O(1)"),
                              ("按键查找值", "Looking up values by key"),
                              ("保存所有被淘汰的键", "Remembering evicted keys")],
                     answer=0, explanation=("查找由哈希表负责；链表保持使用顺序，哈希表中存节点指针使移动 O(1)。", "The hash map handles lookup; the list keeps usage order, and storing node pointers in the map makes moves O(1).")),
                dict(id="median-heaps", prompt=("用两个堆求中位数时，较小的一半应该放在哪种堆里？", "With two heaps for the median, which kind of heap holds the smaller half?"),
                     options=[("大顶堆，这样能 O(1) 拿到较小一半中最大的数", "A max-heap, to read the largest of the smaller half in O(1)"),
                              ("小顶堆", "A min-heap"),
                              ("都可以", "Either works")],
                     answer=0, explanation=("中位数位于较小一半的最大值与较大一半的最小值之间。", "The median sits between the smaller half's maximum and the larger half's minimum.")),
            ],
            practice="min-stack",
            reflection=("为 LRU 缓存写出 get 和 put 两个操作分别需要维护的不变量，并说明为什么单独用哈希表做不到 O(1) 淘汰。", "Write the invariants get and put must maintain in an LRU cache, and explain why a hash map alone cannot evict in O(1)."),
        ),
    ),
]

DESIGN_PARAMS = [("operations", "string[]"), ("arguments", "json")]

VARIANTS = [
    dict(
        id="graph-max-island-area", parent="number-of-islands", topic="graph",
        title=("最大的岛屿面积", "Largest Island Area"),
        summary=("返回网格中面积最大的岛屿包含的陆地格子数。", "Return the number of land cells in the largest island."),
        statement=("给定由 `0`（水）和 `1`（陆地）组成的整数网格 `grid`，上下左右相连的陆地组成一座岛屿。返回面积（格子数）最大的岛屿的面积；没有岛屿时返回 `0`。",
                   "Given an integer grid `grid` of `0` (water) and `1` (land), land cells connected up, down, left, or right form an island. Return the area, in cells, of the largest island, or `0` if there is none."),
        difficulty="medium", skills=["flood fill", "connected components"],
        differences=[("output", ("从“有几个连通块”变成“最大连通块有多大”，搜索时要累计每块的大小。", "From how many components to how big the largest is, so each search must count its cells.")),
                     ("input-structure", ("网格元素为整数 0/1 而不是字符。", "Cells are integers 0/1 instead of characters."))],
        transfer=("“遇到未访问陆地就整块淹没”的连通块搜索保持不变；新增的是在淹没过程中计数，并取所有块的最大值。",
                  "The flood fill that sinks a component when an unvisited land cell is met carries over; the addition is counting during the flood and keeping the maximum."),
        entry="maxAreaOfIsland", params=[("grid", "int[][]")], returns="int",
        constraints=[("1 ≤ m, n ≤ 50，grid[i][j] 为 0 或 1", "1 ≤ m, n ≤ 50, grid[i][j] is 0 or 1")],
        examples=[[[[1, 1, 0], [0, 1, 0], [1, 0, 1]]], [[[0, 0], [0, 0]]]],
        boundary=[[[[0]]], [[[1]]], [[[1, 0, 1]]], [[[1, 1], [1, 1]]], [[[1], [0], [1], [1]]]],
        inputs=[{"type": "int[][]", "minLength": 1, "maxLength": 50, "smallMaxLength": 5, "largeLength": 50, "row": {"minLength": 1, "maxLength": 50, "smallMaxLength": 5, "largeLength": 50}, "cell": {"min": 0, "max": 1}}],
        hints=[("和数岛屿一样遍历，但这次需要知道每座岛有多少格。", "Traverse as when counting islands, but now each island's size matters."),
               ("让搜索函数返回它淹没的格子数。", "Have the search return how many cells it sank."),
               ("用显式栈 BFS/DFS：每弹出一个陆地格子计数加一，最后与全局最大值比较。", "With an explicit stack, add one per popped land cell and compare with the running maximum at the end.")],
        reference='''
def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])
    best = 0
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == 1:
                grid[i][j] = 0
                stack, area = [(i, j)], 0
                while stack:
                    r, c = stack.pop()
                    area += 1
                    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                            grid[nr][nc] = 0
                            stack.append((nr, nc))
                best = max(best, area)
    return best
''',
        oracle='''
def maxAreaOfIsland(grid):
    cells = [(i, j) for i, row in enumerate(grid) for j, v in enumerate(row) if v == 1]
    label = {cell: k for k, cell in enumerate(cells)}
    changed = True
    while changed:
        changed = False
        for (i, j) in cells:
            for other in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                if other in label and label[other] < label[(i, j)]:
                    label[(i, j)] = label[other]
                    changed = True
    sizes = {}
    for cell in cells:
        sizes[label[cell]] = sizes.get(label[cell], 0) + 1
    return max(sizes.values(), default=0)
''',
        mutants={
            "count-islands": '''
def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])
    count = 0
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == 1:
                count += 1
                stack = [(i, j)]
                grid[i][j] = 0
                while stack:
                    r, c = stack.pop()
                    for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                        if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                            grid[nr][nc] = 0
                            stack.append((nr, nc))
    return count
''',
            "diagonal": '''
def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])
    best = 0
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == 1:
                grid[i][j] = 0
                stack, area = [(i, j)], 0
                while stack:
                    r, c = stack.pop()
                    area += 1
                    for dr in (-1, 0, 1):
                        for dc in (-1, 0, 1):
                            nr, nc = r + dr, c + dc
                            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                                grid[nr][nc] = 0
                                stack.append((nr, nc))
                best = max(best, area)
    return best
''',
        },
    ),
    dict(
        id="graph-minimum-semesters", parent="course-schedule", topic="graph",
        title=("修完所有课程的最少学期数", "Fewest Semesters to Finish Every Course"),
        summary=("每学期可以修任意多门先修课已完成的课程，求修完全部课程的最少学期数；有环则返回 -1。", "Each semester you may take any number of courses whose prerequisites are done; return the fewest semesters to finish them all, or -1 if impossible."),
        statement=("共有 `n` 门课程，编号 `0..n-1`。`relations[i] = [a, b]` 表示必须先修完课程 `b`，才能修课程 `a`。\n\n每个学期可以同时修**任意多门**课程，只要它们的先修课程都已在之前的学期修完。返回修完所有课程所需的**最少学期数**；如果无法修完（存在循环依赖），返回 `-1`。",
                   "There are `n` courses numbered `0..n-1`. `relations[i] = [a, b]` means course `b` must be completed before course `a`.\n\nIn each semester you may take **any number** of courses as long as all their prerequisites were completed in earlier semesters. Return the **fewest semesters** needed to finish every course, or `-1` if that is impossible because of a cyclic dependency."),
        difficulty="medium", skills=["topological sort", "BFS by levels"],
        differences=[("output", ("从“能否完成”变成“最少需要几轮”，答案等于拓扑排序的层数。", "From whether it is possible to how many rounds it takes; the answer is the number of topological levels.")),
                     ("reasoning", ("需要按层处理队列，而不是一个个取出。", "The queue must be processed level by level instead of one node at a time."))],
        transfer=("Kahn 拓扑排序（入度为 0 入队、删除出边）保持不变，环的判断也不变；新增的是按层计数，层数就是学期数。",
                  "Kahn's topological sort and its cycle test carry over unchanged; the addition is counting levels, which are semesters."),
        entry="minimumSemesters", params=[("n", "int"), ("relations", "int[][]")], returns="int",
        constraints=[("1 ≤ n ≤ 5000，0 ≤ relations.length ≤ 5000，关系互不重复且 a ≠ b", "1 ≤ n ≤ 5000, 0 ≤ relations.length ≤ 5000, distinct pairs with a ≠ b")],
        examples=[[3, [[1, 0], [2, 0]]], [3, [[1, 0], [2, 1], [0, 2]]], [4, [[1, 0], [2, 1], [3, 0]]]],
        boundary=[[1, []], [2, []], [2, [[1, 0]]], [2, [[1, 0], [0, 1]]], [4, [[3, 2], [2, 1], [1, 0]]]],
        inputs=[{"type": "int", "min": 1, "max": 5000}, {"type": "int[][]"}],
        hooks='''
def adjust(args, rng, size):
    n = rng.randint(1, 7) if size == "small" else 5000
    edges = rng.randint(0, min(9, n * n)) if size == "small" else 5000
    order = list(range(n))
    rng.shuffle(order)
    rank = {course: i for i, course in enumerate(order)}
    pairs = set()
    tries = 0
    while len(pairs) < edges and tries < edges * 20:
        tries += 1
        a, b = rng.randrange(n), rng.randrange(n)
        if a != b and rank[b] < rank[a]:
            pairs.add((a, b))
    pairs = [list(p) for p in pairs]
    if pairs and rng.random() < 0.3:
        a, b = rng.choice(pairs)
        if [b, a] not in pairs:
            pairs.append([b, a])
    rng.shuffle(pairs)
    return [n, pairs]
''',
        hints=[("把第一学期能修的课都放进队列：哪些课？", "Which courses can be taken in the first semester? Put them all in the queue."),
               ("一个学期结束后，修完的课会让一些后续课程的入度变为 0，它们就是下一学期能修的课。", "When a semester ends, finished courses drop some successors to in-degree 0; those form the next semester."),
               ("按层处理队列并计数层数；若最终修完的课程少于 n，返回 -1。", "Process the queue level by level and count the levels; return -1 if fewer than n courses were taken.")],
        reference='''
def minimumSemesters(n, relations):
    indegree = [0] * n
    after = [[] for _ in range(n)]
    for a, b in relations:
        after[b].append(a)
        indegree[a] += 1
    level = [i for i in range(n) if indegree[i] == 0]
    taken = semesters = 0
    while level:
        semesters += 1
        taken += len(level)
        nxt = []
        for course in level:
            for later in after[course]:
                indegree[later] -= 1
                if indegree[later] == 0:
                    nxt.append(later)
        level = nxt
    return semesters if taken == n else -1
''',
        oracle='''
def minimumSemesters(n, relations):
    done = set()
    semesters = 0
    while len(done) < n:
        ready = [c for c in range(n) if c not in done and all(b in done for a, b in relations if a == c)]
        if not ready:
            return -1
        done.update(ready)
        semesters += 1
    return semesters
''',
        mutants={
            "possible-only": '''
def minimumSemesters(n, relations):
    indegree = [0] * n
    after = [[] for _ in range(n)]
    for a, b in relations:
        after[b].append(a)
        indegree[a] += 1
    queue = [i for i in range(n) if indegree[i] == 0]
    taken = 0
    while queue:
        course = queue.pop()
        taken += 1
        for later in after[course]:
            indegree[later] -= 1
            if indegree[later] == 0:
                queue.append(later)
    return 1 if taken == n else -1
''',
            "count-courses": '''
def minimumSemesters(n, relations):
    indegree = [0] * n
    after = [[] for _ in range(n)]
    for a, b in relations:
        after[b].append(a)
        indegree[a] += 1
    queue = [i for i in range(n) if indegree[i] == 0]
    taken = 0
    while queue:
        course = queue.pop()
        taken += 1
        for later in after[course]:
            indegree[later] -= 1
            if indegree[later] == 0:
                queue.append(later)
    return taken if taken == n else -1
''',
        },
    ),
    dict(
        id="design-min-queue", parent="min-stack", topic="design",
        title=("支持取最小值的队列", "A Queue with Minimum Lookup"),
        summary=("设计队列：push 从队尾加入，pop 从队首移除，getMin 返回队列中的最小值，均摊 O(1)。", "Design a queue: push adds at the back, pop removes from the front, and getMin returns the minimum, all amortized O(1)."),
        statement=("实现类 `MinQueue`：\n\n- `push(val)`：把 `val` 加到队尾；\n- `pop()`：移除队首元素；\n- `front()`：返回队首元素；\n- `getMin()`：返回队列中当前的最小值。\n\n`pop`、`front`、`getMin` 只会在队列非空时调用。所有操作要求均摊 O(1)。",
                   "Implement the class `MinQueue`:\n\n- `push(val)` adds `val` at the back;\n- `pop()` removes the front element;\n- `front()` returns the front element;\n- `getMin()` returns the current minimum.\n\n`pop`, `front`, and `getMin` are only called on a non-empty queue. Every operation must run in amortized O(1)."),
        difficulty="medium", skills=["monotonic deque", "amortized analysis"],
        differences=[("input-structure", ("数据从栈（后进先出）变成队列（先进先出），最先离开的是最早加入的元素。", "The container changes from a stack (LIFO) to a queue (FIFO), so the oldest element leaves first.")),
                     ("reasoning", ("“入栈时记下当前最小值”不再成立，因为最小值可能从队首离开；需要单调队列或双栈。", "Recording the minimum at push time no longer works because the minimum can leave from the front; a monotonic deque or two stacks are needed."))],
        transfer=("“维护辅助结构，使最小值始终可直接读取”的思路保留；变化在于删除发生在另一端，因此辅助结构要改成单调递增的双端队列。",
                  "The idea of an auxiliary structure that keeps the minimum directly readable carries over; because removal happens at the other end, the auxiliary structure becomes an increasing deque."),
        entry="MinQueue", params=DESIGN_PARAMS, returns="json",
        shape={"kind": "design", "className": "MinQueue", "constructorParams": [],
               "methods": [{"name": "push", "params": [{"name": "val", "type": "int"}], "returns": "void"},
                           {"name": "pop", "params": [], "returns": "void"},
                           {"name": "front", "params": [], "returns": "int"},
                           {"name": "getMin", "params": [], "returns": "int"}]},
        constraints=[("-10⁹ ≤ val ≤ 10⁹，调用总次数 ≤ 3×10⁴", "-10⁹ ≤ val ≤ 10⁹, at most 3×10⁴ calls")],
        examples=[[["MinQueue", "push", "push", "push", "getMin", "pop", "getMin", "front"], [[], [3], [1], [2], [], [], [], []]],
                  [["MinQueue", "push", "push", "getMin", "pop", "getMin"], [[], [1], [5], [], [], []]]],
        boundary=[[["MinQueue", "push", "getMin", "front"], [[], [7], [], []]], [["MinQueue", "push", "push", "pop", "getMin"], [[], [2], [2], [], []]],
                  [["MinQueue", "push", "pop", "push", "getMin"], [[], [1], [], [9], []]]],
        inputs=[{"type": "string[]"}, {"type": "json"}],
        hooks='''
def adjust(args, rng, size):
    count = rng.randint(1, 12) if size == "small" else 8000
    low, high = (-5, 5) if size == "small" else (-1000000000, 1000000000)
    ops, values, length = ["MinQueue"], [[]], 0
    for _ in range(count):
        kind = "push" if length == 0 else rng.choice(["push", "push", "pop", "front", "getMin"])
        ops.append(kind)
        if kind == "push":
            values.append([rng.randint(low, high)])
            length += 1
        else:
            values.append([])
            if kind == "pop":
                length -= 1
    return [ops, values]
''',
        hints=[("最小值在队首被弹出后，下一个最小值是谁？它一定在队首之后。", "When the minimum leaves from the front, who is the next minimum? It must come after it."),
               ("新元素 x 加入时，队列里比 x 大的旧元素会先于 x 离开，所以它们再也不会成为最小值。", "When x arrives, older elements larger than x leave before x, so they can never be the minimum again."),
               ("维护单调递增的双端队列：push 时从尾部弹出所有 > x 的元素再加入 x；pop 时若队首值等于被移除的值则同时弹出。", "Keep an increasing deque: on push pop every tail element > x, then append x; on pop, remove the deque front when it equals the removed value.")],
        reference='''
from collections import deque
class MinQueue:
    def __init__(self):
        self.items = deque()
        self.mins = deque()

    def push(self, val):
        self.items.append(val)
        while self.mins and self.mins[-1] > val:
            self.mins.pop()
        self.mins.append(val)

    def pop(self):
        value = self.items.popleft()
        if self.mins[0] == value:
            self.mins.popleft()

    def front(self):
        return self.items[0]

    def getMin(self):
        return self.mins[0]
''',
        oracle='''
class MinQueue:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append(val)

    def pop(self):
        self.items.pop(0)

    def front(self):
        return self.items[0]

    def getMin(self):
        return min(self.items)
''',
        mutants={
            "stack-min": '''
class MinQueue:
    def __init__(self):
        self.items = []

    def push(self, val):
        self.items.append((val, val if not self.items else min(val, self.items[-1][1])))

    def pop(self):
        self.items.pop(0)

    def front(self):
        return self.items[0][0]

    def getMin(self):
        return self.items[-1][1]
''',
            "strict-pop": '''
from collections import deque
class MinQueue:
    def __init__(self):
        self.items = deque()
        self.mins = deque()

    def push(self, val):
        self.items.append(val)
        while self.mins and self.mins[-1] >= val:
            self.mins.pop()
        self.mins.append(val)

    def pop(self):
        value = self.items.popleft()
        if self.mins[0] == value:
            self.mins.popleft()

    def front(self):
        return self.items[0]

    def getMin(self):
        return self.mins[0]
''',
        },
    ),
    dict(
        id="design-mru-cache", parent="lru-cache", topic="design",
        title=("最近最常使用淘汰缓存", "Most-Recently-Used Eviction Cache"),
        summary=("实现固定容量的缓存，超出容量时淘汰最近一次被访问的键（MRU）。", "Implement a fixed-capacity cache that, when over capacity, evicts the key used most recently before the new insertion (MRU)."),
        statement=("实现类 `MRUCache(capacity)`：\n\n- `get(key)`：键存在则返回值并把它标记为“最近使用”，否则返回 `-1`；\n- `put(key, value)`：键存在则更新值并标记为最近使用；键不存在时，如果缓存已满，先淘汰**当前最近使用**的键，再插入新键（新键成为最近使用）。\n\n两个操作都要求 O(1)。",
                   "Implement the class `MRUCache(capacity)`:\n\n- `get(key)` returns the value and marks the key most recently used, or returns `-1`;\n- `put(key, value)` updates an existing key and marks it most recently used; for a new key, if the cache is full, first evict the **current most recently used** key, then insert the new key, which becomes the most recently used.\n\nBoth operations must be O(1)."),
        difficulty="medium", skills=["hash map + linked list", "usage ordering"],
        differences=[("reasoning", ("淘汰对象从“最久未用”变成“最近使用”，即从使用顺序的另一端淘汰。", "The victim changes from least recently used to most recently used, so eviction happens at the other end of the usage order.")),
                     ("constraints", ("淘汰发生在插入新键之前，否则会把刚插入的键淘汰掉。", "Eviction must happen before inserting the new key, otherwise the newcomer would be evicted."))],
        transfer=("哈希表 + 按使用顺序排列的链表这一组合完全保留；需要重新思考的是淘汰哪一端，以及淘汰与插入的先后顺序。",
                  "The hash map plus usage-ordered list stays as is; what must be rethought is which end to evict and whether eviction precedes insertion."),
        entry="MRUCache", params=DESIGN_PARAMS, returns="json",
        shape={"kind": "design", "className": "MRUCache", "constructorParams": [{"name": "capacity", "type": "int"}],
               "methods": [{"name": "get", "params": [{"name": "key", "type": "int"}], "returns": "int"},
                           {"name": "put", "params": [{"name": "key", "type": "int"}, {"name": "value", "type": "int"}], "returns": "void"}]},
        constraints=[("1 ≤ capacity ≤ 1000，0 ≤ key ≤ 10⁴，0 ≤ value ≤ 10⁵，调用总次数 ≤ 2×10⁴", "1 ≤ capacity ≤ 1000, 0 ≤ key ≤ 10⁴, 0 ≤ value ≤ 10⁵, at most 2×10⁴ calls")],
        examples=[[["MRUCache", "put", "put", "get", "put", "get", "get"], [[2], [1, 1], [2, 2], [1], [3, 3], [1], [2]]],
                  [["MRUCache", "put", "put", "put", "get", "get"], [[2], [1, 1], [2, 2], [3, 3], [1], [2]]]],
        boundary=[[["MRUCache", "put", "put", "get"], [[1], [1, 1], [2, 2], [1]]], [["MRUCache", "get"], [[1], [5]]],
                  [["MRUCache", "put", "put", "put", "get"], [[1], [1, 1], [1, 2], [2, 3], [1]]]],
        inputs=[{"type": "string[]"}, {"type": "json"}],
        hooks='''
def adjust(args, rng, size):
    capacity = rng.randint(1, 3) if size == "small" else 100
    count = rng.randint(1, 12) if size == "small" else 8000
    keys = 5 if size == "small" else 300
    ops, values = ["MRUCache"], [[capacity]]
    for _ in range(count):
        if rng.random() < 0.5:
            ops.append("get")
            values.append([rng.randrange(keys)])
        else:
            ops.append("put")
            values.append([rng.randrange(keys), rng.randint(0, 100000)])
    return [ops, values]
''',
        hints=[("与 LRU 相比，按使用顺序排列的结构还需要吗？", "Compared with LRU, do you still need the usage-ordered structure?"),
               ("需要：最近使用的键位于顺序的一端，淘汰就从这一端进行。", "Yes: the most recently used key sits at one end of the order, and eviction happens at that end."),
               ("插入新键前若已满，先弹出“最近”一端的键，再插入新键并标记为最近使用；Python 中可用 OrderedDict 的 popitem(last=True)。", "When full, pop the key at the recent end before inserting the newcomer and marking it recent; in Python, OrderedDict.popitem(last=True) does it.")],
        reference='''
from collections import OrderedDict
class MRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]

    def put(self, key, value):
        if key in self.items:
            self.items[key] = value
            self.items.move_to_end(key)
            return
        if len(self.items) >= self.capacity:
            self.items.popitem(last=True)
        self.items[key] = value
''',
        oracle='''
class MRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.order = []
        self.values = {}

    def get(self, key):
        if key not in self.values:
            return -1
        self.order.remove(key)
        self.order.append(key)
        return self.values[key]

    def put(self, key, value):
        if key in self.values:
            self.values[key] = value
            self.order.remove(key)
            self.order.append(key)
            return
        if len(self.order) == self.capacity:
            victim = self.order.pop()
            del self.values[victim]
        self.order.append(key)
        self.values[key] = value
''',
        mutants={
            "lru": '''
from collections import OrderedDict
class MRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]

    def put(self, key, value):
        self.items[key] = value
        self.items.move_to_end(key)
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)
''',
            "evict-after-insert": '''
from collections import OrderedDict
class MRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]

    def put(self, key, value):
        self.items[key] = value
        self.items.move_to_end(key)
        if len(self.items) > self.capacity:
            self.items.popitem(last=True)
''',
        },
    ),
]
