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
