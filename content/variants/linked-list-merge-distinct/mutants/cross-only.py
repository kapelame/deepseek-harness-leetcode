def mergeDistinct(list1, list2):
    dummy = tail = ListNode(0)
    while list1 and list2:
        if list1.val == list2.val:
            tail.next = list1
            list1, list2 = list1.next, list2.next
        elif list1.val < list2.val:
            tail.next, list1 = list1, list1.next
        else:
            tail.next, list2 = list2, list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next
