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

def reverseBetween(head, left, right):
    values = _values(head)
    values[left - 1:right] = values[left - 1:right][::-1]
    return _build(values)
