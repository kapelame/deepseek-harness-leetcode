def getIntersectionNode(headA, headB):
    nodes = []
    while headA:
        nodes.append(headA)
        headA = headA.next
    while headB:
        for node in nodes:
            if node is headB:
                return headB
        headB = headB.next
    return None
