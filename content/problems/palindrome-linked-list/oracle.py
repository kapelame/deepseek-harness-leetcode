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

def isPalindrome(head):
    values = _values(head)
    return all(values[i] == values[-1 - i] for i in range(len(values)))
