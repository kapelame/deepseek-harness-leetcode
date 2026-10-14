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

def addTwoNumbers(l1, l2):
    def number(head):
        return int("".join(str(d) for d in reversed(_values(head))))
    return _build([int(c) for c in reversed(str(number(l1) + number(l2)))])
