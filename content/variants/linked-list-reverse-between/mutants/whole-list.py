def reverseBetween(head, left, right):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev
