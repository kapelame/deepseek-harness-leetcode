def mergeDistinct(list1, list2):
    dummy = tail = ListNode(0)
    while list1 or list2:
        if list2 is None or (list1 is not None and list1.val <= list2.val):
            node, list1 = list1, list1.next
        else:
            node, list2 = list2, list2.next
        if tail is dummy or tail.val < node.val:
            tail.next = node
            tail = node
    tail.next = None
    return dummy.next
