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

def reverseKGroup(head, k):
    values = _values(head)
    out = []
    for i in range(0, len(values), k):
        chunk = values[i:i + k]
        out.extend(chunk[::-1] if len(chunk) == k else chunk)
    return _build(out)
