def copyRandomList(head):
    originals = []
    node = head
    while node:
        originals.append(node)
        node = node.next
    copies = [Node(node.val) for node in originals]
    for i, node in enumerate(originals):
        copies[i].next = copies[i + 1] if i + 1 < len(copies) else None
        if node.random is not None:
            for j, target in enumerate(originals):
                if target is node.random:
                    copies[i].random = copies[j]
    return copies[0] if copies else None
