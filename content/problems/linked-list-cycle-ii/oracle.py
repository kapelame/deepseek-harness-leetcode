def detectCycle(head):
    seen = []
    while head:
        for node in seen:
            if node is head:
                return head
        seen.append(head)
        head = head.next
    return None
