def reverseList(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev
