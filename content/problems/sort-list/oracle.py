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

def sortList(head):
    values = _values(head)
    for i in range(1, len(values)):
        j = i
        while j > 0 and values[j - 1] > values[j]:
            values[j - 1], values[j] = values[j], values[j - 1]
            j -= 1
    return _build(values)
