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

def swapPairs(head):
    values = _values(head)
    for i in range(0, len(values) - 1, 2):
        values[i], values[i + 1] = values[i + 1], values[i]
    return _build(values)
