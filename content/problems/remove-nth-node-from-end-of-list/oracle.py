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

def removeNthFromEnd(head, n):
    values = _values(head)
    del values[len(values) - n]
    return _build(values)
