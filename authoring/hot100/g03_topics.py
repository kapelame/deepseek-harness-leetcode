"""Topic 链表 with lesson and seeded variants."""

PROBLEMS = []

TOPICS = [
    dict(
        id="linked-list", order=9,
        title=("链表：指针重连、哑节点与快慢指针", "Linked lists: relinking, dummy nodes, and fast/slow pointers"),
        summary=("链表题的核心是安全地改指针：先保存要用到的节点再改写，用哑节点消除头部特例，用快慢指针找中点、判环。",
                 "Linked-list problems are about changing pointers safely: save what you still need before overwriting, use a dummy node to remove head special cases, and use fast/slow pointers to find middles and cycles."),
        prerequisites=["two-pointers"],
        problems=["reverse-linked-list"],
        variants=["linked-list-reverse-between", "linked-list-merge-distinct"],
        lesson=dict(
            motivation=("音乐播放器把歌单存成链表：每首歌只知道下一首是谁。现在要把歌单倒过来播放。\n\n如果它是数组，交换首尾即可；但链表不能随机访问，只能沿 next 一个个走。更麻烦的是，一旦把某个节点的 next 改掉，原来的后继就丢失了。\n\n链表题几乎都是这种“边走边改指针”的问题。只要掌握三件事——改写前先保存、用哑节点统一头部、用快慢指针测量位置——大多数题都能写得又短又对。",
                        "A music player stores a playlist as a linked list: each song only knows the next one. Now the playlist must play in reverse.\n\nWith an array you would swap ends, but a list has no random access; you walk node by node along next. Worse, once a node's next is overwritten, its old successor is lost.\n\nAlmost every linked-list problem is this kind of walk-and-relink task. Master three moves, saving before overwriting, a dummy node for a uniform head, and fast/slow pointers for positions, and most solutions become short and correct."),
            strategy=("**先存后改**：改写 `cur.next` 之前用变量保存原后继，例如反转：`nxt = cur.next; cur.next = prev; prev = cur; cur = nxt`。\n\n**哑节点**：在头部前放一个 `dummy`，删除头节点、合并链表时就不需要特判，最后返回 `dummy.next`。\n\n**快慢指针**：快指针一次两步、慢指针一次一步——快指针到尾时慢指针在中点；有环时二者必相遇，再从头同速前进可找到环入口。\n\n**前后指针**：让一个指针先走 n 步，两者同速前进，可定位倒数第 n 个节点。\n\n**复杂度**：这些技巧都是 O(n) 时间、O(1) 额外空间。画图——写出每一步指针的指向——是调试链表最可靠的方法。",
                      "**Save, then relink**: before overwriting `cur.next`, keep the old successor; reversal is `nxt = cur.next; cur.next = prev; prev = cur; cur = nxt`.\n\n**Dummy node**: put `dummy` before the head so deleting the head or merging needs no special case; return `dummy.next`.\n\n**Fast and slow pointers**: fast moves two steps, slow one; when fast reaches the end, slow is at the middle. With a cycle they must meet, and walking again from the head at equal speed finds the cycle entry.\n\n**Leader and follower**: let one pointer start n steps ahead and move both together to find the n-th node from the end.\n\n**Complexity**: all of these run in O(n) time and O(1) extra space. Drawing every pointer at each step is the most reliable way to debug a list."),
            example=dict(
                title=("例：反转 1 → 2 → 3", "Example: reversing 1 → 2 → 3"),
                body=("prev 是已反转部分的头，cur 是待处理的节点。", "prev is the head of the reversed part; cur is the next node to process."),
                columns=["prev", "cur", "nxt", "reversed part"],
                trace=[
                    ({"prev": "null", "cur": "1", "nxt": "2", "reversed part": "1 → null"}, ("先保存 nxt = 2，再让 1 指向 prev。", "Save nxt = 2, then point 1 at prev.")),
                    ({"prev": "1", "cur": "2", "nxt": "3", "reversed part": "2 → 1 → null"}, ("prev、cur 各前进一步，重复同样的三步。", "prev and cur advance; repeat the same three moves.")),
                    ({"prev": "2", "cur": "3", "nxt": "null", "reversed part": "3 → 2 → 1 → null"}, ("cur 变成 null 时结束。", "Stop when cur becomes null.")),
                    ({"prev": "3", "cur": "null", "nxt": "—", "reversed part": "返回 prev = 3"}, ("prev 就是新的头节点。", "prev is the new head.")),
                ],
            ),
            check=[
                dict(id="save-first", prompt=("反转链表时，如果先执行 cur.next = prev 而不保存原来的 cur.next，会发生什么？", "When reversing, what happens if you run cur.next = prev without saving the old cur.next?"),
                     options=[("剩余的链表丢失，无法继续前进", "The rest of the list is lost and you cannot continue"),
                              ("没有影响，Python 会自动保存", "Nothing; Python saves it automatically"),
                              ("链表会出现环", "The list gains a cycle")],
                     answer=0, explanation=("cur.next 是到达后续节点的唯一途径，覆盖前必须保存。", "cur.next is the only way to reach the remaining nodes, so it must be saved before overwriting.")),
                dict(id="dummy", prompt=("删除倒数第 n 个节点时，哑节点解决了什么问题？", "When removing the n-th node from the end, what does the dummy node solve?"),
                     options=[("待删的是头节点时也有前驱，不需要特判", "The head has a predecessor too, so deleting it needs no special case"),
                              ("让链表长度变成偶数", "It makes the length even"),
                              ("避免使用快慢指针", "It avoids fast/slow pointers")],
                     answer=0, explanation=("删除需要前驱节点；哑节点保证每个真实节点都有前驱。", "Deletion needs a predecessor; the dummy gives every real node one.")),
            ],
            practice="reverse-linked-list",
            reflection=("画出反转 1 → 2 → 3 时每一步 prev、cur、nxt 的指向，并解释循环为什么在 cur 为 null 时结束。", "Draw prev, cur, and nxt at each step of reversing 1 → 2 → 3, and explain why the loop stops when cur is null."),
        ),
    ),
]

