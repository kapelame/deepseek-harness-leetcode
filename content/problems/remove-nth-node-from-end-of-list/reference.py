def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    lead = follow = dummy
    for _ in range(n):
        lead = lead.next
    while lead.next:
        lead = lead.next
        follow = follow.next
    follow.next = follow.next.next
    return dummy.next
