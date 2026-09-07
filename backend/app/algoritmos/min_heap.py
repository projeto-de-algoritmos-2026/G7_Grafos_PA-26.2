class MinHeap:
    def __init__(self):
        self.heap = []
        self.pos_map = {}

    def is_empty(self):
        return len(self.heap) == 0

    def parent(self, i):
        return (i - 1) // 2

    def left_child(self, i):
        return 2 * i + 1

    def right_child(self, i):
        return 2 * i + 2

    def swap(self, i, j):
        node_i = self.heap[i]
        node_j = self.heap[j]

        self.pos_map[node_i['node']] = j
        self.pos_map[node_j['node']] = i

        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]

    def shift_up(self, i):
            while i > 0:
                parent_idx = self.parent(i)
                
                if self.heap[i]['dist'] < self.heap[parent_idx]['dist']:
                    self.swap(i, parent_idx)
                    i = parent_idx
                else:
                    break
    def heapify(self, i):
            size = len(self.heap)
            
            while True:
                smallest = i
                left = self.left_child(i)
                right = self.right_child(i)

                if left < size and self.heap[left]['dist'] < self.heap[smallest]['dist']:
                    smallest = left

                if right < size and self.heap[right]['dist'] < self.heap[smallest]['dist']:
                    smallest = right

                if smallest != i:
                    self.swap(i, smallest)
                    i = smallest
                else:
                    break

    def insert(self, node_id, dist):
            node = {'node': node_id, 'dist': dist}
            self.heap.append(node)
            
            current_idx = len(self.heap) - 1
            self.pos_map[node_id] = current_idx
            
            self.shift_up(current_idx)

    def extract_min(self):
            if self.is_empty():
                return None
                
            min_node = self.heap[0]
            last_node = self.heap.pop()
            del self.pos_map[min_node['node']]
            
            if not self.is_empty():
                self.heap[0] = last_node
                self.pos_map[last_node['node']] = 0
                self.heapify(0)
                
            return min_node

    def decrease_key(self, node_id, new_dist):
            if node_id in self.pos_map:
                idx = self.pos_map[node_id]
                if new_dist < self.heap[idx]['dist']:
                    self.heap[idx]['dist'] = new_dist
                    self.shift_up(idx)