LIST_HELPERS = '''
def _values(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

def _build(values):
    dummy = ListNode(0)
    tail = dummy
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next
'''

VARIANTS = [
    dict(
        id="linked-list-reverse-between", parent="reverse-linked-list", topic="linked-list",
        title=("反转链表的一段", "Reverse One Segment of a List"),
        summary=("只反转第 left 到第 right 个节点（从 1 开始计数），其余部分保持不变。", "Reverse only nodes left through right (1-indexed) and keep the rest unchanged."),
        statement=("给定单链表头节点 `head` 和两个整数 `left ≤ right`，把链表中从第 `left` 个到第 `right` 个节点（位置从 1 开始）这一段反转，返回新的头节点。\n\n要求只遍历一次，并通过重连节点完成，而不是修改节点的值。",
                   "Given the head of a singly linked list and integers `left ≤ right`, reverse the nodes from position `left` to position `right` (1-indexed) and return the head.\n\nTraverse the list once and relink nodes rather than changing their values."),
        difficulty="medium", skills=["in-place reversal", "dummy node", "splicing"],
        differences=[("input-structure", ("多了 left、right 两个参数，只处理链表的中间一段。", "Two more parameters, left and right, restrict the work to a middle segment.")),
                     ("reasoning", ("反转后的子段必须重新接回前驱和后继，left = 1 时还涉及头节点。", "The reversed segment must be spliced back to its predecessor and successor, which involves the head when left = 1."))],
        transfer=("“先存后改”的反转三步保持不变；新增的是定位段前驱、在段内反转固定次数，以及把段两端接回去。",
                  "The save-then-relink reversal stays; new are locating the segment's predecessor, reversing a fixed number of steps, and splicing both ends back."),
        entry="reverseBetween", params=[("head", "linked-list"), ("left", "int"), ("right", "int")], returns="linked-list",
        constraints=[("1 ≤ n ≤ 500，-500 ≤ Node.val ≤ 500，1 ≤ left ≤ right ≤ n", "1 ≤ n ≤ 500, -500 ≤ Node.val ≤ 500, 1 ≤ left ≤ right ≤ n")],
        examples=[[[1, 2, 3, 4, 5], 2, 4], [[5], 1, 1]],
        boundary=[[[1, 2], 1, 2], [[1, 2, 3], 1, 1], [[1, 2, 3], 3, 3], [[1, 2, 3], 1, 3], [[1, 2, 3, 4], 2, 3]],
        inputs=[{"type": "linked-list", "minLength": 1, "maxLength": 500, "smallMaxLength": 8, "largeLength": 500, "min": -500, "max": 500, "smallMin": -9, "smallMax": 9},
                {"type": "int", "min": 1, "max": 1}, {"type": "int", "min": 1, "max": 1}],
        hooks='''
def adjust(args, rng, size):
    values, _, _ = args
    left = rng.randint(1, len(values))
    right = rng.randint(left, len(values))
    return [values, left, right]
''',
        hints=[("先找到第 left-1 个节点（段的前驱），哑节点让 left = 1 的情况也有前驱。", "First find node left-1, the segment's predecessor; a dummy node gives left = 1 one too."),
               ("在段内做 right-left 次“头插”：把 cur 后面的节点摘下来插到前驱后面。", "Inside the segment, perform right-left head insertions: unhook the node after cur and insert it right after the predecessor."),
               ("或者正常反转这一段，再把前驱指向新段头、原段头指向段后的第一个节点。", "Or reverse the segment normally, then point the predecessor at the new segment head and the old head at the node after the segment.")],
        reference='''
def reverseBetween(head, left, right):
    dummy = ListNode(0, head)
    before = dummy
    for _ in range(left - 1):
        before = before.next
    cur = before.next
    for _ in range(right - left):
        moved = cur.next
        cur.next = moved.next
        moved.next = before.next
        before.next = moved
    return dummy.next
''',
        oracle=LIST_HELPERS + '''
def reverseBetween(head, left, right):
    values = _values(head)
    values[left - 1:right] = values[left - 1:right][::-1]
    return _build(values)
''',
        mutants={
            "whole-list": '''
def reverseBetween(head, left, right):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev
''',
            "exclusive-right": '''
def reverseBetween(head, left, right):
    dummy = ListNode(0, head)
    before = dummy
    for _ in range(left - 1):
        before = before.next
    cur = before.next
    for _ in range(right - left - 1):
        if cur.next is None:
            break
        moved = cur.next
        cur.next = moved.next
        moved.next = before.next
        before.next = moved
    return dummy.next
''',
            "zero-based": '''
def reverseBetween(head, left, right):
    dummy = ListNode(0, head)
    before = dummy
    for _ in range(left):
        if before.next is None:
            break
        before = before.next
    cur = before.next
    for _ in range(right - left):
        if cur is None or cur.next is None:
            break
        moved = cur.next
        cur.next = moved.next
        moved.next = before.next
        before.next = moved
    return dummy.next
''',
        },
    ),
    dict(
        id="linked-list-merge-distinct", parent="merge-two-sorted-lists", topic="linked-list",
        title=("合并为不重复的有序链表", "Merge into a Sorted List of Distinct Values"),
        summary=("合并两个非递减链表，结果中每个值只出现一次。", "Merge two non-decreasing lists so that each value appears only once in the result."),
        statement=("给定两个**非递减**的单链表 `list1` 和 `list2`（各自内部也可能有重复值），把它们合并成一个**严格递增**的链表并返回头节点：所有出现过的值都要保留，但每个值只出现一次。",
                   "Given two **non-decreasing** singly linked lists `list1` and `list2` (each may contain repeated values), merge them into one **strictly increasing** list and return its head: every value that appears must be kept, but only once."),
        difficulty="easy", skills=["merging sorted sequences", "deduplication"],
        differences=[("output", ("输出要求严格递增，跨两条链表和同一条链表内的重复值都要去掉。", "The output must be strictly increasing, dropping duplicates both across and within the lists.")),
                     ("reasoning", ("追加节点前要与结果的最后一个值比较。", "Before appending a node, compare it with the last value in the result."))],
        transfer=("“哑节点 + 每次取较小的头”这一合并框架保持不变；新增的判断是：只有当候选值大于结果尾部的值时才追加。",
                  "The merge frame of a dummy node and taking the smaller head carries over; the new check appends a candidate only when it exceeds the result's last value."),
        entry="mergeDistinct", params=[("list1", "linked-list"), ("list2", "linked-list")], returns="linked-list",
        constraints=[("每个链表 0 ≤ 节点数 ≤ 1000，-1000 ≤ Node.val ≤ 1000", "each list has 0 ≤ nodes ≤ 1000, -1000 ≤ Node.val ≤ 1000")],
        examples=[[[1, 2, 4], [1, 3, 4]], [[1, 1, 1], []], [[], []]],
        boundary=[[[], [0]], [[2, 2], [2]], [[-1000], [1000]], [[1, 3, 5], [2, 4, 6]]],
        inputs=[{"type": "linked-list", "minLength": 0, "smallMaxLength": 6, "largeLength": 1000, "min": -1000, "max": 1000, "smallMin": -3, "smallMax": 3, "sorted": "asc"},
                {"type": "linked-list", "minLength": 0, "smallMaxLength": 6, "largeLength": 1000, "min": -1000, "max": 1000, "smallMin": -3, "smallMax": 3, "sorted": "asc"}],
        hints=[("先按普通方式合并，想想重复值会出现在结果的什么位置。", "Merge as usual first and notice where duplicates would land in the result."),
               ("结果是有序的，所以重复值一定紧挨着最后追加的节点。", "The result is sorted, so a duplicate always sits right after the last appended node."),
               ("每次取出较小的头节点后，只有当 tail 是哑节点或 tail.val < 它的值时才接上。", "After taking the smaller head, attach it only when tail is the dummy or tail.val is smaller than its value.")],
        reference='''
def mergeDistinct(list1, list2):
    dummy = tail = ListNode(0)
    while list1 or list2:
        if list2 is None or (list1 is not None and list1.val <= list2.val):
            node, list1 = list1, list1.next
        else:
            node, list2 = list2, list2.next
        if tail is dummy or tail.val < node.val:
            tail.next = node
            tail = node
    tail.next = None
    return dummy.next
''',
        oracle=LIST_HELPERS + '''
def mergeDistinct(list1, list2):
    return _build(sorted(set(_values(list1)) | set(_values(list2))))
''',
        mutants={
            "keeps-duplicates": '''
def mergeDistinct(list1, list2):
    dummy = tail = ListNode(0)
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next, list1 = list1, list1.next
        else:
            tail.next, list2 = list2, list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next
''',
            "cross-only": '''
def mergeDistinct(list1, list2):
    dummy = tail = ListNode(0)
    while list1 and list2:
        if list1.val == list2.val:
            tail.next = list1
            list1, list2 = list1.next, list2.next
        elif list1.val < list2.val:
            tail.next, list1 = list1, list1.next
        else:
            tail.next, list2 = list2, list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next
''',
        },
    ),
]
