/**
 * Validates the relationship input array and builds hierarchies (trees/cycles).
 * 
 * Rules:
 * 1. Trim whitespace before validation.
 * 2. Valid format: X->Y where X and Y are single uppercase letters A-Z.
 * 3. Invalid entries:
 *    - Not matching format
 *    - Self loops (A->A)
 *    - Missing parent/child
 *    - Wrong separators
 *    - Multi-character nodes
 * 4. Detect duplicate edges. Use first occurrence only. Store in duplicate_edges.
 * 5. Handle multi-parent nodes: First parent wins. Later parent relationships silently ignored.
 * 6. Build multiple independent trees.
 * 7. Detect cycles.
 * 
 * Response formats:
 * - Cycle component: { root, tree: {}, has_cycle: true }
 * - Non-cyclic tree: { root, tree: { parent: [children...] }, depth }
 * 
 * Summary:
 * - total_trees, total_cycles, largest_tree_root
 * - Tie-breaker for largest_tree_root:
 *   1. Greater depth wins.
 *   2. Lexicographically smaller root wins.
 */
export function processRelationships(data) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const active_edges = []; // array of { parent, child }
  const seen_edges = new Set(); // store "parent->child" normalized
  const child_to_parent = new Map(); // child -> parent to detect multi-parent

  if (Array.isArray(data)) {
    for (const entry of data) {
      if (entry === null || entry === undefined) {
        invalid_entries.push("");
        continue;
      }
      
      const entryStr = String(entry);
      const trimmed = entryStr.trim();
      
      // Validation regex: Must be exactly X->Y where X and Y are uppercase letters
      const formatRegex = /^[A-Z]->[A-Z]$/;
      if (!formatRegex.test(trimmed)) {
        invalid_entries.push(trimmed);
        continue;
      }
      
      const [parent, child] = trimmed.split('->');
      
      // Self loop validation
      if (parent === child) {
        invalid_entries.push(trimmed);
        continue;
      }
      
      // Duplicate edge validation (based on trimmed relationship)
      const edgeKey = `${parent}->${child}`;
      if (seen_edges.has(edgeKey)) {
        duplicate_edges.push(trimmed);
        continue;
      }
      seen_edges.add(edgeKey);
      
      // Multi-parent validation
      if (child_to_parent.has(child)) {
        // First parent wins. Later parent relationships silently ignored.
        continue;
      }
      
      child_to_parent.set(child, parent);
      active_edges.push({ parent, child });
    }
  }

  // Build the graph of active edges
  const allNodes = new Set();
  const undirectedAdj = {};
  
  for (const edge of active_edges) {
    allNodes.add(edge.parent);
    allNodes.add(edge.child);
    
    if (!undirectedAdj[edge.parent]) undirectedAdj[edge.parent] = [];
    if (!undirectedAdj[edge.child]) undirectedAdj[edge.child] = [];
    
    undirectedAdj[edge.parent].push(edge.child);
    undirectedAdj[edge.child].push(edge.parent);
  }
  
  // Find connected components in the undirected representation of active edges
  const visited = new Set();
  const components = [];
  
  for (const node of allNodes) {
    if (!visited.has(node)) {
      const compNodes = [];
      const queue = [node];
      visited.add(node);
      
      while (queue.length > 0) {
        const u = queue.shift();
        compNodes.push(u);
        
        for (const v of undirectedAdj[u] || []) {
          if (!visited.has(v)) {
            visited.add(v);
            queue.push(v);
          }
        }
      }
      components.push(compNodes);
    }
  }
  
  const hierarchies = [];
  let total_trees = 0;
  let total_cycles = 0;
  let largestTree = null;
  
  for (const compNodes of components) {
    const nodeSet = new Set(compNodes);
    const compEdges = active_edges.filter(e => nodeSet.has(e.parent) && nodeSet.has(e.child));
    
    // In a component with in-degrees <= 1:
    // If edges === nodes, it contains a cycle.
    // If edges === nodes - 1, it's a tree.
    const hasCycle = compEdges.length === compNodes.length;
    
    if (hasCycle) {
      total_cycles++;
      const sortedNodes = [...compNodes].sort();
      const root = sortedNodes[0];
      
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
        nodeCount: compNodes.length // for comparison if needed (though largest_tree is only for non-cyclic trees)
      });
    } else {
      total_trees++;
      // Find the unique root (node with in-degree 0 in active edges)
      let root = null;
      for (const node of compNodes) {
        if (!child_to_parent.has(node)) {
          root = node;
          break;
        }
      }
      
      // Fallback (should not happen for a tree component)
      if (!root) {
        root = [...compNodes].sort()[0];
      }
      
      // Build the tree representation: parent -> list of sorted children
      const treeObj = {};
      for (const node of compNodes) {
        const children = compEdges
          .filter(e => e.parent === node)
          .map(e => e.child)
          .sort();
        if (children.length > 0) {
          treeObj[node] = children;
        }
      }
      
      // Calculate depth (number of nodes on longest path from root to leaf)
      function getDepth(currNode) {
        const children = treeObj[currNode] || [];
        if (children.length === 0) {
          return 1;
        }
        let maxChildDepth = 0;
        for (const child of children) {
          maxChildDepth = Math.max(maxChildDepth, getDepth(child));
        }
        return 1 + maxChildDepth;
      }
      
      const depth = getDepth(root);
      
      const hierarchyObj = {
        root,
        tree: treeObj,
        depth,
        nodeCount: compNodes.length
      };
      
      hierarchies.push(hierarchyObj);
      
      // Compare to find the largest tree
      if (!largestTree) {
        largestTree = hierarchyObj;
      } else {
        if (hierarchyObj.nodeCount > largestTree.nodeCount) {
          largestTree = hierarchyObj;
        } else if (hierarchyObj.nodeCount === largestTree.nodeCount) {
          if (hierarchyObj.depth > largestTree.depth) {
            largestTree = hierarchyObj;
          } else if (hierarchyObj.depth === largestTree.depth) {
            if (hierarchyObj.root < largestTree.root) {
              largestTree = hierarchyObj;
            }
          }
        }
      }
    }
  }
  
  // Sort hierarchies by root lexicographically so output order is stable
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));
  
  // Map hierarchies to the required API output format
  const finalHierarchies = hierarchies.map(h => {
    if (h.has_cycle) {
      return {
        root: h.root,
        tree: {},
        has_cycle: true
      };
    } else {
      return {
        root: h.root,
        tree: h.tree,
        depth: h.depth
      };
    }
  });
  
  const summary = {
    total_trees,
    total_cycles,
    largest_tree_root: largestTree ? largestTree.root : ""
  };
  
  return {
    hierarchies: finalHierarchies,
    invalid_entries,
    duplicate_edges,
    summary
  };
}
