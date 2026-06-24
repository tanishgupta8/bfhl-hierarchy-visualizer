import { processRelationships } from './utils/hierarchy.js';

const testCases = [
  {
    name: 'Sample Case (Valid Trees)',
    data: ['A->B', 'A->C', 'B->D']
  },
  {
    name: 'Self Loops and Invalid Formats',
    data: ['A->A', 'B->C', 'XY->Z', 'P->QR', 'A->', '->B', 'C-D', '   E->F   ']
  },
  {
    name: 'Duplicate Edges',
    data: ['A->B', 'A->C', 'A->B', ' A->C  ', 'B->D']
  },
  {
    name: 'Multi-Parent Overrides (First Parent Wins)',
    data: ['A->C', 'B->C', 'A->B']
  },
  {
    name: 'Cycle Component Case 1 (Simple Loop)',
    data: ['A->B', 'B->C', 'C->A']
  },
  {
    name: 'Cycle Component Case 2 (Cycle with branching)',
    data: ['A->B', 'B->C', 'C->A', 'A->D']
  },
  {
    name: 'Mixed Trees, Cycles, and Multi-parent',
    data: [
      'A->B', 'B->C', // Tree 1 (A->B->C)
      'D->E', 'E->F', 'F->D', // Cycle 1 (D->E->F->D)
      'G->H', 'I->H', // Multi-parent (G->H wins, I->H ignored)
      'X->Y', 'Z->Y'  // Multi-parent (X->Y wins, Z->Y ignored)
    ]
  }
];

console.log('--- STARTING HIERARCHY ENGINE TESTS ---\n');

testCases.forEach((tc, idx) => {
  console.log(`Test Case ${idx + 1}: ${tc.name}`);
  console.log('Input data:', JSON.stringify(tc.data));
  
  const result = processRelationships(tc.data);
  console.log('Result:');
  console.log(JSON.stringify(result, null, 2));
  console.log('\n----------------------------------------\n');
});

console.log('--- TESTS COMPLETE ---');
