def copyRandomList(head):
    clones = {None: None}
    node = head
    while node:
        clones[node] = Node(node.val)
        node = node.next
    node = head
    while node:
        clones[node].next = clones[node.next]
        clones[node].random = clones[node.random]
        node = node.next
    return clones[head]
