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
