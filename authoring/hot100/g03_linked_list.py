"""Hot 100 group 链表 (LRU Cache lives with the design topic)."""

ORIGINAL = ("（本课程原创简述，完整题面见 LeetCode 官方页面。）", " (Original summary written for Learn; see LeetCode for the official statement.)")


def summary(zh, en):
    return (zh + ORIGINAL[0], en + ORIGINAL[1])


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

PROBLEMS = [
    dict(
        slug="intersection-of-two-linked-lists", topics=["linked-list"], entry="getIntersectionNode",
        params=[("intersectVal", "int"), ("listA", "linked-list"), ("listB", "linked-list"), ("skipA", "int"), ("skipB", "int")],
        returns="json", shape={"kind": "harness", "name": "linked-list-intersection"},
        summary=summary("两个单链表可能从某个节点开始共用后半段。返回它们相交的第一个节点；不相交则返回 null。测试输入给出链表内容和相交位置，你的函数只接收两个头节点。",
                        "Two singly linked lists may share a common tail. Return the first shared node, or null if they never meet. Test inputs describe both lists and the meeting point; your function receives only the two heads."),
        constraints=[("1 ≤ m, n ≤ 3×10⁴，1 ≤ Node.val ≤ 10⁵；不能修改链表结构", "1 ≤ m, n ≤ 3×10⁴, 1 ≤ Node.val ≤ 10⁵; do not modify the lists")],
        hints=[("相交指的是同一个节点对象，不只是值相等。", "Intersection means the same node object, not just an equal value."),
               ("如果两条链表长度相同，同步前进就会在交点相遇。长度不同时怎么办？", "If both lists had equal length, walking in lockstep would meet at the junction. What if they differ?"),
               ("指针 a 走完 A 后转到 B 的头，指针 b 走完 B 后转到 A 的头；两者走过的总长度相同，会在交点（或同时为 null）相遇。", "Pointer a walks A then B, pointer b walks B then A; both cover the same total length and meet at the junction, or at null together.")],
        explanation=("双指针换道：两个指针各自走完自己的链表后切到对方的头部，走过的总步数相同，因此同时到达交点或同时到达末尾。时间 O(m + n)，空间 O(1)。",
                     "Switch-track pointers: each pointer finishes its own list and then starts on the other's head, so both cover the same distance and reach the junction, or the end, together. O(m + n) time, O(1) space."),
        boundary=[[1, [1], [1], 0, 0], [0, [1], [2], 1, 1], [3, [1, 2, 3], [3], 2, 0], [0, [5, 6], [7], 2, 1]],
        inputs=[{"type": "int", "min": 0, "max": 0}, {"type": "linked-list", "minLength": 1, "smallMaxLength": 6, "largeLength": 20000, "min": 1, "max": 100000, "smallMin": 1, "smallMax": 9},
                {"type": "linked-list", "minLength": 1, "smallMaxLength": 6, "largeLength": 20000, "min": 1, "max": 100000, "smallMin": 1, "smallMax": 9},
                {"type": "int", "min": 0, "max": 0}, {"type": "int", "min": 0, "max": 0}],
        hooks='''
def adjust(args, rng, size):
    _, list_a, list_b, _, _ = args
    if rng.random() < 0.25:
        return [0, list_a, list_b, len(list_a), len(list_b)]
    skip_a = rng.randrange(len(list_a))
    skip_b = rng.randrange(len(list_b))
    list_b = list_b[:skip_b] + list_a[skip_a:]
    return [list_a[skip_a], list_a, list_b, skip_a, skip_b]
''',
        reference='''
def getIntersectionNode(headA, headB):
    a, b = headA, headB
    while a is not b:
        a = a.next if a else headB
        b = b.next if b else headA
    return a
''',
        oracle='''
def getIntersectionNode(headA, headB):
    nodes = []
    while headA:
        nodes.append(headA)
        headA = headA.next
    while headB:
        for node in nodes:
            if node is headB:
                return headB
        headB = headB.next
    return None
''',
    ),
    dict(
        slug="reverse-linked-list", topics=["linked-list"], entry="reverseList",
        params=[("head", "linked-list")], returns="linked-list",
        summary=summary("反转一个单链表，返回新的头节点。", "Reverse a singly linked list and return the new head."),
        constraints=[("0 ≤ 节点数 ≤ 5000，-5000 ≤ Node.val ≤ 5000", "0 ≤ nodes ≤ 5000, -5000 ≤ Node.val ≤ 5000")],
        hints=[("反转后，每个节点的 next 应该指向谁？", "After reversal, where should each node's next point?"),
               ("改写 cur.next 之前，先用变量保存原来的 cur.next，否则后面就丢了。", "Save the old cur.next before overwriting it, or the rest of the list is lost."),
               ("维护 prev 和 cur：nxt = cur.next；cur.next = prev；prev = cur；cur = nxt。", "Keep prev and cur: nxt = cur.next; cur.next = prev; prev = cur; cur = nxt.")],
        explanation=("迭代地把每个节点的 next 指向前一个节点，prev 最终就是新头。时间 O(n)，空间 O(1)。",
                     "Iteratively point each node's next at the previous node; prev ends as the new head. O(n) time, O(1) space."),
        boundary=[[[]], [[1]], [[1, 2]], [[-5000, 5000, 0]]],
        inputs=[{"type": "linked-list", "minLength": 0, "smallMaxLength": 8, "largeLength": 5000, "min": -5000, "max": 5000, "smallMin": -9, "smallMax": 9}],
        reference='''
def reverseList(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev
''',
        oracle=LIST_HELPERS + '''
def reverseList(head):
    return _build(list(reversed(_values(head))))
''',
    ),
    dict(
        slug="palindrome-linked-list", topics=["linked-list"], entry="isPalindrome",
        params=[("head", "linked-list")], returns="bool",
        summary=summary("判断单链表的值序列正着读和反着读是否相同。进阶要求 O(n) 时间、O(1) 额外空间。",
                        "Report whether the list's values read the same forward and backward. Follow-up: O(n) time and O(1) extra space."),
        constraints=[("1 ≤ 节点数 ≤ 10⁵，0 ≤ Node.val ≤ 9", "1 ≤ nodes ≤ 10⁵, 0 ≤ Node.val ≤ 9")],
        hints=[("最直接的方法：把值复制到数组里再比较。能否不用额外数组？", "The direct way copies values into an array. Can you avoid the extra array?"),
               ("用快慢指针找到中点，然后反转后半段。", "Find the middle with slow and fast pointers, then reverse the second half."),
               ("从头和反转后的后半段同时向后比较；比较结束后可以再反转回来恢复链表。", "Compare from the head and from the reversed half in step; afterwards you can reverse again to restore the list.")],
        explanation=("快慢指针找中点，原地反转后半段并与前半段逐一比较。时间 O(n)，额外空间 O(1)。",
                     "Find the middle with slow and fast pointers, reverse the second half in place, and compare it with the first half. O(n) time, O(1) extra space."),
        boundary=[[[1]], [[1, 2]], [[1, 1]], [[1, 2, 1]], [[1, 2, 2, 1]], [[1, 2, 3, 1]]],
        inputs=[{"type": "linked-list", "minLength": 1, "smallMaxLength": 8, "largeLength": 20000, "min": 0, "max": 9, "smallMin": 0, "smallMax": 2}],
        hooks='''
def adjust(args, rng, size):
    values = args[0]
    if rng.random() < 0.5:
        half = values[:(len(values) + 1) // 2]
        values = half + half[:len(values) // 2][::-1]
    return [values]
''',
        reference='''
def isPalindrome(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    prev = None
    while slow:
        slow.next, prev, slow = prev, slow, slow.next
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left, right = left.next, right.next
    return True
''',
        oracle=LIST_HELPERS + '''
def isPalindrome(head):
    values = _values(head)
    return all(values[i] == values[-1 - i] for i in range(len(values)))
''',
    ),
    dict(
        slug="linked-list-cycle", topics=["linked-list"], entry="hasCycle",
        params=[("head", "linked-list"), ("pos", "int")], returns="bool", shape={"kind": "harness", "name": "linked-list-cycle"},
        summary=summary("判断链表中是否有环（沿 next 走会回到之前访问过的节点）。测试输入用 pos 表示尾节点连回的位置（-1 表示无环），你的函数只接收头节点。",
                        "Report whether the list has a cycle, meaning following next revisits a node. Test inputs use pos for where the tail links back (-1 for none); your function receives only the head."),
        constraints=[("0 ≤ 节点数 ≤ 10⁴，-10⁵ ≤ Node.val ≤ 10⁵；进阶：O(1) 额外空间", "0 ≤ nodes ≤ 10⁴, -10⁵ ≤ Node.val ≤ 10⁵; follow-up: O(1) extra space")],
        hints=[("用集合记录访问过的节点可以做，但需要 O(n) 空间。", "A set of visited nodes works but costs O(n) space."),
               ("两个人在环形跑道上跑，速度不同，会发生什么？", "Two runners on a circular track at different speeds: what happens?"),
               ("慢指针每次走一步、快指针每次走两步；有环必相遇，无环快指针先到 null。", "Slow moves one step, fast moves two; with a cycle they meet, without one fast reaches null first.")],
        explanation=("Floyd 判圈：快指针每步比慢指针多走一个节点，进入环后距离每步缩小 1，必然相遇。时间 O(n)，空间 O(1)。",
                     "Floyd's cycle detection: inside a cycle the fast pointer closes the gap by one node per step, so they must meet. O(n) time, O(1) space."),
        boundary=[[[], -1], [[1], -1], [[1], 0], [[1, 2], 0], [[1, 2], -1], [[1, 2, 3], 2]],
        inputs=[{"type": "linked-list", "minLength": 0, "smallMaxLength": 8, "largeLength": 10000, "min": -100000, "max": 100000, "smallMin": -9, "smallMax": 9},
                {"type": "int", "min": -1, "max": -1}],
        hooks='''
def adjust(args, rng, size):
    values, _ = args
    pos = -1 if not values or rng.random() < 0.4 else rng.randrange(len(values))
    return [values, pos]
''',
        reference='''
def hasCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False
''',
        oracle='''
def hasCycle(head):
    seen = []
    while head:
        for node in seen:
            if node is head:
                return True
        seen.append(head)
        head = head.next
    return False
''',
    ),
    dict(
        slug="linked-list-cycle-ii", topics=["linked-list"], entry="detectCycle",
        params=[("head", "linked-list"), ("pos", "int")], returns="int", shape={"kind": "harness", "name": "linked-list-cycle"},
        summary=summary("如果链表有环，返回环的入口节点；没有环返回 null。结果以入口节点在链表中的下标显示（null 显示为 -1）。不能修改链表。",
                        "If the list has a cycle, return the node where the cycle begins, otherwise null. Results are shown as that node's index in the list (null as -1). Do not modify the list."),
        constraints=[("0 ≤ 节点数 ≤ 10⁴，-10⁵ ≤ Node.val ≤ 10⁵；进阶：O(1) 额外空间", "0 ≤ nodes ≤ 10⁴, -10⁵ ≤ Node.val ≤ 10⁵; follow-up: O(1) extra space")],
        hints=[("先用快慢指针判断是否有环。相遇点和入口点之间有什么关系？", "First detect the cycle with slow and fast pointers. How does the meeting point relate to the entry?"),
               ("设头到入口距离 a，入口到相遇点距离 b，环长 c。快指针走过的路程是慢指针的两倍，可推出 a ≡ c - b (mod c)。", "Let a be head-to-entry, b entry-to-meeting, c the cycle length. Fast travels twice as far as slow, which gives a ≡ c - b (mod c)."),
               ("相遇后，把一个指针放回头部，两个指针都每次走一步，再次相遇处就是入口。", "After meeting, move one pointer back to the head and step both one node at a time; they meet again at the entry.")],
        explanation=("Floyd 算法第二阶段：从头和从相遇点同时出发、同速前进，会在环入口相遇。时间 O(n)，空间 O(1)。",
                     "The second phase of Floyd's algorithm: walking at equal speed from the head and from the meeting point, the pointers meet at the cycle entry. O(n) time, O(1) space."),
        boundary=[[[], -1], [[1], -1], [[1], 0], [[1, 2], 0], [[1, 2], 1], [[3, 2, 0, -4], 1]],
        inputs=[{"type": "linked-list", "minLength": 0, "smallMaxLength": 8, "largeLength": 10000, "min": -100000, "max": 100000, "smallMin": -9, "smallMax": 9},
                {"type": "int", "min": -1, "max": -1}],
        hooks='''
def adjust(args, rng, size):
    values, _ = args
    pos = -1 if not values or rng.random() < 0.3 else rng.randrange(len(values))
    return [values, pos]
''',
        reference='''
def detectCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            slow = head
            while slow is not fast:
                slow = slow.next
                fast = fast.next
            return slow
    return None
''',
        oracle='''
def detectCycle(head):
    seen = []
    while head:
        for node in seen:
            if node is head:
                return head
        seen.append(head)
        head = head.next
    return None
''',
    ),
    dict(
        slug="merge-two-sorted-lists", topics=["linked-list"], entry="mergeTwoLists",
        params=[("list1", "linked-list"), ("list2", "linked-list")], returns="linked-list",
        summary=summary("把两个升序链表合并成一个升序链表，返回合并后的头节点。", "Merge two sorted linked lists into one sorted list and return its head."),
        constraints=[("每个链表 0 ≤ 节点数 ≤ 50，-100 ≤ Node.val ≤ 100，均为非递减", "each list has 0 ≤ nodes ≤ 50, -100 ≤ Node.val ≤ 100, both non-decreasing")],
        hints=[("每一步，结果链表的下一个节点应该来自哪里？", "At each step, where should the next node of the result come from?"),
               ("比较两条链表的当前头节点，取较小的接到结果尾部。", "Compare the two current heads and append the smaller one to the result."),
               ("用一个哑节点（dummy）简化头部处理；一条链表用完后，把另一条剩余部分整体接上。", "A dummy node simplifies the head; when one list runs out, attach the rest of the other.")],
        explanation=("哑节点 + 双指针：每次接上较小的头节点，最后接上剩余部分。时间 O(m + n)，空间 O(1)。",
                     "Dummy node plus two pointers: append the smaller head each time, then attach the remainder. O(m + n) time, O(1) space."),
        boundary=[[[], []], [[], [0]], [[1], []], [[1, 1], [1]], [[-100], [100]]],
        inputs=[{"type": "linked-list", "minLength": 0, "smallMaxLength": 6, "largeLength": 50, "min": -100, "max": 100, "smallMin": -5, "smallMax": 5, "sorted": "asc"},
                {"type": "linked-list", "minLength": 0, "smallMaxLength": 6, "largeLength": 50, "min": -100, "max": 100, "smallMin": -5, "smallMax": 5, "sorted": "asc"}],
        reference='''
def mergeTwoLists(list1, list2):
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
        oracle=LIST_HELPERS + '''
def mergeTwoLists(list1, list2):
    return _build(sorted(_values(list1) + _values(list2)))
''',
    ),
    dict(
        slug="add-two-numbers", topics=["linked-list"], entry="addTwoNumbers",
        params=[("l1", "linked-list"), ("l2", "linked-list")], returns="linked-list",
        summary=summary("两个非负整数以逆序存放在链表中（个位在头部，每个节点一位数字）。返回它们的和，同样以逆序链表表示。",
                        "Two non-negative integers are stored in reverse order, one digit per node with the ones digit first. Return their sum as a list in the same format."),
        constraints=[("每个链表 1 ≤ 节点数 ≤ 100，0 ≤ Node.val ≤ 9，除 0 本身外没有前导零", "each list has 1 ≤ nodes ≤ 100, 0 ≤ Node.val ≤ 9, no leading zeros except the number 0")],
        hints=[("逆序存放有什么好处？想想手算加法从哪一位开始。", "Why is reverse order convenient? Think about where hand addition starts."),
               ("同时遍历两条链表，逐位相加并维护进位。", "Walk both lists together, adding digit by digit with a carry."),
               ("某条链表先结束时把它的数字当作 0；循环结束后若进位为 1，还要追加一个节点。", "Treat a finished list's digit as 0; if a carry of 1 remains at the end, append one more node.")],
        explanation=("模拟竖式加法：逐位相加 (d1 + d2 + carry)，节点值为和的个位，进位为十位。时间 O(max(m, n))，空间 O(1)（不计输出）。",
                     "Simulate column addition: add d1 + d2 + carry digit by digit, store the ones digit, and carry the tens. O(max(m, n)) time, O(1) extra space besides the output."),
        boundary=[[[0], [0]], [[9], [1]], [[9, 9, 9], [1]], [[1], [9, 9]], [[5], [5]]],
        inputs=[{"type": "linked-list", "minLength": 1, "smallMaxLength": 6, "largeLength": 100, "min": 0, "max": 9},
                {"type": "linked-list", "minLength": 1, "smallMaxLength": 6, "largeLength": 100, "min": 0, "max": 9}],
        hooks='''
def adjust(args, rng, size):
    out = []
    for digits in args:
        digits = list(digits)
        if len(digits) > 1 and digits[-1] == 0:
            digits[-1] = rng.randint(1, 9)
        out.append(digits)
    return out
''',
        reference='''
def addTwoNumbers(l1, l2):
    dummy = tail = ListNode(0)
    carry = 0
    while l1 or l2 or carry:
        total = carry + (l1.val if l1 else 0) + (l2.val if l2 else 0)
        carry, digit = divmod(total, 10)
        tail.next = ListNode(digit)
        tail = tail.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next
''',
        oracle=LIST_HELPERS + '''
def addTwoNumbers(l1, l2):
    def number(head):
        return int("".join(str(d) for d in reversed(_values(head))))
    return _build([int(c) for c in reversed(str(number(l1) + number(l2)))])
''',
    ),
    dict(
        slug="remove-nth-node-from-end-of-list", topics=["linked-list"], entry="removeNthFromEnd",
        params=[("head", "linked-list"), ("n", "int")], returns="linked-list",
        summary=summary("删除链表的倒数第 n 个节点，返回新的头节点。尝试只遍历一次。", "Remove the n-th node from the end of the list and return the head. Try to do it in one pass."),
        constraints=[("1 ≤ 节点数 sz ≤ 30，0 ≤ Node.val ≤ 100，1 ≤ n ≤ sz", "1 ≤ sz ≤ 30 nodes, 0 ≤ Node.val ≤ 100, 1 ≤ n ≤ sz")],
        hints=[("不知道长度时，如何定位倒数第 n 个？", "Without knowing the length, how do you find the n-th node from the end?"),
               ("让一个指针先走 n 步，然后两个指针一起走；先走的到达末尾时，后走的在哪里？", "Let one pointer go n steps ahead, then move both; when the leader reaches the end, where is the follower?"),
               ("从哑节点出发，后指针会停在待删节点的前一个，直接跳过它即可；哑节点处理删除头节点的情况。", "Start both from a dummy node so the follower stops just before the target and can skip it; the dummy handles deleting the head.")],
        explanation=("前后指针间隔 n 步，一次遍历定位待删节点的前驱；哑节点统一处理删除头节点。时间 O(sz)，空间 O(1)。",
                     "Two pointers n steps apart find the predecessor of the target in one pass; a dummy node handles removing the head. O(sz) time, O(1) space."),
        boundary=[[[1], 1], [[1, 2], 1], [[1, 2], 2], [[1, 2, 3], 3]],
        inputs=[{"type": "linked-list", "minLength": 1, "maxLength": 30, "smallMaxLength": 8, "largeLength": 30, "min": 0, "max": 100}, {"type": "int", "min": 1, "max": 1}],
        hooks='''
def adjust(args, rng, size):
    values, _ = args
    return [values, rng.randint(1, len(values))]
''',
        reference='''
def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    lead = follow = dummy
    for _ in range(n):
        lead = lead.next
    while lead.next:
        lead = lead.next
        follow = follow.next
    follow.next = follow.next.next
    return dummy.next
''',
        oracle=LIST_HELPERS + '''
def removeNthFromEnd(head, n):
    values = _values(head)
    del values[len(values) - n]
    return _build(values)
''',
    ),
    dict(
        slug="swap-nodes-in-pairs", topics=["linked-list"], entry="swapPairs",
        params=[("head", "linked-list")], returns="linked-list",
        summary=summary("每两个相邻节点交换一次位置（交换节点本身，不能只改值），返回新的头节点。", "Swap every two adjacent nodes by relinking them, not by changing values, and return the new head."),
        constraints=[("0 ≤ 节点数 ≤ 100，0 ≤ Node.val ≤ 100", "0 ≤ nodes ≤ 100, 0 ≤ Node.val ≤ 100")],
        hints=[("交换一对节点 a、b 时，需要改动哪几个指针？", "Swapping a pair a, b changes which pointers?"),
               ("需要前驱 prev：prev.next = b，a.next = b.next，b.next = a。", "You need the predecessor prev: prev.next = b, a.next = b.next, b.next = a."),
               ("从哑节点开始，每次处理一对后 prev 移到 a；剩下不足两个节点时停止。", "Start from a dummy node; after each pair move prev to a; stop when fewer than two nodes remain.")],
        explanation=("哑节点 + 每次重连三个指针，逐对推进。时间 O(n)，空间 O(1)。",
                     "A dummy node and three relinks per pair, advancing pair by pair. O(n) time, O(1) space."),
        boundary=[[[]], [[1]], [[1, 2]], [[1, 2, 3]]],
        inputs=[{"type": "linked-list", "minLength": 0, "maxLength": 100, "smallMaxLength": 8, "largeLength": 100, "min": 0, "max": 100}],
        reference='''
def swapPairs(head):
    dummy = prev = ListNode(0, head)
    while prev.next and prev.next.next:
        a, b = prev.next, prev.next.next
        prev.next, a.next, b.next = b, b.next, a
        prev = a
    return dummy.next
''',
        oracle=LIST_HELPERS + '''
def swapPairs(head):
    values = _values(head)
    for i in range(0, len(values) - 1, 2):
        values[i], values[i + 1] = values[i + 1], values[i]
    return _build(values)
''',
    ),
    dict(
        slug="reverse-nodes-in-k-group", topics=["linked-list"], entry="reverseKGroup",
        params=[("head", "linked-list"), ("k", "int")], returns="linked-list",
        summary=summary("每 k 个节点一组进行翻转，最后不足 k 个的节点保持原顺序。只能改变节点连接，不能只改值。",
                        "Reverse the list in groups of k nodes; a final group shorter than k keeps its order. Relink nodes rather than changing values."),
        constraints=[("1 ≤ k ≤ n ≤ 5000，0 ≤ Node.val ≤ 1000；进阶：O(1) 额外空间", "1 ≤ k ≤ n ≤ 5000, 0 ≤ Node.val ≤ 1000; follow-up: O(1) extra space")],
        hints=[("先检查从当前位置开始是否还有 k 个节点。", "First check whether k nodes remain from the current position."),
               ("一组内部的翻转与“反转链表”相同；关键是翻转后与前后两部分重新接上。", "Reversing inside a group is plain list reversal; the key is reconnecting it to the parts before and after."),
               ("维护 groupPrev（上一组的尾）；翻转后，原组头变成组尾，把 groupPrev.next 指向新组头，再把 groupPrev 移到原组头。", "Keep groupPrev, the tail of the previous group; after reversal the old group head becomes the tail, so point groupPrev.next at the new head and move groupPrev to the old head.")],
        explanation=("逐组处理：确认够 k 个后原地翻转这一段，再把它接回前后部分。每个节点被访问常数次，时间 O(n)，空间 O(1)。",
                     "Group by group: once k nodes are confirmed, reverse that segment in place and splice it back. Each node is touched a constant number of times, O(n) time, O(1) space."),
        boundary=[[[1], 1], [[1, 2], 2], [[1, 2, 3], 2], [[1, 2, 3], 3], [[1, 2, 3, 4, 5], 1]],
        inputs=[{"type": "linked-list", "minLength": 1, "maxLength": 5000, "smallMaxLength": 9, "largeLength": 5000, "min": 0, "max": 1000, "smallMin": 0, "smallMax": 9},
                {"type": "int", "min": 1, "max": 1}],
        hooks='''
def adjust(args, rng, size):
    values, _ = args
    return [values, rng.randint(1, len(values))]
''',
        reference='''
def reverseKGroup(head, k):
    dummy = ListNode(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if kth is None:
                return dummy.next
        group_next = kth.next
        prev, cur = group_next, group_prev.next
        while cur is not group_next:
            cur.next, prev, cur = prev, cur, cur.next
        old_head = group_prev.next
        group_prev.next = kth
        group_prev = old_head
''',
        oracle=LIST_HELPERS + '''
def reverseKGroup(head, k):
    values = _values(head)
    out = []
    for i in range(0, len(values), k):
        chunk = values[i:i + k]
        out.extend(chunk[::-1] if len(chunk) == k else chunk)
    return _build(out)
''',
    ),
    dict(
        slug="copy-list-with-random-pointer", topics=["linked-list"], entry="copyRandomList",
        params=[("head", "json")], returns="json", shape={"kind": "harness", "name": "random-list"},
        summary=summary("链表的每个节点除了 next 还有一个 random 指针（可指向任意节点或 null）。返回这个链表的深拷贝：新链表中的所有节点都是新建的。输入输出用 [val, random 指向的下标] 表示。",
                        "Each node has a random pointer to any node or null in addition to next. Return a deep copy in which every node is newly created. Inputs and outputs are written as [val, index the random pointer targets]."),
        constraints=[("0 ≤ 节点数 ≤ 1000，-10⁴ ≤ Node.val ≤ 10⁴", "0 ≤ nodes ≤ 1000, -10⁴ ≤ Node.val ≤ 10⁴")],
        hints=[("难点在于：复制某个节点的 random 时，它指向的节点可能还没被复制。", "The difficulty: when copying a node's random pointer, its target may not be copied yet."),
               ("先建立“原节点 → 新节点”的映射，再第二遍连接 next 和 random。", "First build a map from original to copy, then connect next and random in a second pass."),
               ("O(1) 额外空间：把每个新节点插在原节点后面，random 就是 orig.random.next，最后拆成两条链表。", "O(1) extra space: weave each copy right after its original, so a copy's random is orig.random.next, then split the lists.")],
        explanation=("哈希表映射原节点到新节点，两遍完成 next 和 random 的连接。时间 O(n)，空间 O(n)；交织法可降到 O(1) 额外空间。",
                     "A hash map from originals to copies; two passes connect next and random. O(n) time and space; weaving the copies into the original list reduces extra space to O(1)."),
        boundary=[[[]], [[[1, None]]], [[[1, 0]]], [[[1, 1], [2, 1]]], [[[3, None], [3, 0], [3, None]]]],
        inputs=[{"type": "json"}],
        hooks='''
def adjust(args, rng, size):
    n = rng.randint(0, 7) if size == "small" else 1000
    return [[[rng.randint(-10000, 10000), (rng.randrange(n) if rng.random() < 0.7 else None)] for _ in range(n)]]
''',
        reference='''
def copyRandomList(head):
    clones = {None: None}
    node = head
    while node:
        clones[node] = Node(node.val)
        node = node.next
    node = head
    while node:
        clones[node].next = clones[node.next]
        clones[node].random = clones[node.random]
        node = node.next
    return clones[head]
''',
        oracle='''
def copyRandomList(head):
    originals = []
    node = head
    while node:
        originals.append(node)
        node = node.next
    copies = [Node(node.val) for node in originals]
    for i, node in enumerate(originals):
        copies[i].next = copies[i + 1] if i + 1 < len(copies) else None
        if node.random is not None:
            for j, target in enumerate(originals):
                if target is node.random:
                    copies[i].random = copies[j]
    return copies[0] if copies else None
''',
    ),
    dict(
        slug="sort-list", topics=["linked-list"], entry="sortList",
        params=[("head", "linked-list")], returns="linked-list",
        summary=summary("把链表按升序排序，返回排序后的头节点。要求 O(n log n) 时间。", "Sort the linked list in ascending order and return its head, in O(n log n) time."),
        constraints=[("0 ≤ 节点数 ≤ 5×10⁴，-10⁵ ≤ Node.val ≤ 10⁵", "0 ≤ nodes ≤ 5×10⁴, -10⁵ ≤ Node.val ≤ 10⁵")],
        hints=[("哪种 O(n log n) 排序适合链表，不需要随机访问？", "Which O(n log n) sort suits a linked list, since it needs no random access?"),
               ("归并排序：用快慢指针找中点断开，分别排序两半，再合并两个有序链表。", "Merge sort: split at the middle with slow and fast pointers, sort both halves, and merge the two sorted lists."),
               ("自底向上的归并可以做到 O(1) 额外空间：按 1、2、4… 的长度两两合并。", "Bottom-up merge sort reaches O(1) extra space: merge runs of length 1, 2, 4, and so on.")],
        explanation=("链表归并排序：拆分只需快慢指针，合并复用“合并两个有序链表”。时间 O(n log n)，递归栈 O(log n)。",
                     "Linked-list merge sort: splitting uses slow and fast pointers and merging reuses the two-sorted-lists merge. O(n log n) time, O(log n) recursion."),
        boundary=[[[]], [[1]], [[2, 1]], [[1, 1, 1]], [[3, -1, 2, -1]]],
        inputs=[{"type": "linked-list", "minLength": 0, "smallMaxLength": 10, "largeLength": 20000, "min": -100000, "max": 100000, "smallMin": -9, "smallMax": 9}],
        reference='''
def sortList(head):
    if head is None or head.next is None:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    right = slow.next
    slow.next = None
    left = sortList(head)
    right = sortList(right)
    dummy = tail = ListNode(0)
    while left and right:
        if left.val <= right.val:
            tail.next, left = left, left.next
        else:
            tail.next, right = right, right.next
        tail = tail.next
    tail.next = left or right
    return dummy.next
''',
        oracle=LIST_HELPERS + '''
def sortList(head):
    values = _values(head)
    for i in range(1, len(values)):
        j = i
        while j > 0 and values[j - 1] > values[j]:
            values[j - 1], values[j] = values[j], values[j - 1]
            j -= 1
    return _build(values)
''',
    ),
    dict(
        slug="merge-k-sorted-lists", topics=["linked-list"], entry="mergeKLists",
        params=[("lists", "linked-list[]")], returns="linked-list",
        summary=summary("给定 k 个升序链表，把它们合并成一个升序链表返回。", "Given k sorted linked lists, merge them into one sorted list and return it."),
        constraints=[("0 ≤ k ≤ 10⁴，所有链表节点总数 ≤ 10⁴，-10⁴ ≤ Node.val ≤ 10⁴", "0 ≤ k ≤ 10⁴, at most 10⁴ nodes in total, -10⁴ ≤ Node.val ≤ 10⁴")],
        hints=[("每次都要从 k 个链表头中取最小的那个。怎样快速找到最小值？", "Each step takes the smallest of k heads. How do you find it quickly?"),
               ("用最小堆保存各链表当前的头节点（值、编号、节点），弹出最小者并把它的 next 放回堆。", "Keep the current heads in a min-heap of (value, index, node); pop the smallest and push its next."),
               ("也可以分治：两两合并，log k 轮完成。", "Alternatively divide and conquer: merge in pairs over log k rounds.")],
        explanation=("最小堆维护 k 个候选头节点，每次取出最小者，总时间 O(N log k)，空间 O(k)；分治两两合并具有同样的复杂度。",
                     "A min-heap holds the k candidate heads and yields the smallest each time, O(N log k) time and O(k) space; pairwise divide and conquer has the same bound."),
        boundary=[[[]], [[[]]], [[[], [1]]], [[[1], [1], [1]]], [[[-10000], [10000]]]],
        inputs=[{"type": "linked-list[]", "minLength": 0, "smallMaxLength": 4, "largeLength": 2000, "row": {"minLength": 0, "maxLength": 5, "smallMaxLength": 4, "largeLength": 5}, "min": -10000, "max": 10000, "smallMin": -6, "smallMax": 6, "sorted": "asc"}],
        reference='''
import heapq
def mergeKLists(lists):
    heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
    heapq.heapify(heap)
    dummy = tail = ListNode(0)
    while heap:
        _, i, node = heapq.heappop(heap)
        tail.next = node
        tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next
''',
        oracle=LIST_HELPERS + '''
def mergeKLists(lists):
    values = []
    for head in lists:
        values.extend(_values(head))
    return _build(sorted(values))
''',
    ),
]
