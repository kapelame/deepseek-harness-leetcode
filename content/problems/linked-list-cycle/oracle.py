def hasCycle(head):
    seen = []
    while head:
        for node in seen:
            if node is head:
                return True
        seen.append(head)
        head = head.next
    return False
